import React from 'react';
import './DashaTimeline.css';

export default function DashaTimeline({ dashaData }) {
  if (!dashaData) {
    return (
      <div className="dasha-placeholder">
        <span className="font-body-sm text-outline">Dasha period calculation loading...</span>
      </div>
    );
  }

  const { currentMahadasha, currentAntardasha, mahadashaList } = dashaData;

  return (
    <div className="dasha-card">
      <div className="dasha-card-header">
        <div className="dasha-header-title font-title-md">Vimshottari Dasha Timeline · विंशोत्तरी दशा</div>
        <span className="dasha-active-badge">
          {currentMahadasha?.planet || 'Active'} - {currentAntardasha?.planet || ''}
        </span>
      </div>

      {/* Current Active Highlight Box */}
      <div className="dasha-current-box">
        <div className="dasha-current-col">
          <span className="dasha-label">Mahadasha</span>
          <span className="dasha-val-primary">{currentMahadasha?.planet || 'Saturn'}</span>
          <span className="dasha-sub-dates">{currentMahadasha?.startDate} - {currentMahadasha?.endDate}</span>
        </div>
        <div className="dasha-divider-v"></div>
        <div className="dasha-current-col">
          <span className="dasha-label">Antardasha</span>
          <span className="dasha-val-secondary">{currentAntardasha?.planet || 'Jupiter'}</span>
          <span className="dasha-sub-dates">{currentAntardasha?.startDate} - {currentAntardasha?.endDate}</span>
        </div>
      </div>

      {/* Sequence Timeline Bars */}
      <div className="dasha-timeline-list">
        <span className="dasha-section-label">Mahadasha Sequence (120 Year Cycle)</span>
        <div className="dasha-bars-wrapper">
          {(mahadashaList || []).slice(0, 7).map((m, idx) => {
            const isActive = m.planet === currentMahadasha?.planet;
            return (
              <div key={m.planet + idx} className={`dasha-bar-item ${isActive ? 'dasha-bar-active' : ''}`}>
                <div className="dasha-bar-header">
                  <span className="dasha-bar-planet">{m.planet}</span>
                  <span className="dasha-bar-years">{m.durationYears || m.years} yrs</span>
                </div>
                <div className="dasha-progress-track">
                  <div
                    className="dasha-progress-fill"
                    style={{ width: `${isActive ? 65 : m.completed ? 100 : 0}%` }}
                  ></div>
                </div>
                <span className="dasha-bar-dates">{m.startDate || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
