import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function createWallet(userId) {
  return prisma.tokenWallet.create({
    data: { userId, balance: 50 },
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Valid name is required.' });
    }
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName  = name.trim();

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name: cleanName, email: cleanEmail, passwordHash },
      select: { id: true, name: true, email: true, isGuest: true, createdAt: true },
    });

    await createWallet(user.id);

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true, name: true, email: true, passwordHash: true,
        isGuest: true, createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email.' });
    }

    if (user.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Incorrect password.' });
    }

    const wallet = await prisma.tokenWallet.findUnique({ where: { userId: user.id } });
    if (!wallet) await createWallet(user.id);

    const { passwordHash: _, ...safeUser } = user;
    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/guest ─────────────────────────────────────────────────────
router.post('/guest', async (req, res, next) => {
  try {
    const { name } = req.body;
    const cleanName = (typeof name === 'string' && name.trim()) ? name.trim().slice(0, 50) : 'Cosmic Traveller';
    const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@aetheric.app`;

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: guestEmail,
        isGuest: true,
      },
      select: { id: true, name: true, email: true, isGuest: true, createdAt: true },
    });

    await createWallet(user.id);

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, isGuest: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
