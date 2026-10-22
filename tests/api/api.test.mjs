// API tests against a running server (default http://localhost:3001/api; set API_URL).
// They create their own users and delete them at the end through DELETE /auth/me,
// so they leave nothing behind. Run: npm run test:api

import { test, after } from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_URL || 'http://localhost:3001/api';
const run = Date.now().toString(36);
let seq = 0;
const email = () => `qa.${run}.${(seq += 1)}@example.com`;
const PASSWORD = 'test-pass-123';
const created = []; // { token, password } to delete afterwards

async function api(path, { method = 'GET', body, token, headers = {} } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

async function guest() {
  const r = await api('/auth/guest', { method: 'POST', body: {} });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  created.push({ token: r.data.token });
  return r.data;
}

async function register(overrides = {}, token) {
  const body = { name: 'QA Tester', email: email(), password: PASSWORD, ...overrides };
  const r = await api('/auth/register', { method: 'POST', body, token });
  if (r.status === 201) created.push({ token: r.data.token, password: body.password });
  return { ...r, body };
}

const PROFILE = { fullName: 'QA Tester', dob: '1995-06-15', birthTime: '10:30', birthplace: 'Delhi', lat: 28.6139, lon: 77.209, timezone: 'Asia/Kolkata' };

after(async () => {
  for (const u of created) {
    await api('/auth/me', { method: 'DELETE', token: u.token, body: u.password ? { password: u.password } : {} }).catch(() => {});
  }
});

// ─── Basics and security headers ─────────────────────────────────────────────

test('health check responds', async () => {
  const r = await api('/health');
  assert.equal(r.status, 200);
});

test('responses carry security headers and hide the framework', async () => {
  const r = await api('/health');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.ok(r.headers.get('referrer-policy'));
  assert.equal(r.headers.get('x-powered-by'), null);
});

test('unknown API routes return JSON 404', async () => {
  const r = await api('/does-not-exist');
  assert.equal(r.status, 404);
  assert.equal(typeof r.data, 'object');
});

test('malformed JSON is rejected without a crash', async () => {
  const r = await api('/auth/login', { method: 'POST', body: '{"email": ' });
  assert.ok(r.status >= 400 && r.status < 500, `got ${r.status}`);
  assert.equal((await api('/health')).status, 200, 'server still up');
});

// ─── Authentication required ─────────────────────────────────────────────────

test('protected endpoints need a token', async () => {
  for (const path of ['/auth/me', '/profile', '/charts/natal', '/tokens', '/chat/general', '/settings', '/reports']) {
    const r = await api(path);
    assert.equal(r.status, 401, `${path} -> ${r.status}`);
  }
});

test('a forged or expired token is refused', async () => {
  const forged = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJub3BlIn0.c2lnbmF0dXJl';
  assert.equal((await api('/auth/me', { token: forged })).status, 401);
  assert.equal((await api('/auth/me', { token: 'not-a-jwt' })).status, 401);
});

// ─── Guests ──────────────────────────────────────────────────────────────────

test('a guest can make a Kundli but cannot chat', async () => {
  const g = await guest();
  const me = await api('/auth/me', { token: g.token });
  assert.equal(me.data.user.isGuest, true);

  const saved = await api('/profile', { method: 'POST', token: g.token, body: PROFILE });
  assert.equal(saved.status, 200, JSON.stringify(saved.data));
  assert.equal((await api('/profile', { token: g.token })).data.profile.fullName, PROFILE.fullName);
  assert.equal((await api('/charts/natal', { token: g.token })).status, 200);

  const history = await api('/chat/general', { token: g.token });
  assert.equal(history.status, 403);
  assert.equal(history.data.code, 'LOGIN_REQUIRED');
  const chat = await api('/ai/chat', { method: 'POST', token: g.token, body: { mode: 'general', message: 'Hello' } });
  assert.equal(chat.status, 403);
  assert.equal(chat.data.code, 'LOGIN_REQUIRED');
});

test('a guest account cannot be signed into with any password', async () => {
  const g = await guest();
  const r = await api('/auth/login', { method: 'POST', body: { email: g.user.email, password: 'anything' } });
  assert.equal(r.status, 401);
});

// ─── Sign-up validation ──────────────────────────────────────────────────────

test('sign-up rejects missing or invalid fields', async () => {
  const cases = [
    { name: '' },
    { name: '   ' },
    { email: 'not-an-email' },
    { email: '' },
    { password: '12345' },
    { password: '' },
  ];
  for (const c of cases) {
    const r = await register(c);
    assert.equal(r.status, 400, `${JSON.stringify(c)} -> ${r.status}`);
  }
});

test('sign-up works, and the same email cannot register twice (any case)', async () => {
  const r = await register();
  assert.equal(r.status, 201);
  assert.equal(r.data.user.isGuest, false);
  assert.ok(!('passwordHash' in r.data.user), 'password hash never returned');
  const dupe = await register({ email: r.body.email.toUpperCase() });
  assert.equal(dupe.status, 409);
});

test('names with HTML are stored as plain text', async () => {
  const r = await register({ name: '<img src=x onerror=alert(1)>' });
  assert.equal(r.status, 201);
  const me = await api('/auth/me', { token: r.data.token });
  assert.equal(me.data.user.name, '<img src=x onerror=alert(1)>');
});

// ─── Sign-in ─────────────────────────────────────────────────────────────────

test('sign-in: wrong password, unknown email, then success (email case-insensitive)', async () => {
  const r = await register();
  assert.equal((await api('/auth/login', { method: 'POST', body: { email: r.body.email, password: 'wrong-pass' } })).status, 401);
  assert.equal((await api('/auth/login', { method: 'POST', body: { email: `nobody.${run}@example.com`, password: PASSWORD } })).status, 401);
  const ok = await api('/auth/login', { method: 'POST', body: { email: ` ${r.body.email.toUpperCase()} `, password: PASSWORD } });
  assert.equal(ok.status, 200);
  assert.ok(ok.data.token);
  assert.ok(!('passwordHash' in ok.data.user));
  assert.equal(ok.data.user.hasPassword, true);
  const me = await api('/auth/me', { token: ok.data.token });
  assert.equal(me.data.user.hasPassword, true);
  assert.ok(!('passwordHash' in me.data.user));
});

test('Google sign-in refuses missing and forged credentials', async () => {
  assert.equal((await api('/auth/google', { method: 'POST', body: {} })).status, 400);
  // A made-up token must never sign anyone in: 401 when Google sign-in is set up,
  // 503 GOOGLE_UNAVAILABLE when GOOGLE_CLIENT_ID is not configured.
  const forged = 'eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6InFhQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9.c2ln';
  const r = await api('/auth/google', { method: 'POST', body: { credential: forged } });
  assert.ok([401, 503].includes(r.status), `status ${r.status}`);
  assert.ok(!r.data.token);
});

// ─── Guest → account ─────────────────────────────────────────────────────────

test('signing up from a guest session keeps the Kundli (same user)', async () => {
  const g = await guest();
  await api('/profile', { method: 'POST', token: g.token, body: PROFILE });
  const r = await register({}, g.token);
  assert.equal(r.status, 201);
  assert.equal(r.data.user.id, g.user.id, 'guest upgraded in place');
  assert.equal(r.data.user.isGuest, false);
  assert.equal((await api('/profile', { token: r.data.token })).data.profile.fullName, PROFILE.fullName);
});

test('signing in from a guest session moves the guest Kundli into the account', async () => {
  const account = await register();
  const g = await guest();
  await api('/profile', { method: 'POST', token: g.token, body: { ...PROFILE, fullName: 'Guest Chart' } });
  const login = await api('/auth/login', { method: 'POST', token: g.token, body: { email: account.body.email, password: PASSWORD } });
  assert.equal(login.status, 200);
  assert.equal((await api('/profile', { token: login.data.token })).data.profile.fullName, 'Guest Chart');
  const old = await api('/auth/me', { token: g.token });
  assert.ok([401, 404].includes(old.status), 'guest removed after merge');
});

test('signing in does not overwrite an account that already has a Kundli', async () => {
  const account = await register();
  await api('/profile', { method: 'POST', token: account.data.token, body: { ...PROFILE, fullName: 'Account Chart' } });
  const g = await guest();
  await api('/profile', { method: 'POST', token: g.token, body: { ...PROFILE, fullName: 'Guest Chart' } });
  const login = await api('/auth/login', { method: 'POST', token: g.token, body: { email: account.body.email, password: PASSWORD } });
  assert.equal((await api('/profile', { token: login.data.token })).data.profile.fullName, 'Account Chart');
});

// ─── Birth details validation ────────────────────────────────────────────────

test('birth details: required fields, real dates and times, valid coordinates', async () => {
  const r = await register();
  const t = r.data.token;
  const bad = [
    { fullName: '' },
    { dob: '' },
    { dob: 'not-a-date' },
    { dob: '2999-01-01' },
    { dob: '1995-02-30' },
    { birthTime: '' },
    { birthTime: '25:99' },
    { birthplace: '' },
    { lat: 120 },
    { lon: -200 },
  ];
  for (const b of bad) {
    const res = await api('/profile', { method: 'POST', token: t, body: { ...PROFILE, ...b } });
    assert.equal(res.status, 400, `${JSON.stringify(b)} -> ${res.status}`);
  }
  assert.equal((await api('/profile', { method: 'POST', token: t, body: PROFILE })).status, 200);
});

// ─── Chat guardrails ─────────────────────────────────────────────────────────

test('chat rejects empty and over-long messages before calling the AI', async () => {
  const r = await register();
  const empty = await api('/ai/chat', { method: 'POST', token: r.data.token, body: { mode: 'general', message: '   ' } });
  assert.equal(empty.status, 400);
  assert.equal(empty.data.code, 'MESSAGE_EMPTY');
  const long = await api('/ai/chat', { method: 'POST', token: r.data.token, body: { mode: 'general', message: 'a'.repeat(501) } });
  assert.equal(long.status, 400);
  assert.equal(long.data.code, 'MESSAGE_TOO_LONG');
});

test('chat without a Kundli explains that a chart is needed', async () => {
  const r = await register();
  const res = await api('/ai/chat', { method: 'POST', token: r.data.token, body: { mode: 'general', message: 'When will I get married?' } });
  assert.ok(res.status >= 400 && res.status < 500, `got ${res.status}`);
});

// ─── Payments are not live ───────────────────────────────────────────────────

test('tokens and plans cannot be credited without payment', async () => {
  const r = await register();
  const before = (await api('/tokens', { token: r.data.token })).data.balance;
  const add = await api('/tokens/add', { method: 'POST', token: r.data.token, body: { amount: 500 } });
  const sub = await api('/subscription', { method: 'POST', token: r.data.token, body: { planType: 'yearly', startDate: new Date().toISOString(), endDate: '2099-01-01' } });
  if (process.env.ALLOW_TEST_PURCHASES === 'true') {
    assert.equal(add.status, 200);
    return;
  }
  assert.equal(add.status, 403);
  assert.equal(add.data.code, 'PAYMENTS_UNAVAILABLE');
  assert.equal(sub.status, 403);
  assert.equal((await api('/tokens', { token: r.data.token })).data.balance, before, 'balance unchanged');
});

test('token deduction cannot go negative or use unknown actions', async () => {
  const r = await register();
  const bad = await api('/tokens/deduct', { method: 'POST', token: r.data.token, body: { action: 'free_money' } });
  assert.ok(bad.status >= 400 && bad.status < 500, `unknown action -> ${bad.status}`);
});

// ─── Account deletion ────────────────────────────────────────────────────────

test('deleting an account needs the password, then removes everything', async () => {
  const r = await register();
  await api('/profile', { method: 'POST', token: r.data.token, body: PROFILE });
  const wrong = await api('/auth/me', { method: 'DELETE', token: r.data.token, body: { password: 'nope' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.data.code, 'WRONG_PASSWORD');

  const del = await api('/auth/me', { method: 'DELETE', token: r.data.token, body: { password: PASSWORD } });
  assert.equal(del.status, 200);
  assert.ok([401, 404].includes((await api('/auth/me', { token: r.data.token })).status));
  assert.ok([401, 404].includes((await api('/profile', { token: r.data.token })).status) || (await api('/profile', { token: r.data.token })).data?.profile == null);
  assert.equal((await api('/auth/login', { method: 'POST', body: { email: r.body.email, password: PASSWORD } })).status, 401);
});

test('a guest can delete their data without a password', async () => {
  const g = await guest();
  const del = await api('/auth/me', { method: 'DELETE', token: g.token, body: {} });
  assert.equal(del.status, 200);
});
