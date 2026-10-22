import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  apiGetMe, apiRegister, apiLogin, apiLogout, apiDeleteAccount,
  apiGetProfile, apiSaveProfile,
  apiGetChart, apiSaveSubscription,
  apiGetSubscription, apiGetSettings, apiGetReports, apiSaveReport,
  apiGenerateChart, apiStartGuest,
  getStoredToken,
} from '../lib/api.js';
import { geocodeCity, getTimezone } from '../lib/geocoding.js';
import { calculateVedicChart } from '../lib/astrology.js';
import { parsePath, pathFor, initialLocale, ACCOUNT_PAGES, LOCALIZED_PAGES, PUBLIC_PAGES } from '../lib/routes.js';
import { isLoaded, loadLocale } from '../content/index.js';
import { isLocale, localeInfo, storedLocale } from '../content/locales.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUserState]            = useState(null);
  const [birthProfile, setBirthState]   = useState(null);
  const [chartData, setChartData]       = useState(null);
  const [subscription, setSubState]     = useState(null);
  const [savedReports, setReportsState] = useState([]);
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

  // ── Routing: every screen has a URL (see lib/routes.js) ──────────────────
  const initialRoute = useState(() => parsePath(window.location.pathname))[0];
  // Public pages (landing, Learn) render at once; app screens wait for the boot below.
  const [currentPage, setPageState] = useState(() =>
    initialRoute.page && PUBLIC_PAGES.has(initialRoute.page) ? initialRoute.page : 'loading'
  );
  const [routeParam, setRouteParam] = useState(initialRoute.param);
  // One language for the whole app. Home and Learn take it from the URL (/hi/...);
  // app screens use the saved choice. main.jsx loads it before the first render.
  const [locale, setLocaleState] = useState(() => initialLocale(window.location.pathname));
  const localeRef = useRef(locale);
  const routeRef = useRef({ page: currentPage, param: initialRoute.param });

  const setCurrentPage = useCallback((page, param = null, { replace = false } = {}) => {
    // Leaving an English page for an app screen: switch to the saved language.
    const saved = storedLocale();
    if (!LOCALIZED_PAGES.has(page) && saved && saved !== localeRef.current && isLoaded(saved)) {
      localeRef.current = saved;
      setLocaleState(saved);
    }
    setPageState(page);
    setRouteParam(param);
    routeRef.current = { page, param };
    const path = pathFor(page, param, localeRef.current);
    // The 404 screen keeps the address the visitor typed.
    if (page !== 'loading' && page !== 'notfound' && window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({ page, param }, '', path);
      window.scrollTo(0, 0);
    }
  }, []);

  // Switch the public pages to another language and move to that language's URL.
  const changeLocale = useCallback(async (code) => {
    if (!isLocale(code)) return;
    await loadLocale(code);
    localeRef.current = code;
    setLocaleState(code);
    try {
      localStorage.setItem('jy_site_lang', code);
    } catch {
      // Storage may be blocked; the URL still carries the language.
    }
    const { page, param } = routeRef.current;
    const path = pathFor(page, param, code);
    if (page !== 'loading' && window.location.pathname !== path) window.history.pushState({ page, param }, '', path);
  }, []);

  useEffect(() => {
    document.documentElement.lang = localeInfo(locale).hreflang;
  }, [locale]);

  useEffect(() => {
    const onPop = async () => {
      const { page, param } = parsePath(window.location.pathname);
      const lang = initialLocale(window.location.pathname);
      await loadLocale(lang);
      localeRef.current = lang;
      setLocaleState(lang);
      routeRef.current = { page: page || 'splash', param };
      setPageState(page || 'splash');
      setRouteParam(param);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // The API signals an expired session; drop the user and show sign-in on chat screens.
  useEffect(() => {
    const onEnded = () => {
      setUserState(null);
      setPageState((page) => (ACCOUNT_PAGES.has(page) ? 'auth' : page));
    };
    window.addEventListener('jy:session-ended', onEnded);
    return () => window.removeEventListener('jy:session-ended', onEnded);
  }, []);

  const [currentMode, setCurrentMode]   = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [appLoading, setAppLoading]     = useState(true);
  // Page changes animate in App.jsx; these helpers keep their old signatures.
  const navigateWithCurtain = useCallback((targetPage, callback) => {
    setCurrentPage(targetPage);
    if (typeof callback === 'function') callback();
  }, []);

  const navigateWithBookOpening = useCallback((targetPage = 'ask', initialQuery = null, autoSend = false, callback = null) => {
    const cb = typeof autoSend === 'function' ? autoSend : callback;
    if (initialQuery) sessionStorage.setItem('pending_chart_query', initialQuery);
    if (autoSend === true) sessionStorage.setItem('pending_chart_auto_send', 'true');
    setCurrentPage(targetPage);
    if (typeof cb === 'function') cb();
  }, []);


  // ── Bootstrap: load user state from backend on mount ──────────────────────
  useEffect(() => {
    const boot = async () => {
      const token = getStoredToken();
      const deepLink = initialRoute.page;
      const stayPublic = deepLink && PUBLIC_PAGES.has(deepLink) && deepLink !== 'splash';
      if (!token) {
        // Chat asks for sign-in; other app screens start a guest session (effect below).
        if (!deepLink || deepLink === 'splash') setCurrentPage('splash', null, { replace: true });
        else if (ACCOUNT_PAGES.has(deepLink)) setCurrentPage('auth', null, { replace: true });
        else if (!stayPublic) setCurrentPage(deepLink, initialRoute.param, { replace: true });
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

        // Honour the address the visitor opened; otherwise pick a sensible start.
        if (stayPublic && deepLink !== 'auth') {
          // Reading a guide, a policy page or a 404: stay on it.
        } else if (me?.isGuest) {
          // Guests keep the screen they opened; the home page shows their Kundli once made.
          if (deepLink && deepLink !== 'splash') setCurrentPage(deepLink, initialRoute.param, { replace: true });
          else setCurrentPage(resolvedChart ? 'kundli' : 'splash', null, { replace: true });
        } else if (!resolvedProfile) {
          // The chat collects birth details inline.
          setCurrentPage('dashboard', null, { replace: true });
        } else if (deepLink && !['splash', 'auth', 'onboarding'].includes(deepLink)) {
          setCurrentPage(deepLink, initialRoute.param, { replace: true });
        } else {
          setCurrentPage('dashboard', null, { replace: true });
        }
      } catch {
        // Token invalid or offline mode
        if (!stayPublic) setCurrentPage('splash', null, { replace: true });
      } finally {
        setAppLoading(false);
      }
    };
    boot();
  }, []);

  // App screens other than chat work without an account: give visitors a guest session.
  useEffect(() => {
    if (appLoading || user || currentPage === 'loading') return;
    if (PUBLIC_PAGES.has(currentPage) || ACCOUNT_PAGES.has(currentPage)) return;
    apiStartGuest().then(setUserState).catch(() => setCurrentPage('auth', null, { replace: true }));
  }, [appLoading, user, currentPage, setCurrentPage]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const userData = await apiRegister({ name, email, password });
    setUserState(userData);
    // New accounts go straight to the chat, which asks for birth details inline.
    setCurrentPage('dashboard');
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

    // No profile yet: the chat collects birth details inline.
    setCurrentPage('dashboard');
    return userData;
  }, []);

  // Into the chat from anywhere. Visitors sign in first; their question is kept and
  // sent once they're in.
  const startChat = useCallback(async (question = '', { autoSend = true } = {}) => {
    if (question) {
      sessionStorage.setItem('pending_chart_query', question);
      if (autoSend) sessionStorage.setItem('pending_chart_auto_send', 'true');
    }
    // Guests too: the chat collects birth details and asks for sign-in on send.
    setCurrentPage('dashboard');
  }, [setCurrentPage]);

  // Throws on a wrong password; on success the app returns to the home page signed out.
  const deleteAccount = useCallback(async (password) => {
    await apiDeleteAccount(password);
    setUserState(null);
    setBirthState(null);
    setChartData(null);
    setSubState(null);
    setReportsState([]);
    setCurrentPage('splash');
  }, [setCurrentPage]);

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
  // Throws when the server refuses (for example, payments not available yet).
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
    user, register, loginWithPassword, startChat, logout, deleteAccount,
    birthProfile, saveBirthProfile,
    chartData, setChartData, generateNewChart, isGenerating, generateError,
    subscription, updateSubscription, isPremium,
    savedReports, saveReport,
    currentPage, setCurrentPage, routeParam,
    locale, changeLocale,
    currentMode, setCurrentMode,
    language: locale, setLanguage: changeLocale,
    theme, setTheme, toggleTheme,
    appLoading,
    navigateWithCurtain, navigateWithBookOpening,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
