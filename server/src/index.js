// Local / long-running server entry point (also used by the Docker image).
// On Vercel the same app is served by /api/index.js as a serverless function.
import app from './app.js';
import prisma from './db.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n🌟 Aetheric Jyotish API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 120000;

// Graceful shutdown (docker stop / platform redeploys send SIGTERM)
function shutdown(signal) {
  console.log(`${signal} received — shutting down...`);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
