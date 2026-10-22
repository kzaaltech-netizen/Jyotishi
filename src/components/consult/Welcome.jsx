import React, { useMemo, useRef, useState } from 'react';
import { m } from 'motion/react';
import { Loader2, MapPin, User } from '../icons/index.jsx';
import { GuideBlock, Thinking, UserMessage } from './Message.jsx';
import useChartSummary from '../../hooks/useChartSummary.js';
import { useApp } from '../../context/AppContext.jsx';
import { useTokens } from '../../context/TokenContext.jsx';
import { autocompleteCities } from '../../lib/geocoding.js';
import useT from '../../hooks/useT.js';

const appear = (i) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15 + i * 0.45, duration: 0.22 },
});

// Starter questions, written in the app's language so the guide answers in it too.
function useSuggestions(s, tr) {
  return useMemo(() => {
    const { t, f, house, sign, planet } = tr;
    const w = t.welcome;
    const h10 = s.house(10);
    const h7 = s.house(7);
    const dasha = s.maha ? [s.maha, s.antar].filter(Boolean).map(planet).join('–') : null;
    return [
      { mode: 'career', q: h10 ? f(w.suggestCareer, { house: house(10), sign: sign(h10.sign) }) : w.suggestCareerPlain },
      { mode: 'union', q: h7 ? f(w.suggestMarriage, { house: house(7) }) : w.suggestMarriagePlain },
      { mode: 'wealth', q: w.suggestMoney },
      { mode: 'abundance', q: dasha ? f(w.suggestDasha, { dasha }) : w.suggestPhase },
    ];
  }, [s, tr]);
}

// "Mars–Venus" in the app's language.
const dashaName = (s, planet) => (s.maha ? [s.maha, s.antar].filter(Boolean).map(planet).join('–') : null);

// Greeting shown when a chart exists but the conversation is empty.
export function WelcomeMessage({ guide, onPick, afterChart = false }) {
  const s = useChartSummary();
  const tr = useT();
  const { t, f, sign, nak, planet } = tr;
  const w = t.welcome;
  const suggestions = useSuggestions(s, tr);
  const dasha = dashaName(s, planet);
  const lines = [
    f(w.hello, { name: s.firstName ? ` ${s.firstName}` : '', guide: guide.name }),
    s.valid
      ? f(w.chartOpen, {
          lagna: sign(s.lagna?.sign),
          moon: sign(s.moon?.sign),
          nak: s.moonNakshatra ? ` (${nak(s.moonNakshatra)})` : '',
          dasha: dasha ? f(w.chartOpenDasha, { dasha }) : '',
        })
      : w.chartReady,
    f(w.askAnything, { topics: guide.mode === 'general' ? w.generalTopics : guide.topic }),
  ];
  const shownLines = afterChart ? lines.slice(-1) : lines;

  return (
    <GuideBlock guide={guide}>
      <div className="space-y-3 text-[15.5px] leading-[1.7]">
        {shownLines.map((l, i) => (
          <m.p key={i} {...appear(i)}>{l}</m.p>
        ))}
      </div>
      <m.div className="mt-4 grid gap-2 sm:grid-cols-2" {...appear(shownLines.length)}>
        {suggestions.map((sug) => (
          <button
            key={sug.q}
            type="button"
            className="rounded-xl border border-line bg-panel/80 px-4 py-3 text-left text-sm transition-colors hover:border-accent/40 hover:bg-panel-2"
            onClick={() => onPick(sug.q, sug.mode)}
          >
            {sug.q}
          </button>
        ))}
      </m.div>
    </GuideBlock>
  );
}

// Shown once, right after the chart is calculated in this chat.
export function ChartReadyNote({ guide, onOpenChart }) {
  const s = useChartSummary();
  const { t, f, sign, nak, planet } = useT();
  if (!s.valid) return null;
  const w = t.welcome;
  const dasha = dashaName(s, planet);
  const facts = [
    s.lagna && f(w.lagnaFact, { sign: sign(s.lagna.sign) }),
    s.moon && f(w.moonFact, { sign: sign(s.moon.sign) }),
    s.moonNakshatra && f(w.nakFact, { nak: nak(s.moonNakshatra) }),
    dasha && f(w.dashaFact, { dasha }),
  ].filter(Boolean);
  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <GuideBlock guide={guide}>
        <p className="text-[15.5px] leading-[1.7]">{f(w.done, { name: s.firstName ? `, ${s.firstName}` : '' })}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {facts.map((f) => <span key={f} className="pill bg-accent-soft text-accent">{f}</span>)}
        </div>
        <button type="button" className="btn-quiet -ml-3 mt-2" onClick={onOpenChart}>
          {w.seeChart}
        </button>
      </GuideBlock>
    </m.div>
  );
}

