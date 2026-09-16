import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import AIOrchestrator, { AI_ERROR_CODES } from '../services/aiOrchestrator.js';
import prisma from '../db.js';
import GuardrailService, { GUARDRAIL_ERROR_CODES } from '../security/guardrailService.js';
import EntitlementService from '../services/entitlementService.js';
import { classifyIntent } from '../ai/orchestrator/intentClassifier.js';
import { getGuardrailConfig } from '../security/guardrailConfig.js';

const router = Router();
router.use(requireAuth);

async function isUserPremium(userId) {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) return false;
    if (sub.status !== 'active') return false;
    if (new Date(sub.endDate) < new Date()) return false;
    return true;
  } catch (e) {
    return false;
  }
}

const PREMIUM_PATTERNS = /\b(d2|d10|d11|hora|dashamsha|labhamsa|transit)\b/i;

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// Fully protected by GuardrailService & EntitlementService before Gemini execution
router.post('/chat', async (req, res, next) => {
  let lockAcquired = false;
  let classifiedIntent = 'general';
  let classifiedDepth = 'standard';
  let activeSessionId = null;

  try {
    const { mode = 'general', message, provider = 'gemini', chartType } = req.body;

    // 1. Input message size & empty validation
    const inputCheck = GuardrailService.validateInputMessage(message);
    if (!inputCheck.valid) {
      return res.status(400).json({
        success: false,
        code: inputCheck.code,
        message: inputCheck.message,
      });
    }
    const sanitizedMessage = inputCheck.sanitized;

    // 2. Global emergency stop & kill switch check
    const globalCheck = GuardrailService.checkGlobalStatus();
    if (!globalCheck.allowed) {
      return res.status(503).json({
        success: false,
        code: globalCheck.code,
        message: globalCheck.message,
      });
    }

    // 3. Global provider daily limit check
    const providerLimitCheck = GuardrailService.checkGlobalProviderLimit(provider);
    if (!providerLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        code: providerLimitCheck.code,
        message: providerLimitCheck.message,
      });
    }

    // 4. Per-user rate limiting (max 1 req/sec)
    const rateCheck = GuardrailService.checkRateLimit(req.userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        code: rateCheck.code,
        message: rateCheck.message,
        retryAfterMs: rateCheck.retryAfterMs,
      });
    }

    // 5. Concurrency / In-Flight Request Lock
    const lockCheck = GuardrailService.acquireLock(req.userId, sanitizedMessage);
    if (!lockCheck.acquired) {
      return res.status(429).json({
        success: false,
        code: lockCheck.code,
        message: lockCheck.message,
      });
    }
    lockAcquired = true;

    // 6. Premium divisional chart gate
    const cleanChartType = String(chartType || '').toLowerCase();
    const isPremiumChart = ['d2', 'd10', 'd11', 'transit'].includes(cleanChartType) || PREMIUM_PATTERNS.test(sanitizedMessage);
    if (isPremiumChart) {
      const premium = await isUserPremium(req.userId);
      if (!premium) {
        return res.json({
          success: false,
          reply: 'This insight requires Premium because it depends on advanced divisional charts.',
          isPremiumBlocked: true,
        });
      }
    }

    // 7. Classify intent & depth for entitlement weighting
    const classification = classifyIntent(sanitizedMessage);
    classifiedIntent = classification.intent;
    classifiedDepth = classification.depth;

    // 8. Entitlement & Daily Quota Evaluation
    const entitlement = await EntitlementService.checkConsultationEntitlement(req.userId, classifiedDepth);
    if (!entitlement.allowed) {
      return res.status(403).json({
        success: false,
        code: entitlement.code,
        message: entitlement.message,
        paywall: entitlement.paywall,
      });
    }

    if (entitlement.mode === 'PAID_SESSION' && entitlement.session) {
      activeSessionId = entitlement.session.id;
    }

    // 9. Execute Consultation through AIOrchestrator
    const result = await AIOrchestrator.handleChat({
      userId: req.userId,
      mode,
      message: sanitizedMessage,
      providerName: provider,
    });

    // 10. Record usage and decrement quota
    await EntitlementService.recordConsultationUsage(req.userId, {
      intent: classifiedIntent,
      depth: classifiedDepth,
      sessionId: activeSessionId,
      success: true,
      providerCalled: !result.cached,
    });

    GuardrailService.incrementGlobalProviderCounter(provider);

    // Calculate remaining session counters
    let sessionPayload = null;
    if (entitlement.mode === 'PAID_SESSION' && entitlement.session) {
      sessionPayload = {
        active: true,
        remainingSeconds: entitlement.session.remainingSeconds,
        remainingQuestions: Math.max(0, entitlement.session.remainingQuestions - 1),
      };
    }

    res.json({
      success: true,
      reply: result.reply,
      formatted: result.formatted,
      newBalance: result.newBalance,
      agent: result.agent,
      session: sessionPayload,
      remainingFree: entitlement.mode === 'FREE' ? entitlement.remainingFree : null,
    });
  } catch (err) {
    if (classifiedIntent) {
      await EntitlementService.recordConsultationUsage(req.userId, {
        intent: classifiedIntent,
        depth: classifiedDepth,
        sessionId: activeSessionId,
        success: false,
        providerCalled: true,
        error: err.message,
      }).catch(() => {});
    }

    if (err.code === AI_ERROR_CODES.INSUFFICIENT_TOKENS) {
      return res.status(402).json({ success: false, error: 'INSUFFICIENT_TOKENS', message: 'Insufficient token balance.' });
    }
    if (err.code === AI_ERROR_CODES.NO_CHART) {
      return res.status(400).json({ success: false, error: 'NO_CHART', message: err.message });
    }
    if (err.code === AI_ERROR_CODES.INVALID_AGENT) {
      return res.status(400).json({ success: false, error: 'INVALID_AGENT', message: err.message });
    }
    if (err.code === AI_ERROR_CODES.TIMEOUT) {
      return res.status(504).json({ success: false, error: 'TIMEOUT', message: err.message });
    }
    next(err);
  } finally {
    if (lockAcquired) {
      GuardrailService.releaseLock(req.userId);
    }
  }
});

