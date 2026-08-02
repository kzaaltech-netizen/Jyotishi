import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGetProfile, apiGetChart, apiGetTokens, apiGenerateChart } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setProfile(null);
      setActiveChart(null);
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const p = await apiGetProfile().catch(() => null);
      setProfile(p);

      if (p) {
        const c = await apiGetChart('natal').catch(() => null);
        setActiveChart(c?.chartData || null);
      }

      const t = await apiGetTokens().catch(() => null);
      if (t?.balance !== undefined) setTokenBalance(t.balance);
    } catch (e) {
      console.warn('[AppContext] Failed to load data:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      const t = await apiGetTokens();
      if (t?.balance !== undefined) setTokenBalance(t.balance);
    } catch (e) {}
  };

  const generateChart = async () => {
    setLoading(true);
    try {
      const res = await apiGenerateChart();
      if (res?.chart?.chartData) {
        setActiveChart(res.chart.chartData);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{ profile, setProfile, activeChart, setActiveChart, tokenBalance, refreshTokens, generateChart, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
