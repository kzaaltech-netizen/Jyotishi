import React from 'react';

// Plain bordered card. Pass onClick to make the whole card one button.
export default function Spotlight({ children, onClick, className = '', label, innerClassName = 'p-5' }) {
  const base = `block h-full w-full rounded-xl border border-line bg-panel text-left ${innerClassName} ${className}`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={`${base} transition-colors hover:border-ink/30`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}
