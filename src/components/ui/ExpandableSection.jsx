import React, { useState } from 'react';
import './ExpandableSection.css';

export default function ExpandableSection({
  title,
  subtitle,
  icon = 'tune',
  defaultExpanded = false,
  badge,
  children,
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div className={`expandable-section card ${isOpen ? 'is-open' : ''}`}>
      <button
        className="expandable-section-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="expandable-section-title-wrap">
          {icon && (
            <span className="material-symbols-outlined expandable-icon">{icon}</span>
          )}
          <div>
            <h4 className="title-sm text-on-surface">{title}</h4>
            {subtitle && <p className="body-md text-muted" style={{ fontSize: 12 }}>{subtitle}</p>}
          </div>
        </div>

        <div className="expandable-section-right">
          {badge && <span className="chip chip-surface">{badge}</span>}
          <span className="material-symbols-outlined expandable-chevron">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="expandable-section-content fade-in-fast">
          {children}
        </div>
      )}
    </div>
  );
}
