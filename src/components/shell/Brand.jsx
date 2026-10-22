import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

// Brand files in public/brand, one set per theme (from the design files).
const ART = {
  vedic: {
    mark: '/brand/mark-light.webp',
    lockup: { src: '/brand/logo-lockup.webp', ratio: 960 / 312 },
  },
  cosmic: {
    mark: '/brand/mark-dark.webp',
    // The dark artwork has more space around it, so it is drawn a little larger.
    lockup: { src: '/brand/logo-lockup-dark.webp', ratio: 960 / 380, scale: 1.2 },
  },
};

function useArt() {
  const { theme } = useApp();
  return ART[theme === 'cosmic' ? 'cosmic' : 'vedic'];
}

export function BrandMark({ size = 32 }) {
  const art = useArt();
  return <img src={art.mark} width={size} height={size} alt="" aria-hidden="true" className="shrink-0" decoding="async" />;
}

// Full logo with wordmark and tagline, sized by height so both themes line up.
export function BrandLockup({ height = 48 }) {
  const { src, ratio, scale = 1 } = useArt().lockup;
  const h = Math.round(height * scale);
  return <img src={src} height={h} width={Math.round(h * ratio)} alt="Jyotishly — Your Kundli, one message away." decoding="async" />;
}

export default function Brand({ onClick, compact = false }) {
  const content = compact ? <BrandMark size={36} /> : <BrandLockup height={46} />;
  if (!onClick) return <span className="inline-flex items-center">{content}</span>;
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-[44px] items-center rounded-xl" aria-label="Jyotishly home">
      {content}
    </button>
  );
}
