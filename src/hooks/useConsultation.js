import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import useT from './useT.js';
import {
  apiSendAIChat,
  apiGetChatHistory,
  apiClearChat,
  apiGetGurujiSessionStatus,
  apiRecordPaywallInterest,
  apiDevActivatePaidSession,
} from '../lib/api.js';

const EMPTY_SESSION = { active: false, remainingSeconds: 0, remainingQuestions: 0, maxQuestions: 20 };

// All conversation state for one chat mode: history, sending, paid sessions, paywall.
export default function useConsultation(mode, ready = true) {
  const { setCurrentPage, user, locale } = useApp();
  const { t } = useT();
  // Guests can open the chat and add birth details; sending a question asks them to sign in.
  const isGuest = Boolean(user?.isGuest);
  const { hasTokens, reload: reloadTokens } = useTokens();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [paywall, setPaywall] = useState(null);
  const [activating, setActivating] = useState(false);
  const [pendingInput, setPendingInput] = useState(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiGetGurujiSessionStatus();
      setSessionInfo(
        data.active && data.session
          ? {
              active: true,
              remainingSeconds: data.session.remainingSeconds || 0,
              remainingQuestions: data.session.remainingQuestions || 0,
              maxQuestions: data.session.maxQuestions || 20,
            }
          : EMPTY_SESSION
      );
    } catch {
      setSessionInfo(EMPTY_SESSION);
    }
  }, []);

  // Count down an active paid session.
  useEffect(() => {
    if (!sessionInfo?.active || sessionInfo.remainingSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setSessionInfo((prev) => {
        if (!prev || prev.remainingSeconds <= 1) {
          clearInterval(timer);
          return { ...prev, active: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionInfo?.active, sessionInfo?.remainingSeconds]);

  const send = useCallback(
    async (rawText) => {
      const text = (rawText || '').trim();
      if (!text || isLoading) return false;

      if (isGuest) {
        // Keep the question; it is sent as soon as they are signed in.
        sessionStorage.setItem('pending_chart_query', text);
        sessionStorage.setItem('pending_chart_auto_send', 'true');
        setCurrentPage('auth');
        return true;
      }

      if (!hasTokens('chat_message')) {
        setCurrentPage('buy-tokens');
        return false;
      }

      const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
      const next = [...messagesRef.current, userMsg];
      setMessages(next);
      setIsLoading(true);
      setError(null);
      setPaywall(null);

      try {
        const res = await apiSendAIChat(mode, text, locale);
        setMessages([
          ...next,
          { role: 'ai', content: res.reply || '', formatted: res.formatted || null, timestamp: new Date().toISOString() },
        ]);
        reloadTokens();
        if (res.session) {
          setSessionInfo((prev) => ({
            ...prev,
            active: true,
            remainingSeconds: res.session.remainingSeconds,
            remainingQuestions: res.session.remainingQuestions,
          }));
        } else if (res.remainingFree !== undefined) {
          setSessionInfo((prev) => ({ ...prev, remainingFree: res.remainingFree }));
        }
        return true;
      } catch (err) {
        // The question goes back into the box (ConsultPage); drop its bubble so a retry is not doubled.
        setMessages((cur) => cur.filter((m) => m !== userMsg));
        const messagesByCode = {
          RATE_LIMITED: t.notices.wait,
          CONCURRENT_REQUEST: t.notices.busy,
          MESSAGE_TOO_LONG: t.notices.tooLong,
          AI_BUSY: t.notices.aiBusy,
          TIMEOUT: t.notices.aiBusy,
        };
        if (err.code === 'LOGIN_REQUIRED') {
          setCurrentPage('auth');
        } else if (err.code === 'DAILY_LIMIT_REACHED') {
          setPaywall({
            stage: 'interest',
            message: t.notices.dailyLimit,
          });
        } else {
          setError(messagesByCode[err.code] || err.message || t.notices.generic);
          // Put the question back in the box so it can be sent again (this matters for a
          // question sent automatically after sign-in, which never sat in the box).
          setPendingInput(text);
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [mode, isLoading, isGuest, hasTokens, setCurrentPage, reloadTokens, locale, t]
  );

  // Load history whenever the guide changes.
  const [historyLoaded, setHistoryLoaded] = useState(false);
  useEffect(() => {
    setMessages([]);
    setError(null);
    setPaywall(null);
    setHistoryLoaded(false);

    // Guests have no conversations yet.
    if (isGuest) {
      setHistoryLoaded(true);
      return undefined;
    }

    let cancelled = false;
    apiGetChatHistory(mode)
      .then((msgs) => !cancelled && Array.isArray(msgs) && setMessages(msgs))
      .catch(() => {})
      .finally(() => !cancelled && setHistoryLoaded(true));

    refreshSession();
    return () => {
      cancelled = true;
    };
  }, [mode, isGuest, refreshSession]);

  // A question handed over from the home page or a guide: send it (or prefill it)
  // once history is in and the chart exists — answers need a chart.
  useEffect(() => {
    if (!ready || !historyLoaded) return;
    const pending = sessionStorage.getItem('pending_chart_query');
    if (!pending) return;
    const autoSend = sessionStorage.getItem('pending_chart_auto_send') === 'true';
    sessionStorage.removeItem('pending_chart_query');
    sessionStorage.removeItem('pending_chart_auto_send');
    // A guest sees their question ready in the box; sending it asks them to sign in.
    if (autoSend && !isGuest) send(pending);
    else setPendingInput(pending);
    // send is intentionally excluded: it changes with isLoading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, historyLoaded]);

  const clear = useCallback(() => {
    setMessages([]);
    setPaywall(null);
    setError(null);
    apiClearChat(mode).catch(() => {});
  }, [mode]);

  const expressInterest = useCallback(
    async (lastQuery) => {
      try {
        await apiRecordPaywallInterest({ mode, lastQuery });
      } catch {
        /* interest tracking is best-effort */
      }
      setPaywall((prev) => (prev ? { ...prev, stage: 'offer' } : prev));
    },
    [mode]
  );

  const activateSession = useCallback(async () => {
    setActivating(true);
    try {
      const res = await apiDevActivatePaidSession();
      if (res.success && res.session) {
        setSessionInfo({
          active: true,
          remainingSeconds: res.session.remainingSeconds,
          remainingQuestions: res.session.remainingQuestions,
          maxQuestions: res.session.maxQuestions,
        });
        setPaywall(null);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Could not start the session.');
    } finally {
      setActivating(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    setError,
    sessionInfo,
    paywall,
    dismissPaywall: () => setPaywall(null),
    activating,
    send,
    clear,
    expressInterest,
    activateSession,
    pendingInput,
    consumePendingInput: () => setPendingInput(null),
  };
}
