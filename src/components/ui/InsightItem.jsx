import React from 'react';
import './InsightItem.css';

export default function InsightItem({ label, tag, title, desc, color = 'gold' }) {
  const colorMap = { gold: 'text-primary', teal: 'text-tertiary', violet: 'text-secondary' };
  return (
    <div className={`insight-item insight-bg-${color}`}>
      <div className="insight-top">
        <span className={`label-sm ${colorMap[color]}`}>{label}</span>
        <span className="label-sm text-muted">{tag}</span>
      </div>
      <div className="title-sm text-on-surface insight-title">{title}</div>
      <p className="body-md text-muted insight-body">{desc}</p>
    </div>
  );
}
