import prisma from './src/db.js';
const tables = await prisma.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
console.log('Tables in public schema:');
tables.forEach(t => console.log(' -', t.tablename));

// Test write to User table
try {
  const count = await prisma.user.count();
  console.log(`\nUser table accessible. Row count: ${count}`);
} catch (e) {
  console.error('User table error:', e.message);
}

await prisma.$disconnect();
