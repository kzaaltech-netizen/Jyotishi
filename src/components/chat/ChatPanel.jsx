import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext.jsx';
import { useTokens } from '../../context/TokenContext.jsx';
import CelestialAtmosphere from './CelestialAtmosphere.jsx';
import {
  apiSendAIChat,
  apiGetChatHistory,
  apiClearChat,
  apiGetGurujiSessionStatus,
  apiRecordPaywallInterest,
  apiDevActivatePaidSession,
} from '../../lib/api.js';
import './ChatPanel.css';

const DEFAULT_QUESTIONS = [
  'What is my current phase?',
  'What does my 10th house say about career?',
  'What should I focus on right now?',
];

function formatMessageContent(content) {
  if (!content) return '';
  let text = String(content).trim();

  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      let parts = [];
      if (parsed.title) parts.push(`### ${parsed.title}`);
      if (parsed.answer) parts.push(parsed.answer);
      else if (parsed.summary) parts.push(parsed.summary);
      if (parsed.analysis && parsed.analysis !== parsed.answer) parts.push(parsed.analysis);
      else if (parsed.reply) parts.push(parsed.reply);
      if (parts.length > 0) {
        text = parts.join('\n\n');
      }
    } catch (e) {
      const answerMatch = text.match(/"answer"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/);
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/);
      const analysisMatch = text.match(/"analysis"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/);

      let parts = [];
      if (titleMatch) parts.push(`### ${titleMatch[1]}`);
      if (answerMatch) parts.push(answerMatch[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n'));
      else if (summaryMatch) parts.push(summaryMatch[1]);
      if (analysisMatch) parts.push(analysisMatch[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n'));

      if (parts.length > 0) {
        text = parts.join('\n\n');
      }
    }
  }

  return text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
}

function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ChatPanel({
  mode = 'general',
  externalQuery = null,
  onClearExternalQuery = null,
  motionProfile = null,
  lagnaSign = 'Leo',
  currentDasha = 'Sun',
  onStateChange = null,
}) {
  const { currentPage, setCurrentPage, navigateWithBookOpening } = useApp();
  const { balance, hasTokens, reload: reloadTokens } = useTokens();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedEvidence, setExpandedEvidence] = useState({});
  const [sessionInfo, setSessionInfo] = useState(null);
  const [paywallTrigger, setPaywallTrigger] = useState(null);
  const [isActivatingSession, setIsActivatingSession] = useState(false);

  const feedRef = useRef(null);
  const inputRef = useRef(null);
  const [highlightInput, setHighlightInput] = useState(false);

  // Derive 3-4 contextual suggestions based on actual Kundli
  const contextualQuestions = useMemo(() => {
    return [
      `What does my ${lagnaSign} Lagna say about my core path?`,
      'What does my 10th house say about career?',
      `What does my current ${currentDasha} Dasha mean for my present phase?`,
      'What should I focus on right now?',
    ];
  }, [lagnaSign, currentDasha]);

  // Auto-scroll feed on new messages or loading
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isLoading, paywallTrigger]);

  // Synchronize Guruji Companion State
  useEffect(() => {
    if (isLoading) {
      onStateChange?.('thinking');
    } else if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      onStateChange?.('answer');
    } else {
      onStateChange?.('idle');
    }
  }, [isLoading, messages, onStateChange]);

  // Load session status
  const refreshSessionStatus = async () => {
    try {
      const data = await apiGetGurujiSessionStatus();
      if (data.active && data.session) {
        setSessionInfo({
          active: true,
          remainingSeconds: data.session.remainingSeconds || 0,
          remainingQuestions: data.session.remainingQuestions || 0,
          maxQuestions: data.session.maxQuestions || 20,
        });
      } else {
        setSessionInfo({
          active: false,
          remainingSeconds: 0,
          remainingQuestions: 0,
          maxQuestions: 20,
        });
      }
    } catch {
      setSessionInfo({
        active: false,
        remainingSeconds: 0,
        remainingQuestions: 0,
        maxQuestions: 20,
      });
    }
  };

  // Timer countdown for active paid session
  useEffect(() => {
    if (!sessionInfo?.active || sessionInfo.remainingSeconds <= 0) return;

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

  // External query injection
  useEffect(() => {
    if (externalQuery) {
      setInput(externalQuery);
      setHighlightInput(true);
      const timer = setTimeout(() => setHighlightInput(false), 2400);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (onClearExternalQuery) onClearExternalQuery();
      return () => clearTimeout(timer);
    }
  }, [externalQuery, onClearExternalQuery]);

  // Load mode chat history & session status
  useEffect(() => {
    setMessages([]);
    setError(null);
    setExpandedEvidence({});
    setPaywallTrigger(null);

    const pending = sessionStorage.getItem('pending_chart_query');
    const autoSend = sessionStorage.getItem('pending_chart_auto_send') === 'true';

    if (pending) {
      setInput(pending);
      sessionStorage.removeItem('pending_chart_query');
      if (autoSend) {
        sessionStorage.removeItem('pending_chart_auto_send');
        setTimeout(() => {
          sendInquiry(pending);
        }, 150);
      }
    } else if (!externalQuery) {
      setInput('');
    }

    apiGetChatHistory(mode)
      .then((msgs) => setMessages(msgs))
      .catch(() => {});

    refreshSessionStatus();
  }, [mode]);

  const sendInquiry = async (customText = null) => {
    const text = (customText !== null ? customText : input).trim();
    if (!text || isLoading) return;

    // When on Dashboard or embedded view, seamlessly transition to Big Screen consultation room!
    if (currentPage !== 'ask') {
      navigateWithBookOpening('ask', text, true);
      return;
    }

    if (!hasTokens('chat_message')) {
      setCurrentPage('buy-tokens');
      return;
    }

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    if (customText === null) setInput('');
    setIsLoading(true);
    setError(null);
    setPaywallTrigger(null);

    try {
      const res = await apiSendAIChat(mode, text);
      const aiMsg = {
        role: 'ai',
        content: res.reply || '',
        formatted: res.formatted || null,
        timestamp: new Date().toISOString(),
      };
      setMessages([...next, aiMsg]);
      reloadTokens();

      if (res.session) {
        setSessionInfo((prev) => ({
          ...prev,
          active: true,
          remainingSeconds: res.session.remainingSeconds,
          remainingQuestions: res.session.remainingQuestions,
        }));
      } else if (res.remainingFree !== undefined) {
        setSessionInfo((prev) => ({
          ...prev,
          remainingFree: res.remainingFree,
        }));
      }
    } catch (err) {
      if (err.code === 'DAILY_LIMIT_REACHED') {
        setPaywallTrigger({
          show: true,
          stage: 'interest',
          message: err.message || "Guruji can continue this conversation with you. There's more to explore in your chart.",
        });
      } else if (err.code === 'RATE_LIMITED') {
        setError(err.message || 'Please take a moment between questions. Guruji reflects upon one inquiry at a time.');
      } else if (err.code === 'CONCURRENT_REQUEST') {
        setError(err.message || 'A consultation inquiry is already being processed.');
      } else if (err.code === 'MESSAGE_TOO_LONG') {
        setError(err.message || 'Inquiry exceeds 500 characters. Please ask concisely.');
      } else {
        setError(err.message || 'Consultation request failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendInquiry();
    }
  };

  const toggleEvidence = (msgIndex) => {
    setExpandedEvidence((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  const handleInterestClick = async () => {
    try {
      await apiRecordPaywallInterest({ mode, lastQuery: input });
    } catch (e) {}

    setPaywallTrigger((prev) => ({
      ...prev,
      stage: 'offer',
    }));
  };

  const handleActivatePaidSession = async () => {
    setIsActivatingSession(true);
    try {
      const res = await apiDevActivatePaidSession();
      if (res.success && res.session) {
        setSessionInfo({
          active: true,
          remainingSeconds: res.session.remainingSeconds,
          remainingQuestions: res.session.remainingQuestions,
          maxQuestions: res.session.maxQuestions,
        });
        setPaywallTrigger(null);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Could not initiate consultation session.');
    } finally {
      setIsActivatingSession(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setExpandedEvidence({});
    setPaywallTrigger(null);
    apiClearChat(mode).catch(() => {});
  };

  return (
    <div className="chat-manuscript-card">
      {/* Header — Guruji Personal Consultation */}
      <div className="chat-card-header">
        <div className="chat-agent-info">
          <span className="guruji-header-om">ॐ</span>
          <div>
            <h3 className="font-headline-sm text-on-surface">Ask Guruji · प्रश्न विचार</h3>
            <p className="font-body-sm text-on-surface-variant mt-0.5">
              Personal consultation grounded in your natal Kundli & active Dasha.
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          {currentPage !== 'ask' && (
            <button
              type="button"
              className="btn-expand-bigscreen"
              onClick={() => navigateWithBookOpening('ask', input || null, false)}
              title="Open in Big Screen Consultation Room"
            >
              <span className="material-symbols-outlined icon-xs">open_in_full</span>
              <span>Big Screen · विस्तृत</span>
            </button>
          )}
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat} title="Clear conversation">
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Paid Session Countdown Strip */}
      {sessionInfo?.active && (
        <div className="guruji-active-session-strip">
          <div className="session-strip-left">
            <span className="guruji-tag-om">ॐ</span>
            <span className="font-label-sm font-semibold">Active Private Consultation</span>
          </div>
          <div className="session-strip-right font-label-sm">
            <span className="timer-badge-chip">
              <span className="material-symbols-outlined icon-xs">timer</span>
              <span>{formatDuration(sessionInfo.remainingSeconds)} remaining</span>
            </span>
            <span className="divider-dot">·</span>
            <span className="questions-badge-chip">
              <span className="material-symbols-outlined icon-xs">chat_bubble</span>
              <span>{sessionInfo.remainingQuestions} questions left</span>
            </span>
          </div>
        </div>
      )}

      {/* Consultation Area with Centered Celestial Astrolabe */}
      <div className="chat-feed-viewport">
        <CelestialAtmosphere profile={motionProfile} />
        <div className="chat-feed" ref={feedRef}>
        {messages.length === 0 && (
          <motion.div
            className="chat-empty-state"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Medallion with Dual Rotating Celestial Rings & Breathing Pulse */}
            <motion.div
              className="guruji-om-medallion"
              style={{
                borderColor: motionProfile?.accentTint || 'var(--secondary)',
              }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 4px 16px rgba(122, 88, 10, 0.08)',
                  '0 6px 24px rgba(122, 88, 10, 0.16)',
                  '0 4px 16px rgba(122, 88, 10, 0.08)',
                ],
              }}
              transition={{
                duration: motionProfile?.pulseDuration || 8.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="guruji-empty-om">ॐ</span>
              {/* Primary Clockwise Dashed Halo */}
              <div
                className="om-orbital-halo om-orbital-halo-cw"
                style={{
                  borderColor: motionProfile?.orbitStroke || 'rgba(122, 88, 10, 0.28)',
                }}
              />
              {/* Secondary Counter-Clockwise Dotted Halo */}
              <div
                className="om-orbital-halo om-orbital-halo-ccw"
                style={{
                  borderColor: motionProfile?.accentTint || 'var(--secondary)',
                }}
              />
            </motion.div>

            <div className="empty-title-group">
              <span className="empty-brand-kicker font-label-xs uppercase tracking-widest text-secondary font-bold">
                Astro-AI · Consultation
              </span>
              <h2 className="empty-heading font-headline-md text-on-surface mt-1">
                Ask Guruji
              </h2>
              <p className="empty-subheading font-editorial-italic text-on-surface-variant mt-0.5">
                Ask about your chart.
              </p>
              <p className="empty-provenance font-body-xs text-on-surface-variant opacity-80 mt-1">
                Grounded in your verified {lagnaSign} Kundli & active {currentDasha} Dasha.
              </p>
            </div>

            <div className="starter-questions-grid mt-3">
              {contextualQuestions.map((q, qIdx) => (
                <motion.button
                  key={q}
                  className="starter-question-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + qIdx * 0.06, duration: 0.3 }}
                  whileHover={{ y: -2, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setInput(q);
                    setHighlightInput(true);
                    setTimeout(() => setHighlightInput(false), 2400);
                    inputRef.current?.focus();
                  }}
                >
                  <span className="starter-q-bullet font-bold">·</span>
                  <span className="font-body-sm">{q}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const formatted = msg.formatted;
          const displayAnswer = formatted?.answer || formatMessageContent(msg.content);
          const hasSections = Array.isArray(formatted?.sections) && formatted.sections.length > 0;
          const hasTiming = formatted?.timing?.available && formatted?.timing?.summary;
          const hasActions = Array.isArray(formatted?.actions) && formatted.actions.length > 0;
          const hasEvidence = Array.isArray(formatted?.evidence) && formatted.evidence.length > 0;
          const hasFollowUps = !isUser && Array.isArray(formatted?.followUps) && formatted.followUps.length > 0;

          return (
            <motion.div
              key={i}
              className={`message-row ${isUser ? 'row-user' : 'row-ai'}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
            >
              <div className={`msg-paper ${isUser ? 'paper-user' : 'paper-ai'}`}>
                <div className="msg-header-tag">
                    <span className="font-label-sm font-semibold flex items-center gap-2">
                      {isUser ? (
                        'You'
                      ) : (
                        <>
                          <div className="guruji-msg-avatar">
                            <img
                              src="/guruji.jpg"
                              alt="Guruji"
                              className="guruji-msg-avatar-img"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="guruji-msg-avatar-fallback">ॐ</span>
                          </div>
                          <span className="guruji-tag-om">ॐ</span>
                          <span>Guruji · गुरुजी</span>
                        </>
                      )}
                    </span>
                  <span className="msg-time font-label-sm text-on-surface-variant opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Direct Answer (Guruji speaks in turns, answers first) */}
                <div className="msg-body font-body-md" style={{ whiteSpace: 'pre-wrap' }}>
                  {displayAnswer}
                </div>

                {/* Conditional Sections (Lightweight, non-essay cards) */}
                {hasSections && (
                  <div className="msg-sections-container">
                    {formatted.sections.map((sec, sIdx) => (
                      <div key={sIdx} className={`msg-section-block section-${sec.type || 'interpretation'}`}>
                        <div className="msg-section-title font-title-sm">
                          <span className="section-bullet">
                            {sec.type === 'personality' ? '👁' : '✦'}
                          </span>
                          <span>{sec.title}</span>
                        </div>
                        <p className="msg-section-body font-body-md">{sec.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Conditional Timing Window */}
                {hasTiming && (
                  <div className="msg-timing-block">
                    <div className="timing-badge font-label-sm">
                      <span className="material-symbols-outlined icon-xs">schedule</span>
                      <span>Astrological Timing</span>
                    </div>
                    <p className="timing-summary font-body-sm">{formatted.timing.summary}</p>
                  </div>
                )}

                {/* Conditional Actions / Guidance */}
                {hasActions && (
                  <div className="msg-actions-block">
                    <div className="actions-title font-title-sm">
                      <span>🪷</span>
                      <span>Practical Guidance</span>
                    </div>
                    <ul className="actions-list font-body-sm">
                      {formatted.actions.map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conditional Evidence Accordion (Progressive Disclosure) */}
                {hasEvidence && (
                  <div className="msg-evidence-accordion">
                    <button
                      type="button"
                      className="evidence-toggle-btn font-label-sm"
                      onClick={() => toggleEvidence(i)}
                    >
                      <span className="kundli-provenance-badge">Based on your Kundli</span>
                      <span className="divider-dot">·</span>
                      <span className="evidence-factors-count">
                        {expandedEvidence[i]
                          ? 'Hide planetary factors'
                          : `${formatted.evidence.length} ${formatted.evidence.length === 1 ? 'factor' : 'factors'}`}
                      </span>
                      <span className="material-symbols-outlined icon-xs ml-auto">
                        {expandedEvidence[i] ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {expandedEvidence[i] && (
                        <motion.div
                          className="evidence-pill-grid"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {formatted.evidence.map((ev, eIdx) => (
                            <div key={eIdx} className="evidence-pill">
                              <span className="ev-label font-label-xs">{ev.label}:</span>
                              <span className="ev-value font-body-sm">{ev.value}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Suggested Follow-Ups (Clickable turns for natural conversation) */}
                {hasFollowUps && (
                  <div className="msg-followups-container">
                    <span className="followups-heading font-label-xs">Explore next with Guruji:</span>
                    <div className="followups-chips">
                      {formatted.followUps.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          className="followup-chip-btn font-body-sm"
                          onClick={() => sendInquiry(fu.question)}
                          disabled={isLoading}
                        >
                          <span>{fu.question}</span>
                          <span className="material-symbols-outlined icon-xs">arrow_forward</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Stage 1: Contextual Interest Prompt */}
        {paywallTrigger?.show && paywallTrigger.stage === 'interest' && (
          <div className="message-row row-ai">
            <div className="msg-paper paper-ai guruji-paywall-prompt-card">
              <div className="msg-header-tag">
                <span className="font-label-sm font-semibold flex items-center gap-1.5">
                  <span className="guruji-tag-om">ॐ</span>
                  <span>Guruji · गुरुजी</span>
                </span>
              </div>
              <p className="paywall-prompt-text font-body-md">
                {paywallTrigger.message}
              </p>
              <div className="paywall-prompt-actions">
                <button
                  type="button"
                  className="btn-continue-guruji font-label-md"
                  onClick={handleInterestClick}
                >
                  <span>Continue with Guruji</span>
                  <span className="material-symbols-outlined icon-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Contextual Offer Card (Revealed ONLY after user expresses interest) */}
        {paywallTrigger?.show && paywallTrigger.stage === 'offer' && (
          <div className="message-row row-ai">
            <div className="msg-paper paper-ai guruji-paywall-offer-card">
              <div className="offer-kicker font-label-xs uppercase">
                Private Consultation Session
              </div>
              <h4 className="offer-heading font-headline-sm">
                Continue your conversation with Guruji
              </h4>
              <p className="offer-desc font-body-sm">
                A dedicated one-on-one consultation window grounded in your complete Kundli.
              </p>
              <div className="offer-specs-grid">
                <div className="spec-item">
                  <span className="material-symbols-outlined icon-xs">timer</span>
                  <span className="font-body-sm font-medium">10-minute session</span>
                </div>
                <div className="spec-item">
                  <span className="material-symbols-outlined icon-xs">chat_bubble</span>
                  <span className="font-body-sm font-medium">Up to 20 questions</span>
                </div>
              </div>
              <div className="offer-price-line">
                <span className="price-tag font-headline-md">₹9</span>
                <span className="price-note font-body-sm">consultation window</span>
              </div>
              <div className="offer-cta-group">
                <button
                  type="button"
                  className="btn-offer-continue font-title-sm"
                  onClick={handleActivatePaidSession}
                  disabled={isActivatingSession}
                >
                  <span>{isActivatingSession ? 'Initiating consultation...' : 'Continue'}</span>
                  <span className="material-symbols-outlined icon-sm">arrow_forward</span>
                </button>
                <button
                  type="button"
                  className="btn-offer-dismiss font-label-sm"
                  onClick={() => setPaywallTrigger(null)}
                >
                  Ask tomorrow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guruji Thinking State */}
        {isLoading && (
          <motion.div
            className="message-row row-ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="msg-paper paper-ai loading-paper">
              <div className="thinking-om-ring-wrapper">
                <span className="guruji-tag-om">ॐ</span>
                <span
                  className="thinking-orbital-halo thinking-orbital-halo-inner"
                  style={{
                    borderTopColor: motionProfile?.accentTint || 'var(--secondary)',
                  }}
                />
                <span
                  className="thinking-orbital-halo thinking-orbital-halo-outer"
                  style={{
                    borderBottomColor: motionProfile?.accentTint || 'var(--secondary)',
                  }}
                />
              </div>
              <div className="thinking-content">
                <span className="font-editorial-italic text-on-surface">
                  Reflecting upon your Kundli & active Dasha…
                </span>
                <span className="font-body-xs text-on-surface-variant opacity-75 mt-0.5">
                  Observing planetary dignities & house alignments
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Graceful No-Chart Resolution Card */}
        {error && (typeof error === 'string' && (error.includes('No chart found') || error.includes('Complete onboarding'))) ? (
          <motion.div
            className="no-chart-prompt-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="no-chart-icon-box">
              <span className="no-chart-om">ॐ</span>
            </div>
            <div className="no-chart-text-box">
              <h4 className="font-headline-sm text-on-surface">Natal Kundli Required for Consultation</h4>
              <p className="font-body-sm text-on-surface-variant mt-1">
                Guruji's wisdom is not generic AI advice—every answer is strictly grounded in your verified planetary coordinates, house placements, and active Vimshottari Dasha.
              </p>
              <button
                type="button"
                className="btn-setup-chart font-title-sm mt-3"
                onClick={() => setCurrentPage('onboarding')}
              >
                <span>Enter Birth Details & Generate Kundli</span>
                <span className="material-symbols-outlined icon-sm">arrow_forward</span>
              </button>
            </div>
          </motion.div>
        ) : error ? (
          <div className="auth-error-box font-body-sm">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        ) : null}
        </div>
      </div>

      {/* Form Input */}
      <div className="chat-input-footer">
        <div className={`input-frame ${highlightInput ? 'input-frame-highlight' : ''}`}>
          <textarea
            ref={inputRef}
            className="chat-textarea font-body-md"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Guruji about your chart in English, Hindi, or Hinglish…"
            rows={2}
            disabled={isLoading}
          />
          <button
            className="btn-send-inquiry font-title-md"
            onClick={() => sendInquiry()}
            disabled={!input.trim() || isLoading}
            aria-label="Send inquiry to Guruji"
          >
            <span>Ask</span>
            <span className="material-symbols-outlined icon-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
