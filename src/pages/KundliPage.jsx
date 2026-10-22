import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Info, Loader2, MessageCircle } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import SouthIndianChart from '../components/chart/SouthIndianChart.jsx';
import PlanetDetailModal from '../components/chart/PlanetDetailModal.jsx';
import HouseDetailModal from '../components/chart/HouseDetailModal.jsx';
import DashaTimeline from '../components/chart/DashaTimeline.jsx';
import PlanetaryTable from '../components/chart/PlanetaryTable.jsx';
import { DIGNITY_LEGEND } from '../components/chart/chartStyles.js';
import { normalizeChartData } from '../components/chart/chartDataNormalizer.js';
import Segmented from '../components/ui/Segmented.jsx';
import Spotlight from '../components/ui/Spotlight.jsx';
import ConstellationGlyph from '../components/sky/ConstellationGlyph.jsx';
import { useApp } from '../context/AppContext.jsx';
import { apiGetChart } from '../lib/api.js';
import { askInConsult } from '../lib/navigation.js';
import useT from '../hooks/useT.js';

const TABS = ['d1', 'd9', 'd10', 'planets', 'dasha'];

export function NoChart() {
  const { setCurrentPage } = useApp();
  const { t } = useT();
  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <ConstellationGlyph nakshatra={null} size={72} className="mx-auto" />
      <h2 className="mt-4 text-2xl">{t.kundli.noChart}</h2>
      <p className="mt-2 text-muted">{t.kundli.noChartSub}</p>
      <button type="button" className="btn-primary mt-6" onClick={() => setCurrentPage('onboarding')}>
        {t.common.addBirthDetails}
      </button>
    </div>
  );
}

