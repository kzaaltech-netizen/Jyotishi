import React from 'react';
import './RecentActivity.css';

export default function RecentActivity({ savedReports = [], onSelectReport }) {
  if (!savedReports || savedReports.length === 0) {
    return (
      <div className="recent-activity-card card">
        <div className="activity-header">
          <span className="material-symbols-outlined text-muted" style={{ fontSize: 18 }}>history</span>
          <h3 className="title-sm text-on-surface">Recent Activity</h3>
        </div>
        <p className="body-md text-muted italic" style={{ fontSize: 13, padding: '8px 0' }}>
          No recent readings yet. Ask your chart to generate your first cosmic insight!
        </p>
      </div>
    );
  }

  const MODE_ICONS = {
    general: { icon: 'auto_awesome', label: 'General Reading', color: 'gold' },
    career: { icon: 'work', label: 'Career Insight', color: 'teal' },
    wealth: { icon: 'payments', label: 'Wealth Analysis', color: 'gold' },
    abundance: { icon: 'eco', label: 'Abundance Forecast', color: 'violet' },
    union: { icon: 'favorite', label: 'Union & Relationship', color: 'violet' },
  };

  return (
    <div className="recent-activity-card card">
      <div className="activity-header">
        <span className="material-symbols-outlined text-muted" style={{ fontSize: 18 }}>history</span>
        <h3 className="title-sm text-on-surface">Recent Activity</h3>
      </div>

      <div className="activity-list">
        {savedReports.slice(0, 3).map((report, idx) => {
          const meta = MODE_ICONS[report.mode] || MODE_ICONS.general;
          const snippet = report.content ? report.content.substring(0, 75) + '...' : 'Generated reading';
          
          return (
            <button
              key={idx}
              className="activity-item"
              onClick={() => onSelectReport && onSelectReport(report)}
            >
              <div className={`activity-icon-wrap activity-theme-${meta.color}`}>
                <span className="material-symbols-outlined">{meta.icon}</span>
              </div>
              <div className="activity-text">
                <span className="title-sm text-on-surface">{meta.label}</span>
                <span className="body-md text-muted activity-snippet">{snippet}</span>
              </div>
              <span className="material-symbols-outlined text-muted activity-chevron">chevron_right</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
