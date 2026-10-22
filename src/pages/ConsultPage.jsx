import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import AppShell from '../components/shell/AppShell.jsx';
import Composer from '../components/consult/Composer.jsx';
import ChatHeader from '../components/consult/ChatHeader.jsx';
import ChartPanel from '../components/consult/ChartPanel.jsx';
import { AiMessage, Thinking, UserMessage } from '../components/consult/Message.jsx';
import { ChartReadyNote, ChatOnboarding, WelcomeMessage } from '../components/consult/Welcome.jsx';
import { ErrorNotice, PaywallCard, SessionStrip } from '../components/consult/Notices.jsx';
import { useSky } from '../components/sky/NakshatraSky.jsx';
import { useApp } from '../context/AppContext.jsx';
import useConsultation from '../hooks/useConsultation.js';
import { useTokens } from '../context/TokenContext.jsx';
import useT from '../hooks/useT.js';
import { primaryFocus } from '../lib/chartRefs.js';
import { formatMessageContent } from '../lib/formatMessage.js';

export default function ConsultPage() {
  const { currentMode, setCurrentMode, setCurrentPage, chartData, saveReport, user } = useApp();
  const { balance, costs } = useTokens();
  const { setMood } = useSky();
  const mode = currentMode || 'general';
  const { t, f, guide: localGuide } = useT();
  const guide = localGuide(mode);
  const ready = Boolean(chartData);
  const chat = useConsultation(mode, ready);
  // True when the chart was calculated during this visit (inline onboarding).
  const startedWithChart = useRef(ready);
  const chartJustMade = ready && !startedWithChart.current;
  const questionsLeft = Math.floor(balance / (costs?.chat_message || 1));
  const saveReply = useCallback((content) => saveReport({ mode, content, timestamp: new Date().toISOString() }), [mode, saveReport]);

  const [input, setInput] = useState('');
  const [highlight, setHighlight] = useState(false);
  const [focus, setFocus] = useState({ house: null, planet: null });
  const [chartOpen, setChartOpen] = useState(false);
  const [liveIndex, setLiveIndex] = useState(-1);
  const [revealing, setRevealing] = useState(false);
  const feedRef = useRef(null);
  const inputRef = useRef(null);
  const wasLoading = useRef(false);

  const prefill = useCallback((text) => {
    setInput(text);
    setHighlight(true);
    setTimeout(() => setHighlight(false), 1800);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // A question handed over from a guide page lands in the input box.
  useEffect(() => {
    if (chat.pendingInput) {
      prefill(chat.pendingInput);
      chat.consumePendingInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.pendingInput, prefill]);

  // "New consultation" from the sidebar.
  const { clear: clearChat } = chat;
  useEffect(() => {
    const onNew = () => {
      clearChat();
      setInput('');
      setFocus({ house: null, planet: null });
    };
    window.addEventListener('jy:new-chat', onNew);
    return () => window.removeEventListener('jy:new-chat', onNew);
  }, [clearChat]);

  // When a reply lands: play it in bubble by bubble, move the chart focus, flash the sky.
  useEffect(() => {
    const last = chat.messages[chat.messages.length - 1];
    if (wasLoading.current && !chat.isLoading && last && last.role !== 'user') {
      setLiveIndex(chat.messages.length - 1);
      setRevealing(true);
      const text = last.formatted?.answer || formatMessageContent(last.content);
      const next = primaryFocus(text, last.formatted?.evidence || []);
      if (next.house || next.planet) setFocus(next);
      setMood('answer');
    }
    wasLoading.current = chat.isLoading;
    if (chat.isLoading) setMood('thinking');
  }, [chat.isLoading, chat.messages, setMood]);

  const onRevealed = useCallback(() => {
    setRevealing(false);
    setMood('idle');
  }, [setMood]);

  useEffect(() => () => setMood('idle'), [setMood]);

  // Keep the newest bubble in view.
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return undefined;
    const t = setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }), 60);
    return () => clearTimeout(t);
  }, [chat.messages.length, chat.isLoading, chat.paywall, revealing, ready]);

  const send = async (text) => {
    setInput('');
    const ok = await chat.send(text);
    if (!ok && text) setInput((cur) => cur || text);
  };

  const onRef = (ref) => {
    setFocus(ref.type === 'house' ? { house: ref.house, planet: null } : { house: null, planet: ref.planet });
    if (window.matchMedia('(max-width: 1279px)').matches) setChartOpen(true);
  };

  const askFromChart = (q) => {
    setChartOpen(false);
    prefill(q);
  };

  const lastAi = chat.messages.reduce((idx, m, i) => (m.role !== 'user' ? i : idx), -1);
  const status = chat.isLoading ? t.chat.reading : guide.topic;

  return (
    <AppShell fixed hideMobileTop>
      <div className="flex min-h-0 flex-1">
        <section aria-label={f(t.chat.chatWith, { name: guide.name })} className="flex min-w-0 flex-1 flex-col">
          <ChatHeader
            guide={guide}
            status={status}
            onGuideChange={setCurrentMode}
            onOpenChart={() => setChartOpen(true)}
            onClear={chat.clear}
            canClear={chat.messages.length > 0}
          />

          <div ref={feedRef} className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
            <div className="mx-auto flex w-full max-w-thread flex-col gap-7 px-4 py-6 sm:px-6">

              {!ready ? (
                <ChatOnboarding guide={guide} />
              ) : (
                <>
                  {chartJustMade && <ChartReadyNote guide={guide} onOpenChart={() => setChartOpen(true)} />}
                  {chat.messages.length === 0 && !chat.isLoading && (
                    <WelcomeMessage
                      key={mode}
                      guide={guide}
                      afterChart={chartJustMade}
                      onPick={(q, m) => {
                        if (m && m !== mode) setCurrentMode(m);
                        send(q);
                      }}
                    />
                  )}

                  {chat.messages.map((msg, i) =>
                    msg.role === 'user' ? (
                      <UserMessage key={i} msg={msg} />
                    ) : (
                      <AiMessage
                        key={i}
                        msg={msg}
                        guide={guide}
                        focus={focus}
                        onRef={onRef}
                        live={i === liveIndex}
                        isLast={i === lastAi}
                        onRevealed={i === liveIndex ? onRevealed : undefined}
                        onFollowUp={send}
                        onSave={saveReply}
                        disabled={chat.isLoading}
                      />
                    )
                  )}

                  <AnimatePresence>{chat.isLoading && <Thinking key="thinking" guide={guide} />}</AnimatePresence>

                  <PaywallCard
                    paywall={chat.paywall}
                    activating={chat.activating}
                    onInterest={() => chat.expressInterest(input)}
                    onActivate={chat.activateSession}
                    onDismiss={chat.dismissPaywall}
                  />
                  <ErrorNotice error={chat.error} onSetup={() => setCurrentPage('onboarding')} />
                </>
              )}
            </div>
          </div>

          <div className="safe-bottom px-3 pb-3 pt-2 sm:px-6 sm:pb-5">
            <div className="mx-auto w-full max-w-thread">
              <SessionStrip session={chat.sessionInfo} />
              {ready && user?.isGuest && (
                <p className="mb-2 text-center text-xs text-muted">{t.chat.guestNote}</p>
              )}
              {ready && !user?.isGuest && questionsLeft <= 3 && (
                <p className="mb-2 flex items-center justify-center gap-2 text-xs text-muted">
                  {questionsLeft <= 0 ? t.chat.outOfQuestions : questionsLeft === 1 ? t.chat.questionLeft : f(t.chat.questionsLeft, { n: questionsLeft })}
                  <button type="button" className="font-semibold text-accent hover:underline" onClick={() => setCurrentPage('buy-tokens')}>{t.common.addTokens}</button>
                </p>
              )}
              <Composer
                ref={inputRef}
                value={input}
                onChange={setInput}
                onSend={send}
                busy={chat.isLoading}
                disabled={!ready}
                placeholder={ready ? guide.placeholder : t.chat.fillFirst}
                highlight={highlight}
              />
            </div>
          </div>
        </section>

        <aside aria-label={t.chat.yourChart} className="glass hidden w-[380px] shrink-0 border-y-0 border-r-0 xl:block">
          <ChartPanel focus={focus} onFocus={setFocus} onAsk={askFromChart} />
        </aside>
      </div>

      <AnimatePresence>
        {chartOpen && (
          <m.div
            className="fixed inset-0 z-40 bg-ink/40 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setChartOpen(false)}
          >
            <m.div
              role="dialog"
              aria-modal="true"
              aria-label={t.chat.yourChart}
              className="safe-bottom absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-hidden rounded-t-3xl border border-line bg-panel shadow-lift sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-3xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-[85dvh] sm:h-full">
                <ChartPanel focus={focus} onFocus={setFocus} onAsk={askFromChart} onClose={() => setChartOpen(false)} />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
