import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ─── GET /api/purchases ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ purchases });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases.' });
  }
});

export default router;
