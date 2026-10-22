import React from 'react';
import useT from '../../hooks/useT.js';

export default function PlanetaryTable({ planetaryData, onSelectPlanet }) {
  const { t, planet, sign, nak, dignity } = useT();
  const c = t.chart.table;
  if (!Array.isArray(planetaryData) || planetaryData.length === 0) {
    return <p className="text-sm text-muted">{c.empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">{c.caption}</caption>
        <thead className="bg-panel-2/70 text-xs text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">{c.planet}</th>
            <th scope="col" className="px-4 py-3 font-semibold">{c.degree}</th>
            <th scope="col" className="px-4 py-3 font-semibold">{c.sign}</th>
            <th scope="col" className="px-4 py-3 font-semibold">{c.nakshatra}</th>
            <th scope="col" className="px-4 py-3 font-semibold">{c.house}</th>
            <th scope="col" className="px-4 py-3 font-semibold">{c.status}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-panel/80">
          {planetaryData.map((p) => (
            <tr key={p.name} className={onSelectPlanet ? 'cursor-pointer hover:bg-panel-2/60' : ''} onClick={() => onSelectPlanet?.(p)}>
              <th scope="row" className="px-4 py-3 font-semibold">
                {onSelectPlanet ? (
                  <button type="button" className="text-left hover:text-accent" onClick={() => onSelectPlanet(p)}>
                    {planet(p.name)}
                  </button>
                ) : (
                  planet(p.name)
                )}
                {p.sanskrit && <span className="deva ml-1.5 font-normal text-muted">{p.sanskrit}</span>}
              </th>
              <td className="px-4 py-3 num">
                {p.deg != null ? `${p.deg}°${p.min != null ? ` ${p.min}'` : ''}` : p.fullDegree ? `${Math.floor(p.fullDegree % 30)}°` : '—'}
              </td>
              <td className="px-4 py-3">{p.sign ? sign(p.sign) : '—'}</td>
              <td className="px-4 py-3">{p.nakshatra ? nak(p.nakshatra) : '—'}{p.pada ? ` · ${p.pada}` : ''}</td>
              <td className="px-4 py-3 num">{p.house || '—'}</td>
              <td className="px-4 py-3">
                <span className={`pill ${p.dignity === 'Exalted' ? 'bg-gold-soft text-gold' : p.dignity === 'Debilitated' ? 'text-danger' : ''}`}>
                  {dignity(p.dignity || 'Normal')}{p.isRetrograde ? ' ℞' : ''}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
