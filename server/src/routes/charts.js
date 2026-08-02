import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import AstrologyService, { CHART_STATUS } from '../services/astrology.service.js';

import prisma from '../db.js';

const router = Router();
router.use(requireAuth);

const ALLOWED_CHART_TYPES = new Set(['natal', 'd1', 'd9', 'd10', 'd2', 'd11', 'transit', 'general', 'latest', 'synastry', 'varshaphala']);
const PREMIUM_CHART_TYPES = new Set(['d2', 'd10', 'd11', 'transit', 'synastry', 'varshaphala']);

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

// ─── GET /api/charts/latest ───────────────────────────────────────────────────
router.get('/latest', async (req, res, next) => {
  try {
    const chart = await AstrologyService.getChart(req.userId, 'natal');
    res.json({ chart: chart ? chart.chartData : null, status: chart?.status || CHART_STATUS.READY, metadata: chart?.metadata });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/charts/:type ────────────────────────────────────────────────────
router.get('/:type', async (req, res, next) => {
  try {
    const type = req.params.type.toLowerCase();
    if (!ALLOWED_CHART_TYPES.has(type)) {
      return res.status(400).json({ error: `Invalid chart type. Allowed types: ${Array.from(ALLOWED_CHART_TYPES).join(', ')}` });
    }

    if (PREMIUM_CHART_TYPES.has(type)) {
      const premium = await isUserPremium(req.userId);
      if (!premium) {
        return res.status(403).json({
          error: 'PREMIUM_REQUIRED',
          message: 'This divisional chart requires an active Premium subscription.',
        });
      }
    }

    const chart = await AstrologyService.getChart(req.userId, type);
    res.json({ chart: chart ? chart.chartData : null, status: chart?.status || CHART_STATUS.READY, metadata: chart?.metadata });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/charts/generate ────────────────────────────────────────────────
// Idempotent: returns cached chart bundle via AstrologyService or generates new
router.post('/generate', async (req, res, next) => {
  try {
    const result = await AstrologyService.generateOrGetBundle(req.userId, false);
    res.json({
      chart: result.natal,
      bundle: result.bundle,
      cached: result.cached,
      status: result.status,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error(`[ChartsRoute] Generate error: ${err.message}`);
    next(err);
  }
});

// ─── POST /api/charts/regenerate ──────────────────────────────────────────────
// Force refresh via AstrologyService
router.post('/regenerate', async (req, res, next) => {
  try {
    const result = await AstrologyService.generateOrGetBundle(req.userId, true);
    res.json({
      chart: result.natal,
      bundle: result.bundle,
      cached: false,
      status: result.status,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error(`[ChartsRoute] Regenerate error: ${err.message}`);
    next(err);
  }
});

export default router;
