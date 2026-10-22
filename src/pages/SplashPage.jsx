import React, { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { ArrowRight, ArrowUp, ChevronDown, Loader2 } from '../components/icons/index.jsx';
import PublicFrame from '../components/shell/PublicFrame.jsx';
import HeroArt from '../components/landing/HeroArt.jsx';
import ChartAnswerDemo from '../components/landing/ChartAnswerDemo.jsx';
import { GUIDES as CHAT_GUIDES, guideFor } from '../lib/guides.js';
import GuruAvatar from '../components/icons/GuruAvatar.jsx';
import AppLink from '../components/ui/AppLink.jsx';
import { useSky } from '../components/sky/NakshatraSky.jsx';
import { useApp } from '../context/AppContext.jsx';
import useContent from '../hooks/useContent.js';
import { FEATURED_GUIDES } from '../content/learn.js';

const DEMO_GUIDE = guideFor('union');

// A short scripted exchange that plays in, the way the real chat does.
function DemoChat({ t, name, topic }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setStep((n) => (n > t.parts.length + 2 ? 0 : n + 1)), step > t.parts.length ? 4000 : 1300);
    return () => clearTimeout(timer);
  }, [step]);
  const shown = Math.max(0, step - 1);

  return (
    <div className="card mx-auto w-full max-w-[440px] overflow-hidden p-0 shadow-soft" role="img" aria-label={t.aria}>
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <GuruAvatar guide={DEMO_GUIDE} size={36} />
        <div className="leading-tight">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted">{topic}</p>
        </div>
      </div>
      <div className="flex min-h-[270px] flex-col gap-5 px-5 py-5" aria-hidden="true">
        {step >= 1 && (
          <m.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[80%] rounded-2xl bg-accent-soft px-4 py-2.5 text-[14.5px]">
            {t.q}
          </m.p>
        )}
        {step >= 2 && (
          <div className="flex gap-3">
            <GuruAvatar guide={DEMO_GUIDE} size={32} />
            <div className="space-y-2.5 pt-0.5 text-[14.5px] leading-relaxed">
              {t.parts.slice(0, shown).map((p, i) => (
                <m.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  {p.map((x, k) =>
                    typeof x === 'string' ? <React.Fragment key={k}>{x}</React.Fragment> : <span key={k} className="mx-0.5 rounded-md bg-accent-soft px-1.5 py-px font-semibold text-accent">{x.ref}</span>
                  )}
                </m.p>
              ))}
              {shown < t.parts.length && (
                <m.p className="italic text-muted" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.6, repeat: Infinity }}>{t.reading}</m.p>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="border-t border-line px-5 py-3 text-xs text-muted">{t.note}</p>
    </div>
  );
}

function AskBox({ onAsk, busy, size = 'lg', t }) {
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    onAsk(q.trim());
  };
  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex items-center gap-2 rounded-xl border border-line bg-panel p-1.5 pl-4 shadow-soft focus-within:border-accent/60 ${size === 'lg' ? 'min-h-[60px]' : 'min-h-[52px]'}`}>
        <label htmlFor={`ask-${size}`} className="sr-only">{t.askLabel}</label>
        <input
          id={`ask-${size}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.askPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted/80"
          maxLength={500}
        />
        <button type="submit" disabled={busy} aria-label={t.askButton} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink hover:bg-accent/90 disabled:opacity-60">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ArrowUp className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}

export default function SplashPage() {
  const { startChat, setCurrentMode, setCurrentPage } = useApp();
  const { setOverride } = useSky();
  const { ui, guides, faq } = useContent();
  const h = ui.home;
  const [busy, setBusy] = useState(false);

  // Show Krittika (the Pleiades) in the sky until the visitor has a chart of their own.
  useEffect(() => {
    setOverride('Krittika');
    return () => setOverride(null);
  }, [setOverride]);

  const go = async (q = '', mode) => {
    if (busy) return;
    setBusy(true);
    try {
      if (mode) setCurrentMode(mode);
      await startChat(q);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicFrame footer>
      {/* Hero */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-16">
        <div>
          <h1 className="font-display text-[44px] leading-[1.04] tracking-tight sm:text-6xl lg:text-[66px]">
            {h.titleA}
            <br />
            <em className="font-normal text-accent">{h.titleB}</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            {h.sub}
          </p>

          <div className="mt-8 max-w-xl">
            <AskBox onAsk={go} busy={busy} t={h} />
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {h.starters.map((s) => (
                <button key={s} type="button" className="chip shrink-0" onClick={() => go(s)} disabled={busy}>{s}</button>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              {h.freeNote}{' '}
              <button type="button" className="inline-block py-1.5 font-medium text-accent hover:underline" onClick={() => setCurrentPage('onboarding')}>
                {h.kundliLink}
              </button>
            </p>
          </div>
        </div>

        <div className="relative">
          <HeroArt className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[115%] -translate-x-1/2 -translate-y-1/2 opacity-70 lg:left-[64%] lg:top-[40%] lg:w-[min(660px,150%)] lg:opacity-100" />
          <DemoChat t={h.demo} name={h.guides.items[DEMO_GUIDE.mode].name || DEMO_GUIDE.name} topic={h.guides.items[DEMO_GUIDE.mode].topic} />
        </div>
      </section>

      {/* The chart answers back */}
      <section className="border-t border-line/70" aria-labelledby="chart-heading">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8">
          <div>
            <h2 id="chart-heading" className="max-w-2xl text-3xl sm:text-4xl">{h.chart.title}</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              {h.chart.p1}
            </p>
            <p className="mt-3 max-w-2xl text-muted">
              {h.chart.p2}
            </p>
          </div>
          <div className="mt-10 rounded-xl border border-line bg-panel p-6 sm:p-10">
            <ChartAnswerDemo t={h.chart} />
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8" aria-labelledby="guides-heading">
        <h2 id="guides-heading" className="text-3xl sm:text-4xl">{h.guides.title}</h2>
        <p className="mt-3 max-w-2xl text-muted">{h.guides.sub}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAT_GUIDES.map((g) => (
            <li key={g.mode}>
              <button
                type="button"
                onClick={() => go('', g.mode)}
                className="flex h-full w-full items-start gap-4 rounded-xl border border-line bg-panel p-5 text-left transition-colors hover:border-ink/30"
              >
                <GuruAvatar guide={g} size={52} />
                <span className="min-w-0">
                  <span className="block font-display text-xl">{h.guides.items[g.mode].name || g.name}</span>
                  <span className="block text-sm text-muted">{h.guides.items[g.mode].topic} · {h.guides.items[g.mode].about}</span>
                  <span className="mt-3 block text-sm italic text-ink/80">“{h.guides.items[g.mode].sample}”</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Learn */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8" aria-labelledby="learn-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="learn-heading" className="text-3xl sm:text-4xl">{h.learnTitle}</h2>
          <AppLink page="learn" className="btn-quiet">{ui.nav.allGuides} <ArrowRight className="h-4 w-4" aria-hidden="true" /></AppLink>
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {FEATURED_GUIDES.map((slug) => guides.find((g) => g.slug === slug)).map((g) => (
            <li key={g.slug}>
              <AppLink page="learn" param={g.slug} className="group flex items-baseline justify-between gap-6 py-4">
                <span>
                  <span className="block text-lg font-semibold group-hover:text-accent">{g.title}</span>
                  <span className="mt-1 block max-w-3xl text-sm text-muted">{g.short}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted group-hover:text-accent" aria-hidden="true" />
              </AppLink>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-8" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-3xl sm:text-4xl">{h.faqTitle}</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {faq.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Last call */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-24 sm:px-8">
        <h2 className="text-3xl sm:text-4xl">{h.lastTitle}</h2>
        <p className="mt-2 text-muted">{h.lastSub}</p>
        <div className="mt-6">
          <AskBox onAsk={go} busy={busy} size="md" t={h} />
        </div>
      </section>
    </PublicFrame>
  );
}
