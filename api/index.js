// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json)
// and handled by the shared Express app. req.url keeps the original /api/... path.
import app from '../server/src/app.js';

export default app;
