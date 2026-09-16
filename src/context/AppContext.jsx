import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  apiGetMe, apiRegister, apiLogin, apiGuestLogin, apiLogout,
  apiGetProfile, apiSaveProfile,
  apiGetChart, apiSaveSubscription,
  apiGetSubscription, apiGetSettings, apiGetReports, apiSaveReport,
  apiGenerateChart,
  getStoredToken,
} from '../lib/api.js';
import { geocodeCity, getTimezone } from '../lib/geocoding.js';
import { calculateVedicChart } from '../lib/astrology.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUserState]            = useState(null);
  const [birthProfile, setBirthState]   = useState(null);
  const [chartData, setChartData]       = useState(null);
  const [subscription, setSubState]     = useState(null);
  const [savedReports, setReportsState] = useState([]);
  const [language, setLanguageState]    = useState(() => localStorage.getItem('jyotish_lang') || 'en');
  const [theme, setThemeState]          = useState(() => localStorage.getItem('astro_ai_theme') || 'vedic');

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('astro_ai_theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'cosmic' ? 'vedic' : 'cosmic';
      localStorage.setItem('astro_ai_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'cosmic') {
      document.documentElement.setAttribute('data-theme', 'cosmic');
      document.documentElement.classList.add('theme-cosmic');
      document.body.classList.add('theme-cosmic');
    } else {
      document.documentElement.setAttribute('data-theme', 'vedic');
      document.documentElement.classList.remove('theme-cosmic');
      document.body.classList.remove('theme-cosmic');
    }
  }, [theme]);

  const [currentPage, setCurrentPage]   = useState('loading'); // starts in loading state
  const [currentMode, setCurrentMode]   = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [appLoading, setAppLoading]     = useState(true);
  const [curtainActive, setCurtainActive] = useState(false);
  const [bookTransitionActive, setBookTransitionActive] = useState(false);

  const navigateWithCurtain = useCallback((targetPage, callback) => {
    // 1. Sweep curtain panels closed
    setCurtainActive(true);

    // 2. Change page when curtain has closed over the viewport
    setTimeout(() => {
      setCurrentPage(targetPage);
      if (typeof callback === 'function') callback();

      // 3. Sweep curtain panels open to reveal new view
      setTimeout(() => {
        setCurtainActive(false);
      }, 500);
    }, 450);
  }, []);

  const navigateWithBookOpening = useCallback((targetPage = 'ask', initialQuery = null, autoSend = false, callback = null) => {
    let cb = callback;
    let shouldAutoSend = autoSend;
    if (typeof autoSend === 'function') {
      cb = autoSend;
      shouldAutoSend = false;
    }

    if (initialQuery) {
      sessionStorage.setItem('pending_chart_query', initialQuery);
    }
    if (shouldAutoSend) {
      sessionStorage.setItem('pending_chart_auto_send', 'true');
    }

    setBookTransitionActive(true);

    setTimeout(() => {
      setCurrentPage(targetPage);
      if (typeof cb === 'function') cb();

      setTimeout(() => {
        setBookTransitionActive(false);
      }, 550);
    }, 450);
  }, []);

  const setLanguage = useCallback((langCode) => {
    setLanguageState(langCode);
    localStorage.setItem('jyotish_lang', langCode);
  }, []);

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

        // Load profile & chart data in parallel
        const [profile, chart, sub, settings, reports] = await Promise.allSettled([
          apiGetProfile(),
          apiGetChart('natal'),
          apiGetSubscription(),
          apiGetSettings(),
          apiGetReports(),
        ]);

        const resolvedProfile = profile.status === 'fulfilled' ? profile.value : null;
        let resolvedChart     = chart.status   === 'fulfilled' ? chart.value   : null;
        const resolvedSub     = sub.status     === 'fulfilled' ? sub.value     : null;
        const resolvedReports = reports.status === 'fulfilled' ? reports.value : [];

        // Fallback local calculation if backend has profile but no cached chart
        if (resolvedProfile && !resolvedChart) {
          try {
            resolvedChart = calculateVedicChart(resolvedProfile);
          } catch (e) {
            console.warn('Fallback chart calculation warning:', e);
          }
        }

        setBirthState(resolvedProfile);
        setChartData(resolvedChart);
        setSubState(resolvedSub);
        setReportsState(resolvedReports);

        // Navigate to correct page
        if (!resolvedProfile) {
          setCurrentPage('onboarding');
        } else {
          setCurrentPage('dashboard');
        }
      } catch {
        // Token invalid or offline mode
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
      userData = await apiRegister({ name, email, password: '' });
    } else {
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

    const [profile, chart, sub, settings, reports] = await Promise.allSettled([
      apiGetProfile(),
      apiGetChart('natal'),
      apiGetSubscription(),
      apiGetSettings(),
      apiGetReports(),
    ]);

    const resolvedProfile = profile.status === 'fulfilled' ? profile.value : null;
    let resolvedChart     = chart.status   === 'fulfilled' ? chart.value   : null;

    if (resolvedProfile && !resolvedChart) {
      try {
        resolvedChart = calculateVedicChart(resolvedProfile);
      } catch (e) {
        console.warn('Fallback local calculation:', e);
      }
    }

    setBirthState(resolvedProfile);
    setChartData(resolvedChart);
    if (sub.status === 'fulfilled') setSubState(sub.value);
    if (reports.status === 'fulfilled') setReportsState(reports.value);

    if (!resolvedProfile) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('dashboard');
    }
    return userData;
  }, []);

  const guestLogin = useCallback(async () => {
    let userData;
    try {
      userData = await apiGuestLogin({ name: 'Seeker' });
    } catch {
      userData = { id: 'guest_' + Date.now(), name: 'Seeker', email: 'guest@jyotish.app' };
    }
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
    let saved;
    try {
      saved = await apiSaveProfile(profile);
    } catch (e) {
      saved = profile;
    }
    setBirthState(saved || profile);
    return saved || profile;
  }, []);

  // ── Chart Generation (VedAstro backend + local calculation fallback) ─────
  const generateNewChart = useCallback(async (profile) => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      let lat = profile.lat, lon = profile.lon, timezone = profile.timezone;
      if (!lat || !lon) {
        try {
          const geo = await geocodeCity(profile.birthplace || 'New Delhi');
          lat = geo.lat; lon = geo.lon;
          timezone = await getTimezone(lat, lon);
        } catch {
          lat = 28.6139; lon = 77.2090; timezone = 'Asia/Kolkata';
        }
      }
      const fullProfile = { ...profile, lat, lon, timezone };

      await saveBirthProfile(fullProfile);

      let chart;
      try {
        const result = await apiGenerateChart();
        chart = result.chart;
      } catch (err) {
        console.warn('Backend VedAstro service warning, computing chart locally:', err.message);
        chart = calculateVedicChart(fullProfile);
      }

      setChartData(chart);
      return { chart, profile: fullProfile };
    } catch (err) {
      setGenerateError(err.message || 'Error generating chart');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [saveBirthProfile]);

  // ── Subscription ──────────────────────────────────────────────────────────
  const updateSubscription = useCallback(async (sub) => {
    let saved;
    try {
      saved = await apiSaveSubscription(sub);
    } catch {
      saved = sub;
    }
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
    chartData, setChartData, generateNewChart, isGenerating, generateError,
    subscription, updateSubscription, isPremium,
    savedReports, saveReport,
    currentPage, setCurrentPage,
    currentMode, setCurrentMode,
    language, setLanguage,
    theme, setTheme, toggleTheme,
    appLoading,
    curtainActive, setCurtainActive, navigateWithCurtain,
    bookTransitionActive, setBookTransitionActive, navigateWithBookOpening,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
