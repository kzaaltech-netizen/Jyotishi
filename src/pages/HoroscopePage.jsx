import React, { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Briefcase, ChevronDown, Heart, Loader2, MessageCircle, Moon, RefreshCw, Sunrise, Sun } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import Spotlight from '../components/ui/Spotlight.jsx';
import { NoChart } from './KundliPage.jsx';
import { useApp } from '../context/AppContext.jsx';
import useChartSummary from '../hooks/useChartSummary.js';
import { apiInterpretChart } from '../lib/api.js';
import { askInConsult } from '../lib/navigation.js';
import useT from '../hooks/useT.js';

function Sphere({ Icon, title, badge, text, footer }) {
  return (
    <Spotlight innerClassName="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 font-display text-lg">
          <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
          {title}
        </span>
        <span className="pill">{badge}</span>
      </div>
      <p className="mt-3 text-[15px]">{text}</p>
      <p className="mt-3 text-xs text-muted">{footer}</p>
    </Spotlight>
  );
}

function Ruler({ id, open, onToggle, symbol, title, sub, body, facts }) {
  return (
    <div className="border-b border-line last:border-0">
      <button type="button" onClick={() => onToggle(id)} aria-expanded={open} className="flex min-h-[64px] w-full items-center gap-4 py-3 text-left">
        <span className="deva flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{symbol}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          <span className="block text-sm text-muted">{sub}</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pb-3 pl-14 text-[15px]">{body}</p>
            <div className="flex flex-wrap gap-2 pb-4 pl-14">
              {facts.map((f) => <span key={f} className="pill">{f}</span>)}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HoroscopePage() {
  const app = useApp();
  const s = useChartSummary();
  const tr = useT();
  const { t, f, sign, planet: pn, nak, dignity, house: hn } = tr;
  const d = t.today;
  const [open, setOpen] = useState('maha');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sun = s.planet('Sun');
  const venus = s.planet('Venus');
  const jupiter = s.planet('Jupiter');
  const saturn = s.planet('Saturn');
  const h7 = s.house(7);
  const h10 = s.house(10);
  const mahaP = s.maha ? s.planet(s.maha) : null;
  const antarP = s.antar ? s.planet(s.antar) : null;

  const spheres = useMemo(() => {
    if (!s.valid) return [];
    const h10names = h10?.planets?.map((p) => pn(p.name)).join(', ');
    return [
      {
        Icon: Moon,
        title: d.mind,
        badge: s.moon ? f(d.moonBadge, { house: hn(s.moon.house) }) : d.moonOnly,
        text: (s.moon && d.moonHouse[s.moon.house]) || d.moonDefault,
        footer: s.moon ? `${s.moon.nakshatra ? nak(s.moon.nakshatra) : ''}${s.moon.pada ? ` · ${f(t.common.pada, { n: s.moon.pada })}` : ''}` : '',
      },
      {
        Icon: Briefcase,
        title: d.work,
        badge: h10 ? f(d.houseBadge, { house: hn(10), sign: sign(h10.sign) }) : hn(10),
        text: h10
          ? h10names
            ? f(d.workWith, { planets: h10names, house: hn(10), lord: pn(h10.lord) })
            : f(d.workRuled, { house: hn(10), lord: pn(h10.lord) })
          : d.workDefault,
        footer: h10 ? f(t.common.lord, { name: pn(h10.lord) }) : '',
      },
      {
        Icon: Heart,
        title: d.relationships,
        badge: h7 ? f(d.houseBadge, { house: hn(7), sign: sign(h7.sign) }) : hn(7),
        text: h7
          ? f(d.love, { sign: sign(h7.sign), lord: pn(h7.lord), venus: venus ? f(d.loveVenus, { sign: sign(venus.sign) }) : '' })
          : d.loveDefault,
        footer: venus ? f(d.venusFoot, { deg: venus.deg, sign: sign(venus.sign) }) : '',
      },
      {
        Icon: Sun,
        title: d.energy,
        badge: s.lagna ? f(t.welcome.lagnaFact, { sign: sign(s.lagna.sign) }) : t.kundli.lagna,
        text: s.lagna
          ? f(d.energyText, { sign: sign(s.lagna.sign), sun: sun ? f(d.energySun, { house: hn(sun.house) }) : '' })
          : d.energyDefault,
        footer: s.lagnaLord ? f(d.lagnaLord, { lord: pn(s.lagnaLord) }) : '',
      },
    ];
  }, [s, h7, h10, venus, sun, tr]);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiInterpretChart('forecast', tr.code);
      setForecast(res?.formatted || (res?.reply ? { summary: res.reply } : null));
    } catch (err) {
      setError(err.message || d.failed);
    } finally {
      setLoading(false);
    }
  };

  const today = tr.date(new Date(), { weekday: 'long', day: 'numeric', month: 'long' });

  if (!s.valid) {
    return (
      <AppShell>
        <Page eyebrow={d.noChartEyebrow} title={d.noChartTitle}><NoChart /></Page>
      </AppShell>
    );
  }

  const toggle = (id) => setOpen((cur) => (cur === id ? null : id));
  const dashaLabel = s.maha ? [s.maha, s.antar].filter(Boolean).map(pn).join('–') : '';
  const where = (p) => (p ? f(d.signDeg, { sign: sign(p.sign), deg: p.deg, house: hn(p.house) }) : null);

  return (
    <AppShell>
      <Page
        eyebrow={f(d.eyebrow, { date: today })}
        title={d.title}
        subtitle={f(d.subtitle, { lagna: sign(s.lagna?.sign), moon: s.moon ? sign(s.moon.sign) : '—', nak: s.moonNakshatra ? ` (${nak(s.moonNakshatra)})` : '', dasha: dashaLabel })}
        actions={
          <button type="button" className="btn-primary" onClick={() => askInConsult(app, d.askQ, 'forecast')}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {d.ask}
          </button>
        }
        width="max-w-6xl"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-xl">{d.areas}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {spheres.map((sp) => <Sphere key={sp.title} {...sp} />)}
              </div>
            </section>

            <section className="card px-5 py-2">
              <h2 className="pb-1 pt-4 text-xl">{d.periodTitle}</h2>
              <Ruler
                id="maha" open={open === 'maha'} onToggle={toggle}
                symbol={mahaP ? tr.abbr(mahaP) : s.maha?.slice(0, 2)}
                title={f(d.mahaTitle, { planet: pn(s.maha) })}
                sub={where(mahaP) || d.mainPeriod}
                body={f(d.mahaBody, { planet: pn(s.maha), sign: mahaP ? sign(mahaP.sign) : d.yourChart, house: mahaP ? hn(mahaP.house) : '' })}
                facts={[f(d.nakFact, { nak: mahaP?.nakshatra ? nak(mahaP.nakshatra) : '—' }), f(d.dignityFact, { dignity: dignity(mahaP?.dignity || 'Normal') })]}
              />
              {s.antar && (
                <Ruler
                  id="antar" open={open === 'antar'} onToggle={toggle}
                  symbol={antarP ? tr.abbr(antarP) : s.antar.slice(0, 2)}
                  title={f(d.antarTitle, { planet: pn(s.antar) })}
                  sub={where(antarP) || d.subPeriod}
                  body={f(d.antarBody, { planet: pn(s.antar), house: antarP ? hn(antarP.house) : '' })}
                  facts={[f(d.signFact, { sign: antarP ? sign(antarP.sign) : '—' })]}
                />
              )}
              {jupiter && (
                <Ruler
                  id="ju" open={open === 'ju'} onToggle={toggle} symbol={tr.abbr(jupiter)} title={d.jupiterTitle}
                  sub={where(jupiter)}
                  body={f(d.jupiterBody, { house: hn(jupiter.house) })}
                  facts={[f(d.nakFact, { nak: jupiter.nakshatra ? nak(jupiter.nakshatra) : '—' }), jupiter.isRetrograde ? t.common.retrograde : t.common.direct]}
                />
              )}
              {saturn && (
                <Ruler
                  id="sa" open={open === 'sa'} onToggle={toggle} symbol={tr.abbr(saturn)} title={d.saturnTitle}
                  sub={where(saturn)}
                  body={f(d.saturnBody, { house: hn(saturn.house) })}
                  facts={[f(d.nakFact, { nak: saturn.nakshatra ? nak(saturn.nakshatra) : '—' }), saturn.isRetrograde ? t.common.retrograde : t.common.direct]}
                />
              )}
            </section>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="text-lg">{d.forecastTitle}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{d.forecastSub}</p>
              {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
              {forecast ? (
                <div className="mt-4 space-y-2 text-[15px]">
                  {forecast.title && <p className="font-display text-lg">{forecast.title}</p>}
                  {forecast.summary && <p>{forecast.summary}</p>}
                  {forecast.analysis && <p className="text-sm text-muted">{forecast.analysis}</p>}
                  {forecast.recommendations?.length > 0 && (
                    <ul className="ml-4 list-disc space-y-1 text-sm">
                      {forecast.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  )}
                  <button type="button" className="btn-quiet -ml-3" onClick={generate} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {d.refresh}
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-primary mt-4 w-full" onClick={generate} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sunrise className="h-4 w-4" aria-hidden="true" />}
                  {loading ? d.writing : d.create}
                </button>
              )}
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
