import React from 'react';
import { m } from 'motion/react';
import { AlertCircle, ArrowRight, MessageCircle, Timer } from '../icons/index.jsx';
import { formatDuration } from '../../lib/formatMessage.js';
import useT from '../../hooks/useT.js';

export function SessionStrip({ session }) {
  const { t, f } = useT();
  if (!session?.active) return null;
  return (
    <div className="mx-auto mb-3 flex w-full max-w-thread flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold/40 bg-gold-soft/70 px-4 py-2.5 text-sm">
      <span className="font-semibold">{t.notices.privateActive}</span>
      <span className="flex items-center gap-3 text-ink/80 num">
        <span className="inline-flex items-center gap-1"><Timer className="h-4 w-4" aria-hidden="true" />{formatDuration(session.remainingSeconds)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" aria-hidden="true" />{f(t.notices.left, { n: session.remainingQuestions })}</span>
      </span>
    </div>
  );
}

export function PaywallCard({ paywall, onInterest, onActivate, onDismiss, activating }) {
  const { t } = useT();
  if (!paywall) return null;

  if (paywall.stage === 'interest') {
    return (
      <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-panel/90 p-5">
        <p>{paywall.message}</p>
        <button type="button" className="btn-primary mt-4" onClick={onInterest}>
          {t.notices.continue}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </m.div>
    );
  }

  return (
    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gold/40 bg-panel/95 p-6 shadow-lift">
      <p className="eyebrow">{t.notices.privateSession}</p>
      <h3 className="mt-1 text-2xl">{t.notices.keepTalking}</h3>
      <p className="mt-1 text-sm text-muted">{t.notices.windowNote}</p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        <li className="pill"><Timer className="h-3.5 w-3.5" aria-hidden="true" />{t.notices.minutes}</li>
        <li className="pill"><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />{t.notices.upTo}</li>
      </ul>
      <p className="mt-4 font-display text-3xl">₹9</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={onActivate} disabled={activating}>
          {activating ? t.notices.starting : t.notices.start}
          </button>
        <button type="button" className="btn-quiet" onClick={onDismiss}>{t.notices.tomorrow}</button>
      </div>
    </m.div>
  );
}

export function ErrorNotice({ error, onSetup }) {
  const { t } = useT();
  if (!error) return null;
  const needsChart = typeof error === 'string' && (error.includes('No chart found') || error.includes('Complete onboarding'));
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-danger/30 bg-panel/90 p-4 text-sm">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
      <div>
        <p>{needsChart ? t.notices.needChart : error}</p>
        {needsChart && (
          <button type="button" className="btn-primary mt-3" onClick={onSetup}>
            {t.common.addBirthDetails}
          </button>
        )}
      </div>
    </div>
  );
}
