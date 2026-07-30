import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import AIOrchestrator, { AI_ERROR_CODES } from '../services/aiOrchestrator.js';

const router = Router();
router.use(requireAuth);

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// Routes 100% through AIOrchestrator
router.post('/chat', async (req, res, next) => {
  try {
    const { mode = 'general', message, provider = 'gemini' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and cannot be empty.' });
    }

    const result = await AIOrchestrator.handleChat({
      userId: req.userId,
      mode,
      message,
      providerName: provider,
    });

    res.json({
      reply: result.reply,
      formatted: result.formatted,
      newBalance: result.newBalance,
      agent: result.agent,
    });
  } catch (err) {
    if (err.code === AI_ERROR_CODES.INSUFFICIENT_TOKENS) {
      return res.status(402).json({ error: 'INSUFFICIENT_TOKENS', message: 'Insufficient token balance.' });
    }
    if (err.code === AI_ERROR_CODES.NO_CHART) {
      return res.status(400).json({ error: 'NO_CHART', message: err.message });
    }
    if (err.code === AI_ERROR_CODES.INVALID_AGENT) {
      return res.status(400).json({ error: 'INVALID_AGENT', message: err.message });
    }
    next(err);
  }
});

// ─── POST /api/ai/chat/stream ──────────────────────────────────────────────────
// Stream AI response using Server-Sent Events (SSE)
router.post('/chat/stream', async (req, res, next) => {
  try {
    const { mode = 'general', message, provider = 'gemini' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and cannot be empty.' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await AIOrchestrator.handleChatStream({
      userId: req.userId,
      mode,
      message,
      providerName: provider,
      onChunk: (chunkText) => {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      },
    });

    res.write(`data: ${JSON.stringify({ done: true, reply: result.reply, formatted: result.formatted, newBalance: result.newBalance })}\n\n`);
    res.end();
  } catch (err) {
    if (err.code === AI_ERROR_CODES.INSUFFICIENT_TOKENS) {
      res.write(`data: ${JSON.stringify({ error: 'INSUFFICIENT_TOKENS', message: 'Insufficient token balance.' })}\n\n`);
      return res.end();
    }
    if (err.code === AI_ERROR_CODES.NO_CHART) {
      res.write(`data: ${JSON.stringify({ error: 'NO_CHART', message: err.message })}\n\n`);
      return res.end();
    }
    next(err);
  }
});
// Routes 100% through AIOrchestrator
router.post('/interpret', async (req, res, next) => {
  try {
    const { mode = 'general', provider = 'gemini' } = req.body;

    const result = await AIOrchestrator.handleInterpretation({
      userId: req.userId,
      mode,
      providerName: provider,
    });

    res.json({
      reply: result.reply,
      formatted: result.formatted,
      newBalance: result.newBalance,
      agent: result.agent,
    });
  } catch (err) {
    if (err.code === AI_ERROR_CODES.INSUFFICIENT_TOKENS) {
      return res.status(402).json({ error: 'INSUFFICIENT_TOKENS', message: 'Insufficient token balance.' });
    }
    if (err.code === AI_ERROR_CODES.NO_CHART) {
      return res.status(400).json({ error: 'NO_CHART', message: err.message });
    }
    next(err);
  }
});

export default router;
