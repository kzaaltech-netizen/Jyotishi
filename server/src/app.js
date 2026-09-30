import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

// Routes
import healthRouter        from './routes/health.js';
import authRouter          from './routes/auth.js';
import profileRouter       from './routes/profile.js';
import chartsRouter        from './routes/charts.js';
import tokensRouter        from './routes/tokens.js';
import chatRouter          from './routes/chat.js';
import subscriptionsRouter from './routes/subscriptions.js';
import purchasesRouter     from './routes/purchases.js';
import reportsRouter       from './routes/reports.js';
import settingsRouter      from './routes/settings.js';
import aiRouter            from './routes/ai.js';

const isProduction = process.env.NODE_ENV === 'production';

// ─── Environment checks ──────────────────────────────────────────────────────
// Throw instead of process.exit() so this module also works inside a serverless
// function (Vercel), where exiting the process would kill the runtime silently.
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret')) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set in production.');
}
if (!process.env.DATABASE_URL) {
  throw new Error('FATAL: DATABASE_URL environment variable is not set.');
}
if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
  console.warn('WARNING: GEMINI_API_KEY is missing — AI chat features will fail until it is set.');
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // behind Vercel / reverse proxy

// ─── Middleware ───────────────────────────────────────────────────────────────
// CORS_ORIGINS: comma-separated allow-list (e.g. "https://myapp.vercel.app").
// Unset → reflect any origin (auth is Bearer-token based, no cookies).
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length
    ? (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin))
    : true,
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));   // charts can be large JSON blobs

// ─── Request logger (dev) ─────────────────────────────────────────────────────
if (!isProduction) {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health',        healthRouter);
app.use('/api/auth',          authRouter);
app.use('/api/profile',       profileRouter);
app.use('/api/charts',        chartsRouter);
app.use('/api/tokens',        tokensRouter);
app.use('/api/chat',          chatRouter);
app.use('/api/subscription',  subscriptionsRouter);
app.use('/api/purchases',     purchasesRouter);
app.use('/api/reports',       reportsRouter);
app.use('/api/settings',      settingsRouter);
app.use('/api/ai',            aiRouter);

// ─── Frontend (Docker / single-server mode) ──────────────────────────────────
// SERVE_FRONTEND=true → serve the Vite build from /dist with SPA fallback.
// Not used on Vercel, where the static files are served by the CDN.
if (process.env.SERVE_FRONTEND === 'true') {
  const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(`FATAL: SERVE_FRONTEND=true but no frontend build found at ${distDir}. Run "npm run build".`);
  }
  app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(distDir, { index: false }));
  app.get(/^(?!\/api(\/|$)).*/, (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const timestamp = new Date().toISOString();
  console.error(`[SERVER_ERROR ${timestamp}] ${req.method} ${req.url}:`, err.stack || err.message || err);

  // Handle specific syntax or JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload provided.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request payload too large.' });
  }

  // Handle Prisma known errors (e.g. unique constraints or invalid IDs)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this unique identifier already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Requested record was not found.' });
  }

  // Safe fallback error response (do not leak DB credentials or stack trace to client)
  const statusCode = err.statusCode || err.status || 500;
  const message = isProduction && statusCode >= 500
    ? 'An internal server error occurred.'
    : (err.message || 'Internal server error.');

  res.status(statusCode).json({ error: message });
});

export default app;
