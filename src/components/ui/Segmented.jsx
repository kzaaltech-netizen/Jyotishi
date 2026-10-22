import React, { useId } from 'react';
import { m } from 'motion/react';

// Tab-like switcher with a sliding indicator.
export default function Segmented({ options, value, onChange, label, size = 'md', className = '' }) {
  const id = useId();
  const h = size === 'sm' ? 'min-h-[32px] text-xs px-2.5' : 'min-h-[38px] text-sm px-3.5';
  return (
    <div role="tablist" aria-label={label} className={`inline-flex rounded-xl bg-panel-2/80 p-1 ${className}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors ${h} ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}
          >
            {active && (
              <m.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-lg bg-panel shadow-soft"
                transition={{ type: 'spring', stiffness: 450, damping: 36 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
