import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import AstrologyService from '../services/astrology.service.js';

const router = Router();

// A real calendar date, not in the future and not before 1900.
function isBirthDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  return y >= 1900 && date.getTime() <= Date.now();
}

// HH:MM or HH:MM:SS on a 24-hour clock.
const isClockTime = (value) => /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
router.use(requireAuth);

// ─── GET /api/profile ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const profile = await prisma.birthProfile.findUnique({
      where: { userId: req.userId },
    });
    res.json({ profile: profile || null });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/profile ────────────────────────────────────────────────────────
// Saves birth profile, marks old charts as STALE, and regenerates chart bundle via AstrologyService
router.post('/', async (req, res, next) => {
  try {
    const { fullName, dob, birthTime, birthplace, lat, lon, timezone } = req.body;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ error: 'fullName is required and must be a non-empty string.' });
    }
    if (!dob || typeof dob !== 'string' || !dob.trim()) {
      return res.status(400).json({ error: 'dob is required and must be a valid date string (YYYY-MM-DD).' });
    }
    if (!birthTime || typeof birthTime !== 'string' || !birthTime.trim()) {
      return res.status(400).json({ error: 'birthTime is required.' });
    }
    if (!birthplace || typeof birthplace !== 'string' || !birthplace.trim()) {
      return res.status(400).json({ error: 'birthplace is required.' });
    }

    if (!isBirthDate(dob.trim())) {
      return res.status(400).json({ error: 'dob must be a real date (YYYY-MM-DD) between 1900 and today.' });
    }
    if (!isClockTime(birthTime.trim())) {
      return res.status(400).json({ error: 'birthTime must be a time of day (HH:MM).' });
    }

    const cleanLat = (lat !== undefined && lat !== null && !isNaN(Number(lat))) ? Number(lat) : null;
    const cleanLon = (lon !== undefined && lon !== null && !isNaN(Number(lon))) ? Number(lon) : null;

    if (cleanLat !== null && (cleanLat < -90 || cleanLat > 90)) {
      return res.status(400).json({ error: 'Latitude must be between -90 and 90.' });
    }
    if (cleanLon !== null && (cleanLon < -180 || cleanLon > 180)) {
      return res.status(400).json({ error: 'Longitude must be between -180 and 180.' });
    }

    const profile = await prisma.birthProfile.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        fullName: fullName.trim().slice(0, 100),
        dob: dob.trim().slice(0, 30),
        birthTime: birthTime.trim().slice(0, 20),
        birthplace: birthplace.trim().slice(0, 200),
        lat: cleanLat,
        lon: cleanLon,
        timezone: typeof timezone === 'string' ? timezone.trim().slice(0, 100) : null,
      },
      update: {
        fullName: fullName.trim().slice(0, 100),
        dob: dob.trim().slice(0, 30),
        birthTime: birthTime.trim().slice(0, 20),
        birthplace: birthplace.trim().slice(0, 200),
        lat: cleanLat,
        lon: cleanLon,
        timezone: typeof timezone === 'string' ? timezone.trim().slice(0, 100) : null,
      },
    });

    // Mark previous charts STALE when birth details change
    await AstrologyService.markChartsStale(req.userId);

    // Auto-generate fresh VedAstro chart bundle if lat/lon available
    let chartResult = null;
    if (profile.lat && profile.lon) {
      try {
        console.log(`[Profile] Regenerating charts via AstrologyService for user ${req.userId}...`);
        chartResult = await AstrologyService.generateOrGetBundle(req.userId, true);
      } catch (cErr) {
        console.error(`[Profile] Auto chart generation warning: ${cErr.message}`);
      }
    }

    res.json({ profile, chartGenerated: Boolean(chartResult), status: chartResult?.status || 'READY' });
  } catch (err) {
    next(err);
  }
});

export default router;