// ─── GET /api/ai/guruji/session-status ─────────────────────────────────────────
// Returns active session details or remaining daily free question count
router.get('/guruji/session-status', async (req, res, next) => {
  try {
    const activeSession = await EntitlementService.getActiveSession(req.userId);
    if (activeSession) {
      return res.json({
        active: true,
        mode: 'PAID_SESSION',
        session: {
          id: activeSession.id,
          remainingSeconds: activeSession.remainingSeconds,
          remainingQuestions: activeSession.remainingQuestions,
          maxQuestions: activeSession.maxQuestions,
          questionsUsed: activeSession.questionsUsed,
          expiryTime: activeSession.expiryTime,
        },
      });
    }

    const config = getGuardrailConfig();
    const freeLimit = config.GURUJI_FREE_DAILY_LIMIT || 3;
    const dailyUsage = await EntitlementService.getDailyFreeUsage(req.userId);
    const remainingFree = Math.max(0, freeLimit - dailyUsage.usedQuestions);

    res.json({
      active: false,
      mode: 'FREE',
      remainingFree,
      freeLimit,
      usedToday: dailyUsage.usedQuestions,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/guruji/session-interest ──────────────────────────────────────
// Logs seeker's interest when they click Stage 1 "Continue with Guruji"
router.post('/guruji/session-interest', async (req, res, next) => {
  try {
    const result = await EntitlementService.recordPaywallInterest(req.userId, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/guruji/dev-activate-session ──────────────────────────────────
// Development/Test activator for ₹9 Guruji session (Strictly non-production)
router.post('/guruji/dev-activate-session', async (req, res, next) => {
  try {
    const session = await EntitlementService.devActivateSession(req.userId);
    res.json({
      success: true,
      message: 'Development Guruji session activated successfully.',
      session,
    });
  } catch (err) {
    if (err.code === 'DEV_ONLY_PROHIBITED') {
      return res.status(403).json({ success: false, error: err.code, message: err.message });
    }
    if (err.code === 'ACTIVE_SESSION_EXISTS') {
      return res.status(409).json({ success: false, error: err.code, message: err.message, session: err.session });
    }
    next(err);
  }
});

// ─── POST /api/ai/chat/stream ──────────────────────────────────────────────────
// Stream AI response using Server-Sent Events (SSE)
router.post('/chat/stream', async (req, res, next) => {
  try {
    const { mode = 'general', message, provider = 'gemini' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and cannot be empty.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await AIOrchestrator.handleChatStream({
      userId: req.userId,
      mode,
      message,
      providerName: provider,
      onChunk: (chunkText) => {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      },
    });

    res.write(`data: ${JSON.stringify({ done: true, reply: result.reply, formatted: result.formatted, newBalance: result.newBalance })}\n\n`);
    res.end();
  } catch (err) {
    if (err.code === AI_ERROR_CODES.INSUFFICIENT_TOKENS) {
      res.write(`data: ${JSON.stringify({ error: 'INSUFFICIENT_TOKENS', message: 'Insufficient token balance.' })}\n\n`);
      return res.end();
    }
    if (err.code === AI_ERROR_CODES.NO_CHART) {
      res.write(`data: ${JSON.stringify({ error: 'NO_CHART', message: err.message })}\n\n`);
      return res.end();
    }
    next(err);
  }
});

// ─── POST /api/ai/interpret ───────────────────────────────────────────────────
router.post('/interpret', async (req, res, next) => {
  try {
    const { mode = 'general', provider = 'gemini' } = req.body;

    const result = await AIOrchestrator.handleInterpretation({
      userId: req.userId,
      mode,
      providerName: provider,
    });

    res.json({
      reply: result.reply,
      formatted: result.formatted,
      newBalance: result.newBalance,
      agent: result.agent,
    });
  } catch (err) {
    if (err.code === AI_ERROR_CODES.INSUFFICIENT_TOKENS) {
      return res.status(402).json({ error: 'INSUFFICIENT_TOKENS', message: 'Insufficient token balance.' });
    }
    if (err.code === AI_ERROR_CODES.NO_CHART) {
      return res.status(400).json({ error: 'NO_CHART', message: err.message });
    }
    next(err);
  }
});

export default router;
