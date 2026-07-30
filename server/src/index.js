import 'dotenv/config';
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

const app  = express();
const PORT = process.env.PORT || 3001;

// Enforce JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret')) {
  console.error('FATAL: JWT_SECRET environment variable must be set in production!');
  process.exit(1);
}

// Enforce GEMINI_API_KEY
if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
  console.error('FATAL: GEMINI_API_KEY environment variable is missing or empty. Please set it in server/.env');
  process.exit(1);
} else {
  const k = process.env.GEMINI_API_KEY.trim();
  console.log(`✅ GEMINI_API_KEY loaded: ${k.substring(0, 4)}...${k.substring(k.length - 4)}`);
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));   // charts can be large JSON blobs

// ─── Request logger (dev) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
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

  // Handle Prisma known errors (e.g. unique constraints or invalid IDs)
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this unique identifier already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Requested record was not found.' });
  }

  // Safe fallback error response (do not leak DB credentials or stack trace to client)
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred.'
    : (err.message || 'Internal server error.');

  res.status(statusCode).json({ error: message });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌟 Aetheric Jyotish API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
