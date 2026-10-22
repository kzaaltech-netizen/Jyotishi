import React, { useState } from 'react';
import { m } from 'motion/react';
import { MessageCircle, X } from '../icons/index.jsx';
import NorthIndianChart from '../chart/NorthIndianChart.jsx';
import SouthIndianChart from '../chart/SouthIndianChart.jsx';
import ConstellationGlyph from '../sky/ConstellationGlyph.jsx';
import Segmented from '../ui/Segmented.jsx';
import { useApp } from '../../context/AppContext.jsx';
import useChartSummary from '../../hooks/useChartSummary.js';
import useT from '../../hooks/useT.js';

function FocusCard({ focus, summary, onAsk, onClear }) {
  const { t, f, house: houseName, sign, planet: planetName, nak, dignity } = useT();
  const c = t.chartPanel;
  const house = focus.house ? summary.house(focus.house) : null;
  const planet = focus.planet ? summary.planet(focus.planet) : null;

  if (!house && !planet) {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-panel-2/60 p-4">
        <ConstellationGlyph nakshatra={summary.moonNakshatra} size={52} className="shrink-0" />
        <div className="min-w-0 text-sm">
          <p className="font-display text-lg">{summary.moonNakshatra ? nak(summary.moonNakshatra) : c.yourNakshatra}</p>
          <p className="text-muted">{c.tapHint}</p>
        </div>
      </div>
    );
  }

  const title = house
    ? f(c.houseTitle, { house: houseName(house.number), sign: sign(house.sign) })
    : f(c.planetTitle, { planet: planetName(planet.name), sign: sign(planet.sign) });
  const detail = house
    ? `${f(t.common.lord, { name: planetName(house.lord) })} · ${house.planets?.length ? house.planets.map((p) => planetName(p.name)).join(', ') : c.noPlanets}`
    : `${houseName(planet.house)} · ${dignity(planet.dignity || 'Normal')}${planet.isRetrograde ? ' · ℞' : ''}`;
  const question = house
    ? f(c.askHouse, { house: houseName(house.number), sign: sign(house.sign), lord: planetName(house.lord), theme: t.names.houses[house.number]?.theme || c.myLife })
    : f(c.askPlanet, { planet: planetName(planet.name), sign: sign(planet.sign), house: houseName(planet.house) });

  return (
    <m.div key={title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-accent/30 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg">{title}</p>
          <p className="text-sm text-muted">{detail}</p>
        </div>
        <button type="button" className="icon-btn -mr-2 -mt-2 shrink-0" onClick={onClear} aria-label={c.clearFocus}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="btn-ghost mt-3 w-full" onClick={() => onAsk(question)}>
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {c.askThis}
      </button>
    </m.div>
  );
}

// Right-hand companion to the chat: the chart that answers back.
export default function ChartPanel({ focus, onFocus, onAsk, onClose }) {
  const { chartData, setCurrentPage } = useApp();
  const summary = useChartSummary();
  const { t } = useT();
  const c = t.chartPanel;
  const [style, setStyle] = useState('north');
  const Chart = style === 'north' ? NorthIndianChart : SouthIndianChart;

  if (!chartData) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="font-display text-lg">{c.willAppear}</p>
        <button type="button" className="btn-primary mt-4" onClick={() => setCurrentPage('onboarding')}>
          {t.common.addBirthDetails}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-5 pb-2 pt-5">
        <h2 className="text-lg">{c.title}</h2>
        <div className="flex items-center gap-1">
          <Segmented
            size="sm"
            label={c.style}
            value={style}
            onChange={setStyle}
            options={[{ value: 'north', label: c.north }, { value: 'south', label: c.south }]}
          />
          {onClose && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label={c.closeChart}>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-6">
        <Chart
          chartData={chartData}
          showHeader={false}
          focusHouse={focus.house}
          focusPlanet={focus.planet}
          onSelectHouse={(h) => h && onFocus({ house: h.number, planet: null })}
          onSelectPlanet={(p) => onFocus({ house: null, planet: p.name })}
        />
        <FocusCard focus={focus} summary={summary} onAsk={onAsk} onClear={() => onFocus({ house: null, planet: null })} />
        <button type="button" className="btn-quiet w-full" onClick={() => setCurrentPage('kundli')}>
          {c.openKundli}
        </button>
      </div>
    </div>
  );
}
