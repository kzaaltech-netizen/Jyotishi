import React, { useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { AlertCircle, ArrowRight, Calendar, Clock, Loader2, MapPin, User } from '../components/icons/index.jsx';
import PublicFrame from '../components/shell/PublicFrame.jsx';
import Stepper, { Step } from '../components/reactbits/Stepper.jsx';
import ThoughtLine from '../components/reactbits/ThoughtLine.jsx';
import ConstellationGlyph from '../components/sky/ConstellationGlyph.jsx';
import { useSky } from '../components/sky/NakshatraSky.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { autocompleteCities } from '../lib/geocoding.js';
import useT from '../hooks/useT.js';

// ReactBits Stepper themed with Jyotishly tokens.
const STEPPER_VARS = {
  '--stepper-frame': 'rgb(var(--panel) / 0.9)',
  '--stepper-frame-edge': 'rgb(var(--line))',
  '--stepper-frame-highlight': 'rgb(var(--panel))',
  '--stepper-frame-shadow': '0 24px 48px -24px rgb(var(--shadow) / 0.35)',
  '--stepper-tile': 'rgb(var(--panel))',
  '--stepper-tile-edge': 'rgb(var(--line))',
  '--stepper-tile-highlight': 'rgb(var(--panel))',
  '--stepper-tile-shadow': '0 4px 10px -5px rgb(var(--shadow) / 0.25)',
  '--stepper-well': 'rgb(var(--panel-2))',
  '--stepper-track': 'rgb(var(--line))',
  '--stepper-ink': 'rgb(var(--ink))',
  '--stepper-muted': 'rgb(var(--muted))',
  '--stepper-faint': 'rgb(var(--line))',
  '--stepper-ring': 'rgb(var(--accent) / 0.4)',
  '--stepper-solid': 'rgb(var(--accent))',
  '--stepper-solid-ink': 'rgb(var(--accent-ink))',
  '--stepper-hover-fill': 'rgb(var(--panel-2))',
};

export default function OnboardingPage() {
  const { generateNewChart, setCurrentPage, isGenerating, generateError, user } = useApp();
  const { deduct } = useTokens();
  const { setMood } = useSky();
  const { t, f, sign, nak } = useT();
  const o = t.onboarding;

  const [form, setForm] = useState({ fullName: '', dob: '', birthTime: '', birthplace: '' });
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);
  const [searching, setSearching] = useState(false);
  const [phase, setPhase] = useState('details'); // details | generating | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(1);
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

  const stepError = (n) => {
    if (n === 1 && !form.fullName.trim()) return o.errName;
    if (n === 2 && !form.dob) return o.errDob;
    if (n === 2 && !form.birthTime) return o.errTime;
    if (n === 3 && !form.birthplace.trim()) return o.errPlace;
    return '';
  };

  const generate = async () => {
    for (const n of [1, 2, 3]) {
      const e = stepError(n);
      if (e) return setError(e);
    }
    setError('');
    setPhase('generating');
    setMood('thinking');
    try {
      deduct('generate_chart', 'Generate natal chart');
      const res = await generateNewChart({
        fullName: form.fullName,
        dob: form.dob,
        birthTime: form.birthTime,
        birthplace: form.birthplace,
        lat: city?.lat,
        lon: city?.lon,
      });
      setResult(res);
      setPhase('done');
      setMood('answer');
      setTimeout(() => setMood('idle'), 2500);
    } catch (e) {
      setMood('idle');
      setPhase('details');
      setError(e.message || o.errFailed);
    }
  };

  const firstName = form.fullName.split(' ')[0];
  const moonSign = result?.chart?.planets?.find((p) => p.name === 'Moon')?.sign;
  const nakshatra = result?.chart?.nakshatra?.name || result?.chart?.planets?.find((p) => p.name === 'Moon')?.nakshatra;

  return (
    <PublicFrame>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {phase === 'details' && (
            <m.div key="details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <p className="eyebrow text-center">{o.eyebrow}</p>
              <h1 className="mt-2 text-center text-3xl sm:text-4xl">{o.title}</h1>
              <p className="mx-auto mt-2 max-w-md text-center text-muted">
                {o.sub}
              </p>

              <Stepper
                className="mt-8"
                width="100%"
                theme="light"
                style={STEPPER_VARS}
                step={current}
                onStepChange={setCurrent}
                onFinalStepCompleted={generate}
                nextButtonText={o.next}
                completeButtonText={o.finish}
                backButtonText={o.back}
                nextButtonProps={{
                  disabled: isGenerating,
                  onClick: (e) => {
                    const msg = stepError(current);
                    setError(msg);
                    if (msg) e.preventDefault();
                  },
                }}
              >
                <Step title={o.stepName}>
                  <label htmlFor="ob-name" className="field-label">{o.fullName}</label>
                  <div className="field">
                    <User className="h-4 w-4 text-muted" aria-hidden="true" />
                    <input id="ob-name" type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder={o.namePh} autoComplete="name" />
                  </div>
                </Step>
                <Step title={o.stepTime}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ob-dob" className="field-label">{o.dob}</label>
                      <div className="field">
                        <Calendar className="h-4 w-4 text-muted" aria-hidden="true" />
                        <input id="ob-dob" type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ob-time" className="field-label">{o.time}</label>
                      <div className="field">
                        <Clock className="h-4 w-4 text-muted" aria-hidden="true" />
                        <input id="ob-time" type="time" value={form.birthTime} onChange={(e) => set('birthTime', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted">{o.timeHint}</p>
                </Step>
                <Step title={o.stepPlace}>
                  <label htmlFor="ob-place" className="field-label">{o.place}</label>
                  <div className="field">
                    <MapPin className="h-4 w-4 text-muted" aria-hidden="true" />
                    <input
                      id="ob-place"
                      type="text"
                      value={form.birthplace}
                      onChange={(e) => onCity(e.target.value)}
                      placeholder={o.placePh}
                      autoComplete="off"
                      aria-describedby="ob-place-hint"
                    />
                    {searching && <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />}
                  </div>
                  {cities.length > 0 && (
                    <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-line bg-panel" role="listbox" aria-label={o.matches}>
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
                  <p id="ob-place-hint" className="mt-3 text-xs text-muted">
                    {city ? f(o.using, { place: city.label }) : o.pickHint}
                  </p>
                </Step>
              </Stepper>

              {(error || generateError) && (
                <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-panel/90 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                  {error || generateError}
                </p>
              )}
            </m.div>
          )}

          {phase === 'generating' && (
            <m.div key="gen" className="card p-8" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-2xl">{o.calculating}</h1>
              <div className="mt-5 text-muted">
                <ThoughtLine label={o.readingSky} steps={o.steps} fontSize={15} showTimer={false} collapseOnSettle={false} />
              </div>
            </m.div>
          )}

          {phase === 'done' && (
            <m.div key="done" className="text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <ConstellationGlyph nakshatra={nakshatra} size={120} className="mx-auto" />
              <h1 className="mt-4 justify-center font-display text-4xl sm:text-5xl">{f(o.namaste, { name: firstName })}</h1>
              <p className="mx-auto mt-3 max-w-md text-muted">{o.ready}</p>
              <dl className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
                {[
                  [o.lagna, result?.chart?.lagna?.sign && sign(result.chart.lagna.sign)],
                  [o.moon, moonSign && sign(moonSign)],
                  [o.nakshatra, nakshatra && nak(nakshatra)],
                ].map(([k, v]) => (
                  <div key={k} className="card p-3">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-0.5 font-display text-lg">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
              {user?.isGuest ? (
                // Guests see their chart first; asking a question needs an account.
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button type="button" className="btn-primary" onClick={() => setCurrentPage('kundli')}>
                    {o.seeKundli}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setCurrentPage('dashboard')}>
                    {o.askQuestion}
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-primary mt-8" onClick={() => setCurrentPage('dashboard')}>
                  {o.askFirst}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </PublicFrame>
  );
}
