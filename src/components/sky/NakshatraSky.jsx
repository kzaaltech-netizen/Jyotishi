import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NAKSHATRA_CONSTELLATIONS } from '../../lib/nakshatra/nakshatraData.js';
import { getNakshatraData, usePrefersReducedMotion } from '../../lib/nakshatra/nakshatraUtils.js';

// Resolve any nakshatra spelling ("Purva Phalguni", "rohini (taurus)") to a data key.
export function resolveNakshatraKey(name) {
  if (!name) return null;
  const def = getNakshatraData(name);
  return Object.keys(NAKSHATRA_CONSTELLATIONS).find((k) => NAKSHATRA_CONSTELLATIONS[k] === def) || null;
}

const SkyContext = createContext({ setMood: () => {}, setOverride: () => {}, setDim: () => {} });

export function SkyProvider({ children }) {
  const [mood, setMood] = useState('idle');
  const [override, setOverride] = useState(null);
  // Dim the sky behind text-heavy pages so lines never cross what people read.
  const [dim, setDim] = useState(false);
  const value = useMemo(() => ({ mood, setMood, override, setOverride, dim, setDim }), [mood, override, dim]);
  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>;
}

export function useSky() {
  return useContext(SkyContext);
}

// Full-screen WebGL star atlas. Sits behind every page.
export default function NakshatraSky({ nakshatra, theme }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const { mood, override, dim } = useSky();
  const reduced = usePrefersReducedMotion();
  const key = resolveNakshatraKey(override || nakshatra);
  const [failed, setFailed] = useState(false);

  // Latest props, read once the lazily loaded engine is ready.
  const latest = useRef({ theme, key, reduced, mood });
  latest.current = { theme, key, reduced, mood };

  useEffect(() => {
    let disposed = false;
    // The sky is decoration: skip it when the visitor asked to save data or is on a
    // slow connection, and otherwise load Three.js (its own chunk) only once the page
    // has finished loading and the browser is idle, so it never delays the content.
    const conn = navigator.connection;
    if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || '')) {
      setFailed(true);
      return undefined;
    }
    const start = () => {
      if (disposed) return;
      import('./skyEngine.js')
        .then(({ createSkyEngine }) => {
          if (disposed || !canvasRef.current) return;
          const l = latest.current;
          engineRef.current = createSkyEngine(canvasRef.current, { theme: l.theme, nakshatra: l.key, reducedMotion: l.reduced });
          engineRef.current.setMood(l.mood);
        })
        .catch((err) => {
          // WebGL unavailable: the plain background still works.
          console.warn('[NakshatraSky] sky unavailable', err);
          setFailed(true);
        });
    };
    const whenIdle = () => (window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1200));
    if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener('load', whenIdle);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => engineRef.current?.setTheme(theme), [theme]);
  useEffect(() => engineRef.current?.setNakshatra(key), [key]);
  useEffect(() => engineRef.current?.setMood(mood), [mood]);
  useEffect(() => engineRef.current?.setReducedMotion(reduced), [reduced]);

  if (failed) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-700 ${dim ? 'opacity-40' : 'opacity-100'}`}
    />
  );
}
