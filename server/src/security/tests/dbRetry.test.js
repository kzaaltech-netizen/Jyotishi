// Which database errors are retried (db.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRetryableDbError } from '../../db.js';

test('dropped connections are retried', () => {
  assert.ok(isRetryableDbError({ message: 'Invalid `prisma.chart.upsert()` invocation:\n\nServer has closed the connection.' }));
  assert.ok(isRetryableDbError({ code: 'P1001', message: "Can't reach database server" }));
  assert.ok(isRetryableDbError({ code: 'P2024', message: 'Timed out fetching a new connection from the connection pool.' }));
});

test('real query errors are not retried', () => {
  assert.ok(!isRetryableDbError({ code: 'P2002', message: 'Unique constraint failed on the fields: (`email`)' }));
  assert.ok(!isRetryableDbError({ code: 'P2025', message: 'Record to delete does not exist.' }));
  assert.ok(!isRetryableDbError(null));
});
