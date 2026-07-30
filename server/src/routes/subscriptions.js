import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const ALLOWED_PLANS = new Set(['monthly', 'yearly']);

// ─── GET /api/subscription ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId: req.userId },
    });
    res.json({ subscription: sub || null });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/subscription ───────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { planType, startDate, endDate, status = 'active' } = req.body;

    if (!planType || typeof planType !== 'string' || !ALLOWED_PLANS.has(planType.toLowerCase())) {
      return res.status(400).json({ error: 'planType must be "monthly" or "yearly".' });
    }
    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).json({ error: 'startDate must be a valid date string.' });
    }
    if (!endDate || isNaN(Date.parse(endDate))) {
      return res.status(400).json({ error: 'endDate must be a valid date string.' });
    }

    const cleanPlan = planType.toLowerCase();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cleanStatus = (typeof status === 'string' && status.trim()) ? status.trim().slice(0, 30) : 'active';

    const sub = await prisma.subscription.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        planType: cleanPlan,
        startDate: start,
        endDate: end,
        status: cleanStatus,
      },
      update: {
        planType: cleanPlan,
        startDate: start,
        endDate: end,
        status: cleanStatus,
      },
    });

    res.json({ subscription: sub });
  } catch (err) {
    next(err);
  }
});

export default router;