export default function KundliPage() {
  const app = useApp();
  const { chartData, setChartData, birthProfile } = app;
  const { t, f, sign, planet: planetName, nak, house: houseName } = useT();
  const k = t.kundli;
  const TITLES = k.titles;
  const [tab, setTab] = useState('d1');
  const [style, setStyle] = useState('north');
  const [planet, setPlanet] = useState(null);
  const [house, setHouse] = useState(null);
  const [loadingDiv, setLoadingDiv] = useState(false);

  // Fetch divisional charts on demand.
  useEffect(() => {
    if (!['d9', 'd10'].includes(tab) || chartData?.divisionals?.[tab] || !setChartData) return;
    setLoadingDiv(true);
    apiGetChart(tab)
      .then((data) => {
        if (data) {
          setChartData((prev) => (prev ? { ...prev, divisionals: { ...(prev.divisionals || {}), [tab]: data } } : prev));
        }
      })
      .catch((err) => console.warn(`Could not load ${tab} chart:`, err))
      .finally(() => setLoadingDiv(false));
  }, [tab, chartData, setChartData]);

  const d1 = useMemo(() => (chartData ? normalizeChartData(chartData) : null), [chartData]);
  const divValid = useMemo(() => {
    const div = chartData?.divisionals?.[tab];
    return div ? normalizeChartData(div).isValid : false;
  }, [chartData, tab]);

  const ask = (q, mode = 'general') => askInConsult(app, q, mode);

  if (!chartData) {
    return (
      <AppShell>
        <Page eyebrow={k.eyebrow} title={k.title}><NoChart /></Page>
      </AppShell>
    );
  }

  if (!d1?.isValid) {
    return (
      <AppShell>
        <Page eyebrow={k.eyebrow} title={k.title}>
          <div className="card mx-auto max-w-md p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" aria-hidden="true" />
            <p className="mt-3">{k.calculating}</p>
            {d1?.error && <p className="mt-2 text-sm text-danger">{d1.error}</p>}
          </div>
        </Page>
      </AppShell>
    );
  }

  const { planets, lagna, dasha, houses, nakshatra } = d1;
  const moon = planets.find((p) => p.name === 'Moon');
  const maha = dasha?.currentMahadasha;
  const isChartTab = ['d1', 'd9', 'd10'].includes(tab);
  const chartForTab = tab === 'd1' ? chartData : chartData.divisionals?.[tab];
  const Chart = style === 'north' ? NorthIndianChart : SouthIndianChart;

  const nakName = nakshatra?.name || moon?.nakshatra;
  const mahaName = maha?.planet || maha?.lord;
  const metrics = [
    { label: k.lagna, value: sign(lagna.sign), sub: f(k.degHouse, { deg: lagna.deg, house: houseName(1) }), onClick: () => setHouse(houses[0]) },
    { label: k.moon, value: moon ? sign(moon.sign) : '—', sub: moon ? f(k.degHouse, { deg: moon.deg, house: houseName(moon.house) }) : '', onClick: () => moon && setPlanet(moon) },
    { label: k.nakshatra, value: nakName ? nak(nakName) : '—', sub: f(t.common.pada, { n: nakshatra?.pada || moon?.pada || '—' }) },
    { label: k.mahadasha, value: mahaName ? planetName(mahaName) : '—', sub: maha?.endDate ? f(t.common.until, { year: String(maha.endDate).slice(0, 4) }) : '' },
  ];

  return (
    <AppShell>
      <Page
        eyebrow={k.eyebrow}
        title={birthProfile?.fullName ? f(k.titleNamed, { name: birthProfile.fullName }) : k.title}
        subtitle={[birthProfile?.dob, birthProfile?.birthTime, birthProfile?.birthplace].filter(Boolean).join(' · ')}
        actions={
          <button type="button" className="btn-primary" onClick={() => ask(f(k.askMain, { sign: sign(lagna.sign) }))}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {k.askKundli}
          </button>
        }
        width="max-w-6xl"
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Spotlight key={metric.label} onClick={metric.onClick} label={metric.onClick ? f(k.showDetails, { label: metric.label, value: metric.value }) : undefined} innerClassName="p-4">
              <span className="block text-xs text-muted">{metric.label}</span>
              <span className="mt-1 block font-display text-2xl">{metric.value}</span>
              <span className="block text-xs text-muted num">{metric.sub}</span>
            </Spotlight>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-full overflow-x-auto scrollbar-none">
            <Segmented label={k.view} value={tab} onChange={setTab} options={TABS.map((value) => ({ value, label: k.tabs[value] }))} />
          </div>
          {isChartTab && (
            <Segmented
              size="sm"
              label={t.chartPanel.style}
              value={style}
              onChange={setStyle}
              options={[{ value: 'north', label: t.chartPanel.north }, { value: 'south', label: t.chartPanel.south }]}
            />
          )}
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="card p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <m.div key={tab + style} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {isChartTab && loadingDiv && (
                  <div className="py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent" aria-hidden="true" />
                    <p className="mt-3 text-muted">{f(k.loadingDiv, { title: TITLES[tab] })}</p>
                  </div>
                )}
                {isChartTab && !loadingDiv && tab !== 'd1' && !divValid && (
                  <div className="py-12 text-center">
                    <Info className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
                    <p className="mt-3 font-semibold">{f(k.divMissing, { title: TITLES[tab] })}</p>
                    <p className="mt-1 text-sm text-muted">{k.divMissingSub}</p>
                    <button type="button" className="btn-ghost mt-4" onClick={() => setTab('d1')}>{k.backD1}</button>
                  </div>
                )}
                {isChartTab && !loadingDiv && (tab === 'd1' || divValid) && (
                  <div className="mx-auto max-w-[520px]">
                    <Chart
                      chartData={chartForTab}
                      title={TITLES[tab]}
                      selectedPlanet={planet}
                      selectedHouse={house?.number}
                      onSelectPlanet={(p) => { setPlanet(p); setHouse(null); }}
                      onSelectHouse={(h) => { setHouse(h); setPlanet(null); }}
                    />
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                      {DIGNITY_LEGEND.map((d) => (
                        <span key={d.label} className="inline-flex items-center gap-1.5">
                          <span className={`h-3 w-4 rounded border ${d.swatch}`} />{t.chart.legend[d.label] || d.label}
                        </span>
                      ))}
                      <span>{k.retro}</span>
                      <span className="ml-auto">{k.tapHint}</span>
                    </div>
                  </div>
                )}
                {tab === 'planets' && <PlanetaryTable planetaryData={planets} onSelectPlanet={setPlanet} />}
                {tab === 'dasha' && <DashaTimeline dashaData={dasha} />}
              </m.div>
            </AnimatePresence>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">{k.askAbout}</p>
            {[
              { ...k.asks.marriage, q: f(k.asks.marriage.q, { sign: sign(houses[6]?.sign) }), m: 'union' },
              { ...k.asks.career, q: f(k.asks.career.q, { sign: sign(houses[9]?.sign) }), m: 'career' },
              { ...k.asks.mind, q: f(k.asks.mind.q, { sign: moon ? sign(moon.sign) : '' }), m: 'general' },
              { ...k.asks.timing, q: f(k.asks.timing.q, { planet: mahaName ? planetName(mahaName) : '' }), m: 'abundance' },
            ].map((x) => (
              <button key={x.label} type="button" onClick={() => ask(x.q, x.m)} className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl border border-line bg-panel/80 px-4 text-left text-sm hover:border-accent/40 hover:bg-panel-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </Page>

      <PlanetDetailModal planet={planet} onClose={() => setPlanet(null)} onAskOracle={(q) => ask(q)} />
      <HouseDetailModal
        house={house}
        onClose={() => setHouse(null)}
        onSelectPlanet={(p) => { setHouse(null); setPlanet(p); }}
        onAskOracle={(q) => ask(q)}
      />
    </AppShell>
  );
}
