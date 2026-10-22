import React, { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';

// House polygons of a 360×360 North Indian chart.
const HOUSES = {
  1: '180,0 270,90 180,180 90,90',
  4: '0,180 90,90 180,180 90,270',
  7: '180,180 270,270 180,360 90,270',
  10: '360,180 270,90 180,180 270,270',
  2: '0,0 180,0 90,90',
  5: '0,180 0,360 90,270',
  11: '360,0 360,180 270,90',
};


// Example chart that highlights the house each sample answer talks about.
// `t` is the home page's chart text in the visitor's language (content/ui.js).
export default function ChartAnswerDemo({ t }) {
  const EXAMPLES = t.examples;
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI((n) => (n + 1) % EXAMPLES.length), 5200);
    return () => clearInterval(timer);
  }, [EXAMPLES.length]);
  const ex = EXAMPLES[i % EXAMPLES.length];

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
      <figure className="relative mx-auto w-full max-w-[320px]">
        <svg viewBox="0 0 360 360" className="block h-auto w-full" role="img" aria-label={t.aria.replace('{n}', ex.house)}>
          <rect x="1" y="1" width="358" height="358" rx="16" className="fill-panel stroke-line" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="360" y2="360" className="stroke-ink/25" />
          <line x1="360" y1="0" x2="0" y2="360" className="stroke-ink/25" />
          <polygon points="180,0 360,180 180,360 0,180" className="fill-none stroke-ink/35" strokeWidth="1.2" />
          <AnimatePresence>
            <m.polygon
              key={ex.house}
              points={HOUSES[ex.house]}
              className="fill-accent/20 stroke-accent"
              strokeWidth="2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
          {[[180, 95, 'Su'], [180, 275, 'Ve'], [275, 185, 'Sa'], [90, 50, 'Me'], [320, 100, 'Ju'], [90, 185, 'Mo']].map(([x, y, t]) => (
            <text key={t} x={x} y={y} textAnchor="middle" className="fill-ink text-[14px] font-semibold">{t}</text>
          ))}
        </svg>
        <figcaption className="mt-2 text-center text-xs text-muted">{t.caption}</figcaption>
      </figure>

      <div>
        <div className="mb-5 flex gap-2" role="tablist" aria-label={t.tabs}>
          {EXAMPLES.map((e, k) => (
            <button
              key={e.house}
              type="button"
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className="group flex h-8 items-center"
              aria-label={t.tab.replace('{n}', k + 1)}
            >
              {/* A thin bar to look at, inside a finger-sized button. */}
              <span className={`block h-1.5 rounded-full transition-all ${k === i ? 'w-10 bg-accent' : 'w-5 bg-line group-hover:bg-muted'}`} />
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <m.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <p className="ml-auto w-fit max-w-full rounded-2xl bg-accent-soft px-4 py-2.5 text-[15px]">{ex.q}</p>
            <p className="mt-4 text-lg leading-relaxed">
              {ex.a.split(ex.mark).flatMap((part, k) => (k ? [ex.mark, part] : [part])).map((part, k) =>
                k % 2 === 1 ? (
                  <span key={k} className="mx-0.5 rounded-md bg-accent px-1.5 py-px font-semibold text-accent-ink">{part}</span>
                ) : (
                  <React.Fragment key={k}>{part}</React.Fragment>
                )
              )}
            </p>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
