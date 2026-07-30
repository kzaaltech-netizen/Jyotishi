import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 to access host machine localhost
const API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
const BASE = `${API_HOST}/api`;
const TOKEN_KEY = 'aj_token';

export async function getStoredToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export async function setStoredToken(t) {
  try {
    if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

export async function clearStoredToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = await getStoredToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

// ─── Auth APIs ────────────────────────────────────────────────────────
export async function apiRegister({ name, email, password }) {
  const data = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
  if (data.token) await setStoredToken(data.token);
  return data.user;
}

export async function apiLogin({ email, password }) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  if (data.token) await setStoredToken(data.token);
  return data.user;
}

export async function apiGuestLogin({ name } = {}) {
  const data = await apiFetch('/auth/guest', { method: 'POST', body: { name } });
  if (data.token) await setStoredToken(data.token);
  return data.user;
}

export async function apiGetMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

export async function apiLogout() {
  await clearStoredToken();
}

// ─── Profile APIs ─────────────────────────────────────────────────────
export async function apiGetProfile() {
  const data = await apiFetch('/profile');
  return data.profile;
}

export async function apiSaveProfile(profile) {
  const data = await apiFetch('/profile', { method: 'POST', body: profile });
  return data.profile;
}

// ─── Chart APIs ───────────────────────────────────────────────────────
export async function apiGetChart(type = 'natal') {
  const data = await apiFetch(`/charts/${type}`);
  return data.chart;
}

export async function apiGenerateChart() {
  return apiFetch('/charts/generate', { method: 'POST' });
}

export async function apiRegenerateChart() {
  return apiFetch('/charts/regenerate', { method: 'POST' });
}

// ─── Token APIs ───────────────────────────────────────────────────────
export async function apiGetTokens() {
  return apiFetch('/tokens');
}

// ─── AI APIs ──────────────────────────────────────────────────────────
export async function apiSendAIChat(mode, message) {
  return apiFetch('/ai/chat', { method: 'POST', body: { mode, message } });
}

export async function apiInterpretChart(mode) {
  return apiFetch('/ai/interpret', { method: 'POST', body: { mode } });
}

// ─── Reports & Settings ───────────────────────────────────────────────
export async function apiGetReports() {
  const data = await apiFetch('/reports');
  return data.reports;
}

export async function apiSaveReport(mode, content) {
  const data = await apiFetch('/reports', { method: 'POST', body: { mode, content } });
  return data.report;
}

export async function apiGetSettings() {
  return apiFetch('/settings');
}

export async function apiSaveSettings(settingsData) {
  return apiFetch('/settings', { method: 'PUT', body: settingsData });
}
