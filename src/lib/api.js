// ─── API Client ────────────────────────────────────────────────────────────────
// Replaces storage.js — all persistence now goes through the Express backend.
// JWT is stored in localStorage only as a session token; all other data lives in PostgreSQL.

const BASE = '/api';
const TOKEN_KEY = 'aj_token';

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setStoredToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// No client-side Gemini key storage needed in the new architecture

// ─── Guest session ────────────────────────────────────────────────────────────
// Visitors can make a Kundli without an account. The first app call creates one
// guest session; parallel calls share it. Chat endpoints never get one.
let guestRequest = null;

export function apiStartGuest() {
  guestRequest ??= fetch(`${BASE}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Seeker' }),
  })
    .then((res) => res.json().catch(() => ({})))
    .then((data) => {
      if (!data.token) throw new Error(data.error || 'Could not start a session.');
      setStoredToken(data.token);
      return data.user;
    })
    .finally(() => { guestRequest = null; });
  return guestRequest;
}

const needsAccount = (path) => path.startsWith('/ai/') || path.startsWith('/chat');

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export async function apiFetch(path, { method = 'GET', body, raw = false, timeoutMs = 30000 } = {}) {
  if (!getStoredToken() && !path.startsWith('/auth/') && !needsAccount(path)) {
    await apiStartGuest().catch((e) => console.warn('Guest session failed:', e));
  }
  const token = getStoredToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: controller.signal,
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}${path}`, opts);
    clearTimeout(timeoutId);

    if (res.status === 401 && !path.startsWith('/auth/')) {
      clearStoredToken();
      window.dispatchEvent(new Event('jy:session-ended'));
    }

    if (raw) return res;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || data.error || `HTTP ${res.status}`);
      err.code = data.code || data.error;
      err.paywall = data.paywall || null;
      err.data = data;
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeout = new Error('The request took too long. Please try again.');
      timeout.code = 'TIMEOUT';
      throw timeout;
    }
    throw err;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function apiRegister({ name, email, password }) {
  const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
  setStoredToken(data.token);
  return data.user;
}

// Sign in or sign up with the ID token Google Identity Services hands the page.
export async function apiGoogleLogin(credential) {
  const data = await apiFetch('/auth/google', { method: 'POST', body: { credential } });
  setStoredToken(data.token);
  return data.user;
}

export async function apiLogin({ email, password }) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  setStoredToken(data.token);
  return data.user;
}

export async function apiGetMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

// Permanently deletes the account and all its data. Accounts with a password confirm it.
export async function apiDeleteAccount(password) {
  await apiFetch('/auth/me', { method: 'DELETE', body: { password } });
  clearStoredToken();
}

export function apiLogout() {
  clearStoredToken();
}

// ─── Birth Profile ────────────────────────────────────────────────────────────
export async function apiGetProfile() {
  const data = await apiFetch('/profile');
  return data.profile;
}

export async function apiSaveProfile(profile) {
  const data = await apiFetch('/profile', { method: 'POST', body: profile });
  return data.profile;
}

// ─── Charts ───────────────────────────────────────────────────────────────────
export async function apiGetChart(type = 'natal') {
  const data = await apiFetch(`/charts/${type}`);
  return data.chart;
}

export async function apiSaveChart(type = 'natal', chartData) {
  const data = await apiFetch(`/charts/${type}`, { method: 'POST', body: { chartData } });
  return data.chart;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
export async function apiGetTokens() {
  return apiFetch('/tokens');
  // Returns { balance, ledger, todayUsed, totalUsed }
}

export async function apiDeductTokens(action, description = '') {
  return apiFetch('/tokens/deduct', { method: 'POST', body: { action, description } });
  // Returns { success, newBalance, cost }
}

export async function apiAddTokens(amount, packName = 'purchase', price = 0) {
  return apiFetch('/tokens/add', { method: 'POST', body: { amount, packName, price } });
  // Returns { success, newBalance }
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function apiGetChatHistory(mode = 'general') {
  const data = await apiFetch(`/chat/${mode}`);
  return data.messages; // [{ role, content, timestamp }]
}

export async function apiSaveChatMessages(mode, messages) {
  return apiFetch(`/chat/${mode}`, { method: 'POST', body: { messages } });
}

export async function apiClearChat(mode) {
  return apiFetch(`/chat/${mode}`, { method: 'DELETE' });
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export async function apiGetSubscription() {
  const data = await apiFetch('/subscription');
  return data.subscription;
}

export async function apiSaveSubscription(sub) {
  const data = await apiFetch('/subscription', { method: 'POST', body: sub });
  return data.subscription;
}

// ─── Purchases ────────────────────────────────────────────────────────────────
export async function apiGetPurchases() {
  const data = await apiFetch('/purchases');
  return data.purchases;
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export async function apiGetReports() {
  const data = await apiFetch('/reports');
  return data.reports;
}

export async function apiSaveReport(mode, content) {
  const data = await apiFetch('/reports', { method: 'POST', body: { mode, content } });
  return data.report;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function apiGetSettings() {
  return apiFetch('/settings');
}

// ─── AI (Backend Proxy) ───────────────────────────────────────────────────────
// `language` is the app's language code; the guide replies in it unless the message is in another.
export async function apiSendAIChat(mode, message, language) {
  // Returns { reply, formatted, newBalance, session, remainingFree }
  // The server gives the AI up to 50 s; allow a little more before giving up here.
  return apiFetch('/ai/chat', { method: 'POST', body: { mode, message, language }, timeoutMs: 60_000 });
}

export async function apiInterpretChart(mode, language) {
  // Returns { reply, newBalance }
  return apiFetch('/ai/interpret', { method: 'POST', body: { mode, language } });
}

// ─── Guruji Session & Entitlement ─────────────────────────────────────────────
export async function apiGetGurujiSessionStatus() {
  return apiFetch('/ai/guruji/session-status');
}

export async function apiRecordPaywallInterest(metadata = {}) {
  return apiFetch('/ai/guruji/session-interest', { method: 'POST', body: metadata });
}

export async function apiDevActivatePaidSession() {
  return apiFetch('/ai/guruji/dev-activate-session', { method: 'POST' });
}

// ─── VedAstro Chart Generation (Backend) ──────────────────────────────────────
export async function apiGenerateChart() {
  // Calls VedAstro on the backend, saves to DB, returns natal chart
  // Returns { chart, cached }
  return apiFetch('/charts/generate', { method: 'POST' });
}

export async function apiRegenerateChart() {
  // Force-refresh from VedAstro
  // Returns { chart, cached }
  return apiFetch('/charts/regenerate', { method: 'POST' });
}

// ─── Health check ─────────────────────────────────────────────────────────────
export async function apiHealth() {
  return apiFetch('/health');
}
