import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

/**
 * GET /api/health
 * Tests the database connection. Returns status and timestamp.
 */
router.get('/', async (req, res) => {
  try {
    // Execute a trivial query to verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      service: 'Aetheric Jyotish API',
      version: '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Database unavailable.' : err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
