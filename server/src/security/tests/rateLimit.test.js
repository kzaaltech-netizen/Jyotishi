// Rate limiter for sign-in, sign-up and guest sessions (middleware/rateLimit.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit, clientIp } from '../../middleware/rateLimit.js';

function call(mw, ip, headers = {}) {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let passed = false;
  mw({ headers, socket: { remoteAddress: ip } }, res, () => { passed = true; });
  return { passed, res };
}

test('allows up to the limit, then answers 429 with Retry-After', () => {
  const mw = rateLimit({ name: `t-${Math.random()}`, windowMs: 60_000, max: 3, message: 'slow down' });
  for (let i = 0; i < 3; i += 1) assert.ok(call(mw, '10.0.0.1').passed, `request ${i + 1}`);
  const blocked = call(mw, '10.0.0.1');
  assert.equal(blocked.passed, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.res.body.code, 'RATE_LIMITED');
  assert.ok(Number(blocked.res.headers['Retry-After']) > 0);
});

test('counts each client separately', () => {
  const mw = rateLimit({ name: `t-${Math.random()}`, windowMs: 60_000, max: 1, message: 'x' });
  assert.ok(call(mw, '10.0.0.2').passed);
  assert.ok(call(mw, '10.0.0.3').passed);
  assert.equal(call(mw, '10.0.0.2').passed, false);
});

test('a forged X-Forwarded-For header cannot dodge the limit outside Vercel', () => {
  delete process.env.VERCEL;
  const mw = rateLimit({ name: `t-${Math.random()}`, windowMs: 60_000, max: 1, message: 'x' });
  assert.ok(call(mw, '10.0.0.4', { 'x-forwarded-for': '1.1.1.1' }).passed);
  assert.equal(call(mw, '10.0.0.4', { 'x-forwarded-for': '2.2.2.2' }).passed, false);
});

test('behind Vercel the real client address header is used', () => {
  process.env.VERCEL = '1';
  try {
    assert.equal(clientIp({ headers: { 'x-real-ip': '9.9.9.9' }, socket: { remoteAddress: '10.0.0.5' } }), '9.9.9.9');
  } finally {
    delete process.env.VERCEL;
  }
});

test('the window resets', async () => {
  const mw = rateLimit({ name: `t-${Math.random()}`, windowMs: 30, max: 1, message: 'x' });
  assert.ok(call(mw, '10.0.0.6').passed);
  assert.equal(call(mw, '10.0.0.6').passed, false);
  await new Promise((r) => setTimeout(r, 40));
  assert.ok(call(mw, '10.0.0.6').passed);
});
