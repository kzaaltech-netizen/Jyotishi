import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../db.js';
import { signToken, verifyToken, requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Slow down password guessing and sign-up spam. Limits are per IP.
const minute = 60 * 1000;
const loginLimit = rateLimit({ name: 'login', windowMs: 15 * minute, max: Number(process.env.LOGIN_RATE_LIMIT) || 10, message: 'Too many sign-in attempts. Please wait a few minutes and try again.' });
const signupLimit = rateLimit({ name: 'register', windowMs: 60 * minute, max: Number(process.env.SIGNUP_RATE_LIMIT) || 10, message: 'Too many accounts created from this network. Please try again later.' });
const guestLimit = rateLimit({ name: 'guest', windowMs: 60 * minute, max: Number(process.env.GUEST_RATE_LIMIT) || 30, message: 'Too many sessions started from this network. Please try again later.' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The guest session (if any) that sent this request. Visitors can make a Kundli
// without an account; when they sign up or sign in, that work is kept.
async function guestFromRequest(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const { userId } = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isGuest: true } });
    return user?.isGuest ? user : null;
  } catch {
    return null;
  }
}

// Move a guest's birth details, charts and saved readings into an existing account,
// without overwriting anything the account already has, then remove the guest.
async function mergeGuestInto(guestId, userId) {
  const [hasProfile, charts] = await Promise.all([
    prisma.birthProfile.findUnique({ where: { userId }, select: { id: true } }),
    prisma.chart.findMany({ where: { userId }, select: { type: true } }),
  ]);
  const takenTypes = charts.map((c) => c.type);
  await prisma.$transaction([
    ...(hasProfile ? [] : [prisma.birthProfile.updateMany({ where: { userId: guestId }, data: { userId } })]),
    prisma.chart.updateMany({ where: { userId: guestId, type: { notIn: takenTypes } }, data: { userId } }),
    prisma.report.updateMany({ where: { userId: guestId }, data: { userId } }),
    prisma.user.delete({ where: { id: guestId } }),
  ]);
}

async function createWallet(userId) {
  return prisma.tokenWallet.create({
    data: { userId, balance: 50 },
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', signupLimit, async (req, res, next) => {
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
    const select = { id: true, name: true, email: true, isGuest: true, createdAt: true };
    const guest = await guestFromRequest(req);

    let user;
    if (guest) {
      user = await prisma.user.update({
        where: { id: guest.id },
        data: { name: cleanName, email: cleanEmail, passwordHash, isGuest: false },
        select,
      });
    } else {
      user = await prisma.user.create({ data: { name: cleanName, email: cleanEmail, passwordHash }, select });
      await createWallet(user.id);
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user: { ...user, hasPassword: true } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', loginLimit, async (req, res, next) => {
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

    if (user.isGuest) {
      return res.status(401).json({ error: 'No account found with this email.' });
    }
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please continue with Google.', code: 'USE_GOOGLE' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    const wallet = await prisma.tokenWallet.findUnique({ where: { userId: user.id } });
    if (!wallet) await createWallet(user.id);

    const { passwordHash: _, ...safeUser } = user;
    const guest = await guestFromRequest(req);
    if (guest && guest.id !== user.id) await mergeGuestInto(guest.id, user.id);

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { ...safeUser, hasPassword: true } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
// Sign in or sign up with a Google ID token from Google Identity Services. Google
// has verified the email, so an existing account with the same email is signed in;
// a guest session is upgraded (new account) or merged (existing account).
const googleClient = new OAuth2Client();

router.post('/google', loginLimit, async (req, res, next) => {
  try {
    const { credential } = req.body || {};
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Google credential is required.' });
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ error: 'Google sign-in is not set up yet.', code: 'GOOGLE_UNAVAILABLE' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: 'Google sign-in failed. Please try again.', code: 'GOOGLE_INVALID' });
    }
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ error: 'Your Google account has no verified email.', code: 'GOOGLE_INVALID' });
    }

    const email = payload.email.trim().toLowerCase();
    const name = (payload.name || payload.given_name || email.split('@')[0]).trim().slice(0, 100);
    const select = { id: true, name: true, email: true, isGuest: true, createdAt: true, passwordHash: true };
    const guest = await guestFromRequest(req);

    let user = await prisma.user.findUnique({ where: { email }, select });
    let created = false;
    if (user) {
      if (!(await prisma.tokenWallet.findUnique({ where: { userId: user.id } }))) await createWallet(user.id);
      if (guest && guest.id !== user.id) await mergeGuestInto(guest.id, user.id);
    } else if (guest) {
      user = await prisma.user.update({ where: { id: guest.id }, data: { name, email, isGuest: false }, select });
      created = true;
    } else {
      user = await prisma.user.create({ data: { name, email }, select });
      await createWallet(user.id);
      created = true;
    }

    const { passwordHash, ...safeUser } = user;
    const token = signToken({ userId: user.id, email: user.email });
    res.status(created ? 201 : 200).json({ token, user: { ...safeUser, hasPassword: Boolean(passwordHash) } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/guest ─────────────────────────────────────────────────────
router.post('/guest', guestLimit, async (req, res, next) => {
  // Guests can make a Kundli and use the free pages; chat still needs an account.
  if (process.env.ALLOW_GUEST === 'false') {
    return res.status(403).json({ error: 'Please create an account or sign in.', code: 'LOGIN_REQUIRED' });
  }
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
      select: { id: true, name: true, email: true, isGuest: true, createdAt: true, passwordHash: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { passwordHash, ...safeUser } = user;
    res.json({ user: { ...safeUser, hasPassword: Boolean(passwordHash) } });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/auth/me ──────────────────────────────────────────────────────
// Deletes the signed-in account and everything stored for it (profile, charts,
// chats, readings, tokens): related rows are removed by the database cascade.
// Accounts with a password must confirm it.
router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, passwordHash: true } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.passwordHash) {
      const { password } = req.body || {};
      const ok = typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));
      if (!ok) return res.status(401).json({ error: 'Incorrect password.', code: 'WRONG_PASSWORD' });
    }
    // AI logs are not linked by a foreign key, so they are removed explicitly.
    await prisma.$transaction([
      prisma.aILog.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
