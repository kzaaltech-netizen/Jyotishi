import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiGetMe, apiRegister, apiLogin, apiGuestLogin, apiLogout,
  apiGetProfile, apiSaveProfile,
  apiGetChart, apiSaveChart,
  apiGetSubscription, apiSaveSubscription,
  apiGetSettings, apiGetReports, apiSaveReport,
  apiGenerateChart,
  getStoredToken,
} from '../lib/api.js';
import { geocodeCity, getTimezone } from '../lib/geocoding.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUserState]            = useState(null);
  const [birthProfile, setBirthState]   = useState(null);
  const [chartData, setChartData]       = useState(null);
  const [subscription, setSubState]     = useState(null);
  const [savedReports, setReportsState] = useState([]);

  const [currentPage, setCurrentPage]   = useState('loading'); // starts in loading state
  const [currentMode, setCurrentMode]   = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [appLoading, setAppLoading]     = useState(true);

  // ── Bootstrap: load user state from backend on mount ──────────────────────
  useEffect(() => {
    const boot = async () => {
      const token = getStoredToken();
      if (!token) {
        setCurrentPage('splash');
        setAppLoading(false);
        return;
      }
      try {
        // Restore user from token
        const me = await apiGetMe();
        setUserState(me);

        // Load the rest in parallel
        const [profile, chart, sub, settings, reports] = await Promise.allSettled([
          apiGetProfile(),
          apiGetChart('natal'),
          apiGetSubscription(),
          apiGetSettings(),
          apiGetReports(),
        ]);

        const resolvedProfile = profile.status === 'fulfilled' ? profile.value : null;
        const resolvedChart   = chart.status   === 'fulfilled' ? chart.value   : null;
        const resolvedSub     = sub.status     === 'fulfilled' ? sub.value     : null;
        const resolvedReports = reports.status === 'fulfilled' ? reports.value : [];

        setBirthState(resolvedProfile);
        setChartData(resolvedChart);
        setSubState(resolvedSub);
        setReportsState(resolvedReports);

        // Navigate to correct page
        if (!resolvedProfile || !resolvedChart) {
          setCurrentPage('onboarding');
        } else {
          setCurrentPage('dashboard');
        }
      } catch {
        // Token invalid/expired — send back to splash
        apiLogout();
        setCurrentPage('splash');
      } finally {
        setAppLoading(false);
      }
    };
    boot();
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password, name, isGuest = false }) => {
    let userData;
    if (isGuest) {
      userData = await apiGuestLogin({ name });
    } else if (!password) {
      // register
      userData = await apiRegister({ name, email, password: '' });
    } else {
      // login with password — try login first, then register
      userData = await apiLogin({ email, password });
    }
    setUserState(userData);
    setCurrentPage('onboarding');
    return userData;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const userData = await apiRegister({ name, email, password });
    setUserState(userData);
    setCurrentPage('onboarding');
    return userData;
  }, []);

  const loginWithPassword = useCallback(async ({ email, password }) => {
    const userData = await apiLogin({ email, password });
    setUserState(userData);

    // Load existing data for this user
    const [profile, chart, sub, settings, reports] = await Promise.allSettled([
      apiGetProfile(),
      apiGetChart('natal'),
      apiGetSubscription(),
      apiGetSettings(),
      apiGetReports(),
    ]);

    const resolvedProfile = profile.status === 'fulfilled' ? profile.value : null;
    const resolvedChart   = chart.status   === 'fulfilled' ? chart.value   : null;

    setBirthState(resolvedProfile);
    setChartData(resolvedChart);
    if (sub.status === 'fulfilled') setSubState(sub.value);
    if (reports.status === 'fulfilled') setReportsState(reports.value);

    if (!resolvedProfile || !resolvedChart) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('dashboard');
    }
    return userData;
  }, []);

  const guestLogin = useCallback(async () => {
    const userData = await apiGuestLogin({ name: 'Cosmic Traveller' });
    setUserState(userData);
    setCurrentPage('onboarding');
    return userData;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUserState(null);
    setBirthState(null);
    setChartData(null);
    setSubState(null);
    setReportsState([]);
    setCurrentPage('splash');
  }, []);

  // ── Profile ───────────────────────────────────────────────────────────────
  const saveBirthProfile = useCallback(async (profile) => {
    const saved = await apiSaveProfile(profile);
    setBirthState(saved || profile);
    return saved;
  }, []);

  // ── Chart Generation (VedAstro — server-side) ─────────────────────────────
  const generateNewChart = useCallback(async (profile) => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      // Geocode if lat/lon not already provided
      let lat = profile.lat, lon = profile.lon, timezone = profile.timezone;
      if (!lat || !lon) {
        const geo = await geocodeCity(profile.birthplace);
        lat = geo.lat; lon = geo.lon;
        timezone = await getTimezone(lat, lon);
      }
      const fullProfile = { ...profile, lat, lon, timezone };

      // Save profile to backend (VedAstro needs lat/lon/tz)
      await saveBirthProfile(fullProfile);

      // Call backend to generate chart via VedAstro
      // The backend reads the birth profile from DB, calls VedAstro API,
      // saves all charts (D1, D9, D10, etc.) to PostgreSQL, and returns D1.
      const result = await apiGenerateChart();
      const chart = result.chart;
      setChartData(chart);

      return { chart, profile: fullProfile };
    } catch (err) {
      setGenerateError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [saveBirthProfile]);

  // ── Subscription ──────────────────────────────────────────────────────────
  const updateSubscription = useCallback(async (sub) => {
    const saved = await apiSaveSubscription(sub);
    setSubState(saved || sub);
  }, []);

  const isPremium = useCallback(() => {
    if (!subscription) return false;
    return new Date(subscription.endDate) > new Date();
  }, [subscription]);

  // ── Reports ───────────────────────────────────────────────────────────────
  const saveReport = useCallback(async (report) => {
    const saved = await apiSaveReport(report.mode, report.content).catch(() => null);
    const updated = [saved || report, ...savedReports].slice(0, 20);
    setReportsState(updated);
  }, [savedReports]);

  const value = {
    user, login, register, loginWithPassword, guestLogin, logout,
    birthProfile, saveBirthProfile,
    chartData, generateNewChart, isGenerating, generateError,
    subscription, updateSubscription, isPremium,
    savedReports, saveReport,
    currentPage, setCurrentPage,
    currentMode, setCurrentMode,
    appLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
