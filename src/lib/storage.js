// ─── Storage Helpers ───────────────────────────────────────────────────────────
// Thin wrapper around localStorage with JSON serialisation

const PREFIX = 'aj_';

export function storageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {/* quota exceeded – silently ignore */}
}

export function storageRemove(key) {
  localStorage.removeItem(PREFIX + key);
}

export function storageClear() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

// ─── Typed helpers ─────────────────────────────────────────────────────────────

export function getUser()         { return storageGet('user'); }
export function setUser(u)        { storageSet('user', u); }
export function clearUser()       { storageRemove('user'); }

export function getBirthProfile() { return storageGet('birth_profile'); }
export function setBirthProfile(p){ storageSet('birth_profile', p); }

export function getCachedChart(type = 'natal') { return storageGet(`chart_${type}`); }
export function setCachedChart(type, data)     { storageSet(`chart_${type}`, data); }

export function getTokenLedger()  { return storageGet('token_ledger', []); }
export function setTokenLedger(l) { storageSet('token_ledger', l); }

export function getTokenBalance() { return storageGet('token_balance', 50); }
export function setTokenBalance(n){ storageSet('token_balance', n); }

export function getChatHistory(mode = 'general') { return storageGet(`chat_${mode}`, []); }
export function setChatHistory(mode, msgs)        { storageSet(`chat_${mode}`, msgs); }

export function getSubscription() { return storageGet('subscription', null); }
export function setSubscription(s){ storageSet('subscription', s); }

export function getPurchases()    { return storageGet('purchases', []); }
export function setPurchases(p)   { storageSet('purchases', p); }

export function getGeminiKey()    { return storageGet('gemini_key', ''); }
export function setGeminiKey(k)   { storageSet('gemini_key', k); }

export function getSavedReports() { return storageGet('reports', []); }
export function setSavedReports(r){ storageSet('reports', r); }
