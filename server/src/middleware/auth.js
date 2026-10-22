import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Middleware: require valid JWT on protected routes
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Middleware: a real account is required (guest accounts may not use chat or AI).
// Use after requireAuth.
export async function requireAccount(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { isGuest: true } });
    if (!user) return res.status(401).json({ error: 'Account not found. Please sign in again.', code: 'LOGIN_REQUIRED' });
    if (user.isGuest) return res.status(403).json({ error: 'Please sign in or create an account to chat.', code: 'LOGIN_REQUIRED' });
    next();
  } catch (err) {
    next(err);
  }
}
