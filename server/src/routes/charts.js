import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import AstrologyService, { CHART_STATUS } from '../services/astrology.service.js';

const router = Router();
router.use(requireAuth);

const ALLOWED_CHART_TYPES = new Set(['natal', 'd9', 'd10', 'd2', 'd11', 'transit', 'general', 'latest', 'synastry', 'varshaphala']);

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
