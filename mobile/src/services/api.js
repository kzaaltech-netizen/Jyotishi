import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_LAN_IP = '10.18.217.70';
const DEFAULT_PORT = '3001';

export const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:${DEFAULT_PORT}`;
    }
    return `http://localhost:${DEFAULT_PORT}`;
  }

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGoLaunchMetadata?.debuggerHost || '';
  const hostPart = debuggerHost.split(':')[0];

  // If hostPart is a valid IPv4 address (e.g. 192.168.x.x, 10.x.x.x)
  if (hostPart && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostPart)) {
    return `http://${hostPart}:${DEFAULT_PORT}`;
  }

  // Fallback for tunnel mode or emulator
  return `http://${DEFAULT_LAN_IP}:${DEFAULT_PORT}`;
};

export const API_HOST = getBackendUrl();
export const BASE = `${API_HOST}/api`;
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

export async function apiFetch(path, { method = 'GET', body, timeoutMs = 15000 } = {}) {
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
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out connecting to ${API_HOST}. Check your network connection.`);
    }
    if (err.message && (err.message.includes('Network request failed') || err.message.includes('Failed to fetch'))) {
      throw new Error(`Cannot reach server at ${API_HOST}. Ensure your phone and PC are on the same Wi-Fi.`);
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

