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

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export async function apiFetch(path, { method = 'GET', body, raw = false } = {}) {
  const token = getStoredToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (raw) return res;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function apiRegister({ name, email, password }) {
  const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
  setStoredToken(data.token);
  return data.user;
}

export async function apiLogin({ email, password }) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  setStoredToken(data.token);
  return data.user;
}

export async function apiGuestLogin({ name } = {}) {
  const data = await apiFetch('/auth/guest', { method: 'POST', body: { name } });
  setStoredToken(data.token);
  return data.user;
}

export async function apiGetMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
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
export async function apiSendAIChat(mode, message) {
  // Returns { reply, newBalance }
  return apiFetch('/ai/chat', { method: 'POST', body: { mode, message } });
}

export async function apiInterpretChart(mode) {
  // Returns { reply, newBalance }
  return apiFetch('/ai/interpret', { method: 'POST', body: { mode } });
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
