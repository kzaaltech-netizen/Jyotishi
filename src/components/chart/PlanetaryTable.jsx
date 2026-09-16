import React from 'react';
import './PlanetaryTable.css';

export default function PlanetaryTable({ planetaryData }) {
  if (!planetaryData || !Array.isArray(planetaryData) || planetaryData.length === 0) {
    return (
      <div className="ephemeris-placeholder">
        <span className="font-body-sm text-outline">Planetary ephemeris details unavailable.</span>
      </div>
    );
  }

  return (
    <div className="ephemeris-table-wrapper">
      <div className="ephemeris-header">
        <div className="ephemeris-title font-title-md">ग्रह गोचर एवं स्थिति · Planetary Ephemeris</div>
        <span className="ephemeris-sub font-label-sm">Lahiri Sidereal Longitudes</span>
      </div>

      <div className="ephemeris-table-container">
        <table className="ephemeris-table">
          <thead>
            <tr>
              <th>Planet (ग्रह)</th>
              <th>Longitude (अंश)</th>
              <th>Rashi (राशि)</th>
              <th>Nakshatra (नक्षत्र)</th>
              <th>House (भाव)</th>
              <th>Status (स्थिति)</th>
            </tr>
          </thead>
          <tbody>
            {planetaryData.map((p) => {
              const isExalted = p.dignity === 'Exalted';
              const isDebilitated = p.dignity === 'Debilitated';
              const isOwn = p.dignity === 'Own';

              return (
                <tr key={p.name}>
                  <td className="planet-name-cell">
                    <span className="planet-sanskrit">{p.sanskrit || p.name}</span>
                    <span className="planet-english">({p.name})</span>
                  </td>
                  <td className="tabular-num">
                    {p.deg != null ? `${p.deg}° ${p.min != null ? `${p.min}'` : ''}` : p.fullDegree ? `${Math.floor(p.fullDegree % 30)}°` : '—'}
                  </td>
                  <td>{p.sign || '—'}</td>
                  <td>
                    {p.nakshatra || '—'} {p.pada ? `(Pada ${p.pada})` : ''}
                  </td>
                  <td className="tabular-num">{p.house ? `House ${p.house}` : '—'}</td>
                  <td>
                    <span
                      className={`dignity-badge ${
                        isExalted ? 'dignity-exalted' : isDebilitated ? 'dignity-debilitated' : isOwn ? 'dignity-own' : 'dignity-neutral'
                      }`}
                    >
                      {p.dignity || 'Direct'} {p.isRetrograde ? '℞' : ''}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
