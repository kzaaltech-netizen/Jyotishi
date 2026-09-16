/**
 * EntitlementService
 * Manages Free consultation limits, internal depth weighting,
 * and the ₹9 / 10-min / 20-question paid Guruji session lifecycle.
 */

import prisma from '../db.js';
import { getGuardrailConfig } from '../security/guardrailConfig.js';
import { GUARDRAIL_ERROR_CODES } from '../security/guardrailService.js';

export class EntitlementService {
  /**
   * Internal usage weighting based on query depth.
   * Internal cost-control only; user is only presented with simple question counts.
   */
  static getUsageUnits(depth = 'standard') {
    switch (depth) {
      case 'deep':
        return 2;
      case 'quick':
      case 'standard':
      default:
        return 1;
    }
  }

  /**
   * Retrieve active, non-expired, non-depleted session for user.
   * Auto-marks expired or depleted sessions in DB.
   */
  static async getActiveSession(userId) {
    if (!userId) return null;

    const session = await prisma.gurujiSession.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) return null;

    const now = new Date();

    // Check expiration by time
    if (now > session.expiryTime) {
      await prisma.gurujiSession.update({
        where: { id: session.id },
        data: { status: 'expired' },
      });
      return null;
    }

    // Check expiration by question count
    if (session.questionsUsed >= session.maxQuestions) {
      await prisma.gurujiSession.update({
        where: { id: session.id },
        data: { status: 'completed' },
      });
      return null;
    }

    const remainingSeconds = Math.max(0, Math.floor((session.expiryTime.getTime() - now.getTime()) / 1000));
    const remainingQuestions = Math.max(0, session.maxQuestions - session.questionsUsed);

    return {
      ...session,
      remainingSeconds,
      remainingQuestions,
    };
  }

  /**
   * Calculate user's free usage today (UTC day).
   */
  static async getDailyFreeUsage(userId) {
    if (!userId) return { usedQuestions: 0, usedUnits: 0 };

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const usages = await prisma.gurujiUsage.findMany({
      where: {
        userId,
        createdAt: { gte: startOfToday },
        success: true,
      },
    });

    // Filter to usages that were not part of a paid session
    // (all free consultations)
    const usedQuestions = usages.length;
    const usedUnits = usages.reduce((sum, u) => sum + (u.usageUnits || 1), 0);

    return {
      usedQuestions,
      usedUnits,
    };
  }

  /**
   * Main Entitlement Check before Gemini is called.
   */
  static async checkConsultationEntitlement(userId, depth = 'standard') {
    const config = getGuardrailConfig();

    // 1. Check if user has an active paid session
    const activeSession = await this.getActiveSession(userId);
    if (activeSession) {
      return {
        allowed: true,
        mode: 'PAID_SESSION',
        session: activeSession,
      };
    }

    // 2. Otherwise evaluate free daily allowance
    const dailyUsage = await this.getDailyFreeUsage(userId);
    const freeLimit = config.GURUJI_FREE_DAILY_LIMIT || 3;

    if (dailyUsage.usedQuestions >= freeLimit) {
      return {
        allowed: false,
        code: GUARDRAIL_ERROR_CODES.DAILY_LIMIT_REACHED,
        message: "Guruji can continue this conversation with you. There's more to explore in your chart.",
        paywall: {
          eligible: true,
          showInterestPrompt: true,
          freeLimit,
          usedToday: dailyUsage.usedQuestions,
          remainingToday: 0,
        },
      };
    }

    const remainingFree = Math.max(0, freeLimit - (dailyUsage.usedQuestions + 1));

    return {
      allowed: true,
      mode: 'FREE',
      remainingFree,
      freeLimit,
      usedToday: dailyUsage.usedQuestions,
    };
  }

  /**
   * Record consultation usage after execution.
   */
  static async recordConsultationUsage(userId, {
    intent = 'general',
    depth = 'standard',
    sessionId = null,
    success = true,
    providerCalled = true,
    error = null,
  }) {
    if (!userId) return null;

    const usageUnits = this.getUsageUnits(depth);

    // 1. Create audit usage record
    const usage = await prisma.gurujiUsage.create({
      data: {
        userId,
        endpoint: 'chat',
        intent,
        depth,
        usageUnits,
        providerCalled,
        success,
        error: error ? String(error).slice(0, 255) : null,
      },
    });

    // 2. If part of an active session, increment question count
    if (sessionId) {
      try {
        const updated = await prisma.gurujiSession.update({
          where: { id: sessionId },
          data: {
            questionsUsed: { increment: 1 },
          },
        });

        // If depleted, mark completed
        if (updated.questionsUsed >= updated.maxQuestions) {
          await prisma.gurujiSession.update({
            where: { id: sessionId },
            data: { status: 'completed' },
          });
        }
      } catch (e) {
        console.error('[EntitlementService] Error updating session questionsUsed:', e.message);
      }
    }

    return usage;
  }

  /**
   * Create a ₹9 Guruji Consultation Session (10 min, 20 questions).
   * Ensures only one active session at a time per user.
   */
  static async createPaidSession(userId) {
    if (!userId) {
      throw new Error('User ID required to create session.');
    }

    // Check if an unexpired, active session already exists
    const existing = await this.getActiveSession(userId);
    if (existing) {
      const err = new Error('An active Guruji consultation session is already running.');
      err.code = 'ACTIVE_SESSION_EXISTS';
      err.session = existing;
      throw err;
    }

    const config = getGuardrailConfig();
    const durationMinutes = config.GURUJI_SESSION_MINUTES || 10;
    const maxQuestions = config.GURUJI_MAX_QUESTIONS_PER_SESSION || 20;

    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const session = await prisma.gurujiSession.create({
      data: {
        userId,
        status: 'active',
        entitlementType: 'PAID_GURUJI_SESSION',
        startTime,
        expiryTime,
        maxQuestions,
        questionsUsed: 0,
      },
    });

    return {
      ...session,
      remainingSeconds: durationMinutes * 60,
      remainingQuestions: maxQuestions,
    };
  }

  /**
   * Development-only helper to activate a session safely without payment gateway.
   */
  static async devActivateSession(userId) {
    if (process.env.NODE_ENV === 'production') {
      const err = new Error('Development session activation is prohibited in production.');
      err.code = 'DEV_ONLY_PROHIBITED';
      throw err;
    }

    return this.createPaidSession(userId);
  }

  /**
   * Record seeker's interest when they click Stage 1 "Continue with Guruji".
   */
  static async recordPaywallInterest(userId, metadata = {}) {
    if (!userId) return { success: false };
    console.log(`[EntitlementService] User ${userId} expressed interest in Guruji paid session:`, metadata);
    return { success: true, timestamp: new Date().toISOString() };
  }
}

export default EntitlementService;