// Birth details collected inside the chat, so a visitor goes from question to answer without leaving it.
export function ChatOnboarding({ guide }) {
  const { generateNewChart, isGenerating, user } = useApp();
  const { deduct } = useTokens();
  const { t, f } = useT();
  const b = t.birthForm;
  const pending = useMemo(() => sessionStorage.getItem('pending_chart_query'), []);
  const [form, setForm] = useState({ fullName: user?.name && user.name !== 'Seeker' ? user.name : '', dob: '', birthTime: '', birthplace: '' });
  const [city, setCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [unknownTime, setUnknownTime] = useState(false);
  const debounce = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onCity = (val) => {
    set('birthplace', val);
    setCity(null);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (val.length < 2) return setCities([]);
      setSearching(true);
      setCities(await autocompleteCities(val));
      setSearching(false);
    }, 400);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.dob || (!form.birthTime && !unknownTime) || !form.birthplace.trim()) {
      setError(b.missing);
      return;
    }
    setError('');
    setSent(true);
    try {
      deduct('generate_chart', 'Generate natal chart');
      // Unknown time: noon is the usual convention; planet signs stay reliable, houses less so.
      await generateNewChart({ ...form, birthTime: unknownTime ? '12:00' : form.birthTime, lat: city?.lat, lon: city?.lon });
    } catch (err) {
      setSent(false);
      setError(err.message || b.failed);
    }
  };

  return (
    <div className="space-y-6">
      {pending && <UserMessage msg={{ content: pending }} />}
      <GuideBlock guide={guide}>
        <div className="space-y-3 text-[15.5px] leading-[1.7]">
          <m.p {...appear(0)}>{f(b.intro, { guide: guide.name })}</m.p>
          <m.p {...appear(1)}>
            {pending ? b.willAnswer : ''}{b.needDetails}
          </m.p>
        </div>

      {!sent && (
        <m.form {...appear(2)} onSubmit={submit} className="mt-4 max-w-md space-y-3 rounded-2xl border border-line bg-panel/90 p-4 shadow-soft" noValidate>
          <div className="field">
            <User className="h-4 w-4 text-muted" aria-hidden="true" />
            <label htmlFor="co-name" className="sr-only">{b.name}</label>
            <input id="co-name" placeholder={b.name} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="co-dob" className="mb-1 block pl-1 text-xs text-muted">{b.dob}</label>
              <div className="field">
                <input id="co-dob" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div>
              <label htmlFor="co-time" className="mb-1 block pl-1 text-xs text-muted">{b.time}</label>
              <div className={`field ${unknownTime ? 'opacity-50' : ''}`}>
                <input id="co-time" type="time" value={form.birthTime} disabled={unknownTime} onChange={(e) => set('birthTime', e.target.value)} />
              </div>
            </div>
          </div>
          <label className="flex min-h-[36px] cursor-pointer items-center gap-2 pl-1 text-sm text-muted">
            <input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
            {b.unknownTime}
          </label>
          <div>
            <div className="field">
              <MapPin className="h-4 w-4 text-muted" aria-hidden="true" />
              <label htmlFor="co-place" className="sr-only">{b.place}</label>
              <input id="co-place" placeholder={b.place} value={form.birthplace} onChange={(e) => onCity(e.target.value)} autoComplete="off" />
              {searching && <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />}
            </div>
            {cities.length > 0 && (
              <ul className="mt-1 max-h-44 overflow-y-auto rounded-xl border border-line bg-panel" role="listbox" aria-label={b.matches}>
                {cities.map((c) => (
                  <li key={c.displayName}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={city?.displayName === c.displayName}
                      onClick={() => {
                        setCity(c);
                        set('birthplace', c.label.split(',')[0]);
                        setCities([]);
                      }}
                      className="flex min-h-[44px] w-full items-center gap-2 px-3 text-left text-sm hover:bg-panel-2"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={isGenerating}>
            {b.submit}
          </button>
          <p className="text-center text-xs text-muted">{unknownTime ? b.noonNote : b.approxNote}</p>
        </m.form>
      )}
      </GuideBlock>
      {sent && (
        <>
          <UserMessage msg={{ content: `${form.fullName} · ${form.dob} · ${unknownTime ? b.timeUnknown : form.birthTime} · ${form.birthplace}` }} />
          <Thinking guide={guide} label={t.chat.drawing} />
        </>
      )}
    </div>
  );
}
