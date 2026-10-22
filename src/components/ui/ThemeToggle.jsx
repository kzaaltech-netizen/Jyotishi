import React from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Moon, Sun } from '../icons/index.jsx';
import { useApp } from '../../context/AppContext.jsx';
import useT from '../../hooks/useT.js';

export default function ThemeToggle({ withLabel = false, className = '' }) {
  const { theme, toggleTheme } = useApp();
  const { t } = useT();
  const night = theme === 'cosmic';
  const label = night ? t.nav.toVedic : t.nav.toCosmic;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={withLabel ? `btn-quiet w-full justify-start ${className}` : `icon-btn ${className}`}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={night ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {night ? <Moon className="h-5 w-5" aria-hidden="true" /> : <Sun className="h-5 w-5" aria-hidden="true" />}
          </m.span>
        </AnimatePresence>
      </span>
      {withLabel && <span>{night ? t.nav.cosmic : t.nav.vedic}</span>}
    </button>
  );
}
