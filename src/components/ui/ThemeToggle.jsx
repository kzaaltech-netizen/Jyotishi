import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './ThemeToggle.css';

export default function ThemeToggle({ compact = false, className = '' }) {
  const { theme, setTheme } = useApp();
  const isCosmic = theme === 'cosmic';

  return (
    <div
      className={`theme-toggle-switch ${compact ? 'theme-toggle-compact' : ''} ${className}`}
      role="group"
      aria-label="Theme: Vedic Manuscript or Cosmic Night Sky"
    >
      <button
        type="button"
        className={`theme-btn ${!isCosmic ? 'theme-btn-active' : ''}`}
        onClick={() => setTheme('vedic')}
        aria-pressed={!isCosmic}
        title="Vedic Manuscript (Warm Ivory Theme)"
      >
        <span className="theme-btn-icon">☀</span>
        {!compact && <span className="theme-btn-label">Vedic</span>}
      </button>

      <button
        type="button"
        className={`theme-btn ${isCosmic ? 'theme-btn-active' : ''}`}
        onClick={() => setTheme('cosmic')}
        aria-pressed={isCosmic}
        title="Cosmic Night Sky (Deep Celestial Theme)"
      >
        <span className="theme-btn-icon">✦</span>
        {!compact && <span className="theme-btn-label">Cosmic</span>}
      </button>
    </div>
  );
}
