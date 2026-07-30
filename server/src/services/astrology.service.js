import prisma from '../db.js';
import { generateFullChartBundle } from './vedastro.js';

export const CHART_STATUS = {
  GENERATING: 'GENERATING',
  READY: 'READY',
  FAILED: 'FAILED',
  STALE: 'STALE',
};

export const VEDASTRO_VERSION = 'v2';
export const VEDASTRO_API_VERSION = 'vedastro-rest-v1';

export class AstrologyService {
  /**
   * Get a cached chart by type for a user from PostgreSQL.
   * Return null if not found.
   */
  static async getChart(userId, type = 'natal') {
    const targetType = type.toLowerCase() === 'latest' ? 'natal' : type.toLowerCase();
    const chart = await prisma.chart.findUnique({
      where: { userId_type: { userId, type: targetType } },
    });
    if (!chart) return null;

    return {
      id: chart.id,
      userId: chart.userId,
      type: chart.type,
      status: chart.status || CHART_STATUS.READY,
      chartData: chart.chartData,
      metadata: chart.metadata || {},
      createdAt: chart.createdAt,
      updatedAt: chart.updatedAt,
    };
  }

  /**
   * Mark all charts for a user as STALE when birth profile is updated.
   */
  static async markChartsStale(userId) {
    console.log(`[AstrologyService] Marking all charts as STALE for user ${userId}`);
    await prisma.chart.updateMany({
      where: { userId },
      data: { status: CHART_STATUS.STALE },
    });
  }

  /**
   * Generate or retrieve complete VedAstro chart bundle.
   * Handles lifecycle statuses: GENERATING -> READY / FAILED.
   * Saves processed chartData, raw API payloads (rawData), and metadata.
   */
  static async generateOrGetBundle(userId, forceRegenerate = false) {
    // 1. Return cached natal chart if available and not forced & READY
    if (!forceRegenerate) {
      const existingNatal = await prisma.chart.findUnique({
        where: { userId_type: { userId, type: 'natal' } },
      });
      if (existingNatal && existingNatal.status === CHART_STATUS.READY) {
        console.log(`[AstrologyService] Returning cached READY chart bundle for user ${userId}`);
        return {
          natal: existingNatal.chartData,
          cached: true,
          status: existingNatal.status,
          metadata: existingNatal.metadata,
        };
      }
    }

    // 2. Load birth profile
    const profile = await prisma.birthProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error('Birth profile is required before generating chart.');
    }
    if (!profile.lat || !profile.lon) {
      throw new Error('Birth profile is missing geographic coordinates (lat/lon).');
    }

    // 3. Set status to GENERATING in DB for natal chart
    await prisma.chart.upsert({
      where: { userId_type: { userId, type: 'natal' } },
      create: {
        userId,
        type: 'natal',
        status: CHART_STATUS.GENERATING,
        chartData: { state: 'generating' },
      },
      update: {
        status: CHART_STATUS.GENERATING,
      },
    });

    const startTime = Date.now();
    try {
      console.log(`[AstrologyService] Invoking VedAstro engine for user ${userId}...`);
      const bundleResult = await generateFullChartBundle(profile);
      const calculationDuration = Date.now() - startTime;

      const metadata = {
        generated_at: new Date().toISOString(),
        vedastro_version: VEDASTRO_VERSION,
        api_version: VEDASTRO_API_VERSION,
        latitude: profile.lat,
        longitude: profile.lon,
        timezone: profile.timezone || '+05:30',
        calculation_duration: calculationDuration,
      };

      const { rawData, ...charts } = bundleResult;

      // 4. Save all chart types into PostgreSQL with rawData, metadata, and status READY
      const chartTypes = ['natal', 'd9', 'd10', 'd2', 'd11', 'transit'];
      const savedCharts = {};

      for (const type of chartTypes) {
        if (charts[type]) {
          const processedChartData = {
            ...charts[type],
            status: CHART_STATUS.READY,
            metadata,
          };

          const saved = await prisma.chart.upsert({
            where: { userId_type: { userId, type } },
            create: {
              userId,
              type,
              status: CHART_STATUS.READY,
              chartData: processedChartData,
              rawData: rawData || null,
              metadata,
            },
            update: {
              status: CHART_STATUS.READY,
              chartData: processedChartData,
              rawData: rawData || null,
              metadata,
            },
          });

          savedCharts[type] = saved.chartData;
        }
      }

      console.log(`[AstrologyService] Chart bundle READY for user ${userId} (${calculationDuration}ms)`);
      return {
        natal: savedCharts.natal,
        bundle: savedCharts,
        cached: false,
        status: CHART_STATUS.READY,
        metadata,
      };
    } catch (err) {
      console.error(`[AstrologyService] Chart generation FAILED for user ${userId}: ${err.message}`);

      // Mark status as FAILED in DB
      await prisma.chart.upsert({
        where: { userId_type: { userId, type: 'natal' } },
        create: {
          userId,
          type: 'natal',
          status: CHART_STATUS.FAILED,
          chartData: { error: err.message },
        },
        update: {
          status: CHART_STATUS.FAILED,
          chartData: { error: err.message },
        },
      });

      throw err;
    }
  }

  /**
   * Future-proof: Calculate synastry / compatibility chart between two profiles.
   */
  static async calculateCompatibility(userId1, userId2) {
    const p1 = await prisma.birthProfile.findUnique({ where: { userId: userId1 } });
    const p2 = await prisma.birthProfile.findUnique({ where: { userId: userId2 } });
    if (!p1 || !p2) throw new Error('Both birth profiles are required for compatibility.');
    
    // Future expansion: call VedAstro MatchReport API
    return {
      type: 'synastry',
      partner1: p1.fullName,
      partner2: p2.fullName,
      status: CHART_STATUS.READY,
      score: 85, // Stub score for future expansion
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Future-proof: Calculate Varshaphala / Yearly Solar Return prediction chart.
   */
  static async calculateYearlyVarshaphala(userId, year = new Date().getFullYear()) {
    const profile = await prisma.birthProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Birth profile required for Varshaphala.');

    return {
      type: 'varshaphala',
      year,
      status: CHART_STATUS.READY,
      generatedAt: new Date().toISOString(),
    };
  }
}

export default AstrologyService;
