import { Router } from 'express';
import prisma from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const ALLOWED_MODES = new Set(['general', 'career', 'wealth', 'abundance', 'union', 'forecast']);

async function getSession(userId, mode) {
  return prisma.chatSession.upsert({
    where: { userId_mode: { userId, mode } },
    create: { userId, mode },
    update: {},
  });
}

// ─── GET /api/chat/:mode ──────────────────────────────────────────────────────
router.get('/:mode', async (req, res, next) => {
  try {
    const mode = req.params.mode.toLowerCase();
    if (!ALLOWED_MODES.has(mode)) {
      return res.status(400).json({ error: `Invalid chat mode. Allowed modes: ${Array.from(ALLOWED_MODES).join(', ')}` });
    }

    const session = await prisma.chatSession.findUnique({
      where: { userId_mode: { userId: req.userId, mode } },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    const messages = session
      ? session.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.createdAt.toISOString(),
        }))
      : [];

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/chat/:mode ─────────────────────────────────────────────────────
router.post('/:mode', async (req, res, next) => {
  try {
    const mode = req.params.mode.toLowerCase();
    if (!ALLOWED_MODES.has(mode)) {
      return res.status(400).json({ error: `Invalid chat mode.` });
    }

    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required and cannot be empty.' });
    }

    // Validate message item structure
    const validMessages = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') continue;
      const role = (msg.role === 'user' || msg.role === 'ai') ? msg.role : 'user';
      if (typeof msg.content === 'string' && msg.content.trim()) {
        validMessages.push({
          role,
          content: msg.content.trim().slice(0, 10000),
        });
      }
    }

    if (validMessages.length === 0) {
      return res.status(400).json({ error: 'No valid message objects found in request.' });
    }

    // Ensures session is linked to req.userId
    const session = await getSession(req.userId, mode);

    const created = await prisma.chatMessage.createMany({
      data: validMessages.map(m => ({
        sessionId: session.id,
        role: m.role,
        content: m.content,
      })),
    });

    res.json({ saved: created.count });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/chat/:mode ───────────────────────────────────────────────────
router.delete('/:mode', async (req, res, next) => {
  try {
    const mode = req.params.mode.toLowerCase();
    if (!ALLOWED_MODES.has(mode)) {
      return res.status(400).json({ error: `Invalid chat mode.` });
    }

    const session = await prisma.chatSession.findUnique({
      where: { userId_mode: { userId: req.userId, mode } },
    });
    if (!session) return res.json({ deleted: 0 });

    const { count } = await prisma.chatMessage.deleteMany({
      where: { sessionId: session.id },
    });

    res.json({ deleted: count });
  } catch (err) {
    next(err);
  }
});

export default router;
