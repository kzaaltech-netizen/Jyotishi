import prisma from '../db.js';
import AIOrchestrator from './aiOrchestrator.js';

export class ReportService {
  /**
   * Get all reports for a user.
   */
  static async getUserReports(userId) {
    return prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Generate or retrieve cached report for a user and mode.
   * Idempotent: If report for mode exists and forceRefresh is false, returns cached.
   */
  static async generateOrGetReport(userId, mode = 'general', forceRefresh = false) {
    const cleanMode = String(mode || 'general').toLowerCase();

    if (!forceRefresh) {
      const existing = await prisma.report.findFirst({
        where: { userId, mode: cleanMode },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        console.log(`[ReportService] Returning cached report for user ${userId} (${cleanMode})`);
        return { report: existing, cached: true };
      }
    }

    console.log(`[ReportService] Generating fresh report via AIOrchestrator for user ${userId} (${cleanMode})...`);
    const orchestratorResult = await AIOrchestrator.handleInterpretation({
      userId,
      mode: cleanMode,
    });

    const reportContent = orchestratorResult.reply;

    const report = await prisma.report.create({
      data: {
        userId,
        mode: cleanMode,
        content: reportContent,
      },
    });

    return {
      report,
      formatted: orchestratorResult.formatted,
      newBalance: orchestratorResult.newBalance,
      cached: false,
    };
  }
}

export default ReportService;
