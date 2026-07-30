import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import ReportService from '../services/report.service.js';

const router = Router();
router.use(requireAuth);

// ─── GET /api/reports ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const reports = await ReportService.getUserReports(req.userId);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/reports ────────────────────────────────────────────────────────
// Generates or fetches report via ReportService & AIOrchestrator
router.post('/', async (req, res, next) => {
  try {
    const { mode = 'general', forceRefresh = false } = req.body;
    const result = await ReportService.generateOrGetReport(req.userId, mode, forceRefresh);
    res.status(result.cached ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
