import React, { useState } from 'react';
import './InsightCard.css';

export default function InsightCard({
  icon,
  title,
  rating = 4,
  subtitle,
  summary,
  focusText,
  color = 'gold', // gold | teal | violet | emerald
  onViewFull,
  defaultExpanded = false,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const stars = Array.from({ length: 5 }, (_, i) => i < rating);

  return (
    <div className={`insight-card-row card ${expanded ? 'is-expanded' : ''} insight-theme-${color}`}>
      {/* Collapsed Header - accessible tap target */}
      <button
        className="insight-card-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="insight-card-icon-wrap">
          <span className="material-symbols-outlined icon-filled">{icon}</span>
        </div>

        <div className="insight-card-title-wrap">
          <span className="title-sm text-on-surface">{title}</span>
          {subtitle && <span className="label-sm text-muted">{subtitle}</span>}
        </div>

        <div className="insight-card-meta">
          <div className="insight-stars" title={`${rating} out of 5 stars`}>
            {stars.map((filled, idx) => (
              <span
                key={idx}
                className={`material-symbols-outlined star-icon ${filled ? 'star-filled' : 'star-empty'}`}
              >
                star
              </span>
            ))}
          </div>
          <span className="material-symbols-outlined expand-chevron">
            {expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_right'}
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="insight-card-body fade-in-fast">
          <p className="body-md text-on-surface insight-summary-text">{summary}</p>
          
          {focusText && (
            <div className="insight-focus-badge">
              <span className="label-sm text-muted">Focus:</span>
              <span className="body-md focus-highlight">{focusText}</span>
            </div>
          )}

          {onViewFull && (
            <div className="insight-card-actions">
              <button
                className="btn-link-action label-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewFull();
                }}
              >
                <span>View Full Insight</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
