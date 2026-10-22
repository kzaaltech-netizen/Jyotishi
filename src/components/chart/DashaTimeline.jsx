import React from 'react';
import useT from '../../hooks/useT.js';

// Share of the period already elapsed, from real dates when available.
function progress(period) {
  const start = new Date(period?.startDate).getTime();
  const end = new Date(period?.endDate).getTime();
  if (!start || !end || end <= start) return null;
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
}

export default function DashaTimeline({ dashaData, compact = false }) {
  const { t, f: fill, planet, date } = useT();
  const c = t.chart.dasha;
  const fmt = (d) => (d ? date(d, { month: 'short', year: 'numeric' }) : '—');
  if (!dashaData) return <p className="text-sm text-muted">{c.calculating}</p>;

  const { currentMahadasha: maha, currentAntardasha: antar, mahadashaList = [] } = dashaData;
  const mahaPlanet = maha?.planet || maha?.lord;
  const antarPlanet = antar?.planet || antar?.lord;
  const mahaProgress = progress(maha);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-accent-soft/70 p-4">
          <p className="text-xs text-muted">{c.maha}</p>
          <p className="mt-0.5 font-display text-xl">{mahaPlanet ? planet(mahaPlanet) : '—'}</p>
          <p className="text-xs text-muted num">{fmt(maha?.startDate)} – {fmt(maha?.endDate)}</p>
          {mahaProgress != null && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel" aria-label={fill(c.elapsed, { n: Math.round(mahaProgress * 100) })}>
              <div className="h-full rounded-full bg-accent" style={{ width: `${mahaProgress * 100}%` }} />
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-panel-2/70 p-4">
          <p className="text-xs text-muted">{c.antar}</p>
          <p className="mt-0.5 font-display text-xl">{antarPlanet ? planet(antarPlanet) : '—'}</p>
          <p className="text-xs text-muted num">{fmt(antar?.startDate)} – {fmt(antar?.endDate)}</p>
        </div>
      </div>

      {!compact && mahadashaList.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">{c.sequence}</p>
          <ol className="space-y-1.5">
            {mahadashaList.slice(0, 9).map((m, i) => {
              const active = (m.planet || m.lord) === mahaPlanet;
              const years = m.durationYears || m.years;
              return (
                <li
                  key={`${m.planet}-${i}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? 'bg-accent-soft/70' : ''}`}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${active ? 'bg-accent' : 'bg-line'}`} />
                  <span className={`w-20 font-semibold ${active ? 'text-accent' : ''}`}>{planet(m.planet || m.lord)}</span>
                  <span className="text-muted num">{fmt(m.startDate)}</span>
                  {years && <span className="ml-auto text-muted num">{fill(t.common.years, { n: years })}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
