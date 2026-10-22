import { PrismaClient } from '@prisma/client';

// Errors that mean the connection dropped rather than the query being wrong. Neon
// closes idle connections, so the first query after a quiet spell can hit one.
const RETRYABLE = /Server has closed the connection|Can't reach database server|Connection terminated|ECONNRESET|Timed out fetching a new connection|P1001|P1017|P2024/;
const MAX_RETRIES = 2;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const isRetryableDbError = (err) => RETRYABLE.test(`${err?.code || ''} ${err?.message || ''}`);

function createClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  // Retry a query a couple of times when the connection was dropped.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt += 1) {
          try {
            return await query(args);
          } catch (err) {
            if (attempt >= MAX_RETRIES || !isRetryableDbError(err)) throw err;
            await sleep(150 * (attempt + 1));
          }
        }
      },
    },
  });
}

// Singleton pattern — reuse the same connection across hot reloads
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
