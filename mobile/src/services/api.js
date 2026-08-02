import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBackendUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:3001`;
    }
    return 'http://localhost:3001';
  }
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGoLaunchMetadata?.debuggerHost || '';
  const ip = debuggerHost.split(':')[0];
  if (ip) {
    return `http://${ip}:3001`;
  }
  return 'http://localhost:3001';
};

const API_HOST = getBackendUrl();
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

export async function apiFetch(path, { method = 'GET', body, timeoutMs = 20000 } = {}) {
  const token = await getStoredToken();

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
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
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

// ─── Purchase & Subscription APIs ─────────────────────────────────────
export async function apiAddTokens({ amount, packName, price }) {
  return apiFetch('/tokens/add', {
    method: 'POST',
    body: { amount, packName, price },
  });
}

export async function apiGetSubscription() {
  const data = await apiFetch('/subscription');
  return data.subscription;
}

export async function apiSaveSubscription({ planType, startDate, endDate }) {
  const data = await apiFetch('/subscription', {
    method: 'POST',
    body: { planType, startDate, endDate },
  });
  return data.subscription;
}

