import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiGetTokens,
  apiDeductTokens,
  apiAddTokens,
  apiGetPurchases,
  getStoredToken,
} from '../lib/api.js';
import { useApp } from './AppContext.jsx';

const TokenContext = createContext(null);

export const TOKEN_COSTS = {
  generate_chart:    5,
  generate_analysis: 3,
  chat_message:      1,
  deep_analysis:     5,
  chart_rerun:       3,
};

export function TokenProvider({ children }) {
  const [balance,   setBalanceState]  = useState(50);
  const [ledger,    setLedgerState]   = useState([]);
  const [purchases, setPurchaseState] = useState([]);
  const [todayUsed, setTodayUsed]     = useState(0);
  const [totalUsed, setTotalUsed]     = useState(0);
  const [loaded,    setLoaded]        = useState(false);

  // ── Load token state from backend when token is available ──────────────────
  const loadTokenData = useCallback(async () => {
    if (!getStoredToken()) return;
    try {
      const [tokenData, purchasesData] = await Promise.allSettled([
        apiGetTokens(),
        apiGetPurchases(),
      ]);

      if (tokenData.status === 'fulfilled') {
        const { balance, ledger, todayUsed, totalUsed } = tokenData.value;
        setBalanceState(balance ?? 50);
        setLedgerState(ledger ?? []);
        setTodayUsed(todayUsed ?? 0);
        setTotalUsed(totalUsed ?? 0);
      }
      if (purchasesData.status === 'fulfilled') {
        setPurchaseState(purchasesData.value.purchases ?? purchasesData.value ?? []);
      }
      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, []);

  // Load once per signed-in user (guest or account): on start, after sign-in, after
  // switching accounts. Signing out resets to the defaults.
  const { user } = useApp();
  const userId = user?.id || null;
  useEffect(() => {
    if (!userId) {
      setBalanceState(50);
      setLedgerState([]);
      setPurchaseState([]);
      setLoaded(false);
      return;
    }
    loadTokenData();
  }, [userId, loadTokenData]);

  // ── Deduct tokens (optimistic update + API call) ──────────────────────────
  const deduct = useCallback(async (action, description = '') => {
    const cost = TOKEN_COSTS[action] ?? 1;
    if (balance < cost) return { success: false, error: 'Insufficient tokens' };

    // Optimistic update
    const optimisticBalance = balance - cost;
    setBalanceState(optimisticBalance);

    try {
      const result = await apiDeductTokens(action, description);
      // Sync with server's authoritative balance
      setBalanceState(result.newBalance);

      // Refresh full ledger in background
      apiGetTokens().then(data => {
        setLedgerState(data.ledger ?? []);
        setTodayUsed(data.todayUsed ?? 0);
        setTotalUsed(data.totalUsed ?? 0);
      }).catch(() => {});

      return { success: true, newBalance: result.newBalance, cost };
    } catch (err) {
      // Roll back optimistic update
      setBalanceState(balance);
      return { success: false, error: err.message };
    }
  }, [balance]);

  const hasTokens = useCallback((action) => {
    const cost = TOKEN_COSTS[action] ?? 1;
    return balance >= cost;
  }, [balance]);

  // ── Add tokens (top-up) ───────────────────────────────────────────────────
  const addTokens = useCallback(async (amount, packName = 'purchase', price = 0) => {
    try {
      const result = await apiAddTokens(amount, packName, price);
      setBalanceState(result.newBalance);

      // Refresh full state
      apiGetTokens().then(data => {
        setLedgerState(data.ledger ?? []);
        setTodayUsed(data.todayUsed ?? 0);
        setTotalUsed(data.totalUsed ?? 0);
      }).catch(() => {});

      apiGetPurchases().then(data => {
        setPurchaseState(data.purchases ?? data ?? []);
      }).catch(() => {});
    } catch (err) {
      // The purchase page shows the reason; only unexpected failures are logged.
      if (err.code !== 'PAYMENTS_UNAVAILABLE') console.error('[addTokens]', err);
      throw err;
    }
  }, []);

  const value = {
    balance,
    ledger,
    purchases,
    deduct,
    hasTokens,
    addTokens,
    todayUsed,
    totalUsed,
    loaded,
    costs: TOKEN_COSTS,
    reload: loadTokenData,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useTokens must be used within TokenProvider');
  return ctx;
}
