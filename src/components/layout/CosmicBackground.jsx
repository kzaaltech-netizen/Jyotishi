import React, { useEffect, useRef, useMemo } from 'react';
import { getZodiacMotionProfile } from '../../features/celestial/zodiacMotionProfiles.js';
import './CosmicBackground.css';

/**
 * CosmicBackground
 *
 * Full-Viewport Living Celestial Starfield & Nebula System
 * Renders across the entire website behind all pages, cards, and sidebars.
 * Provides rich multi-depth starry sky with twinkling canvas stars, 4-point cross flares,
 * floating sparkling star glints (✦, ✧), shooting star trails, and organic nebulae.
 *
 * Props:
 *   lagnaSign  {string} - User's ascendant sign for subtle ambient aura tinting
 *   intensity  {string} - "normal" | "dense"
 *   theme      {string} - "cosmic" | "vedic"
 */
export default function CosmicBackground({
  lagnaSign = 'Leo',
  intensity = 'normal',
  theme = 'cosmic',
}) {
  const canvasRef = useRef(null);

  const motionProfile = useMemo(
    () => getZodiacMotionProfile(lagnaSign, theme === 'vedic' ? 'vedic' : 'cosmic'),
    [lagnaSign, theme]
  );

  const isVedic = theme === 'vedic';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 130 : (intensity === 'dense' ? 340 : 240);

    // Multi-depth starry sky: tiny distant stars, mid-depth stars, and prominent diffraction star sparks
    const stars = Array.from({ length: starCount }, (_, idx) => {
      const isSpark = idx % 16 === 0; // Prominent diffraction star spark with cross flare
      const isBright = idx % 5 === 0;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: isSpark ? Math.random() * 1.5 + 1.2 : (isBright ? Math.random() * 1.0 + 0.7 : Math.random() * 0.6 + 0.3),
        baseAlpha: isSpark ? 0.88 : (isBright ? 0.65 : Math.random() * 0.42 + 0.18),
        speed: Math.random() * 0.0028 + 0.0008,
        phase: Math.random() * Math.PI * 2,
        isSpark,
        // Color hierarchy based on active celestial theme
        colorType: isVedic
          ? (idx % 2 === 0 ? 'vedicGold' : (idx % 3 === 0 ? 'vedicAmber' : 'vedicChampagne'))
          : (isSpark
              ? (idx % 2 === 0 ? 'gold' : 'cyan')
              : (idx % 8 === 0 ? 'cyan' : (idx % 12 === 0 ? 'gold' : (idx % 18 === 0 ? 'lavender' : 'white')))),
      };
    });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += prefersReducedMotion ? 0 : 0.006;

      // Draw rich Milky Way diagonal diffuse band
      const mwGrad = ctx.createLinearGradient(canvas.width * 0.85, 0, canvas.width * 0.15, canvas.height);
      if (isVedic) {
        mwGrad.addColorStop(0, 'rgba(212, 175, 55, 0.045)');
        mwGrad.addColorStop(0.35, 'rgba(180, 130, 40, 0.035)');
        mwGrad.addColorStop(0.65, 'rgba(194, 146, 26, 0.03)');
        mwGrad.addColorStop(1, 'transparent');
      } else {
        mwGrad.addColorStop(0, 'rgba(139, 92, 246, 0.055)');
        mwGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.045)');
        mwGrad.addColorStop(0.65, 'rgba(6, 182, 212, 0.04)');
        mwGrad.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = mwGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw multi-depth twinkling starry field
      stars.forEach((s) => {
        const twinkle = prefersReducedMotion
          ? s.baseAlpha
          : s.baseAlpha * (0.42 + 0.58 * Math.sin(s.phase + t * s.speed * 12));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

        if (isVedic) {
          if (s.colorType === 'vedicGold') {
            ctx.fillStyle = `rgba(212, 175, 55, ${Math.min(1, twinkle * 1.15)})`;
          } else if (s.colorType === 'vedicAmber') {
            ctx.fillStyle = `rgba(184, 134, 11, ${Math.min(1, twinkle * 1.1)})`;
          } else {
            ctx.fillStyle = `rgba(245, 158, 11, ${twinkle})`;
          }
        } else {
          if (s.colorType === 'gold') {
            ctx.fillStyle = `rgba(251, 191, 36, ${Math.min(1, twinkle * 1.15)})`;
          } else if (s.colorType === 'cyan') {
            ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(1, twinkle * 1.1)})`;
          } else if (s.colorType === 'lavender') {
            ctx.fillStyle = `rgba(192, 132, 252, ${Math.min(1, twinkle * 1.05)})`;
          } else {
            ctx.fillStyle = `rgba(241, 245, 249, ${twinkle})`;
          }
        }
        ctx.fill();

        // 4-point cross diffraction flare on prominent star sparks
        if (s.isSpark && !prefersReducedMotion && twinkle > 0.38) {
          ctx.save();
          if (isVedic) {
            ctx.strokeStyle = `rgba(212, 175, 55, ${twinkle * 0.55})`;
          } else {
            ctx.strokeStyle = s.colorType === 'cyan'
              ? `rgba(56, 189, 248, ${twinkle * 0.55})`
              : `rgba(251, 191, 36, ${twinkle * 0.55})`;
          }
          ctx.lineWidth = 0.7;
          const flareLen = s.r * 4.6;
          ctx.beginPath();
          ctx.moveTo(s.x - flareLen, s.y);
          ctx.lineTo(s.x + flareLen, s.y);
          ctx.moveTo(s.x, s.y - flareLen);
          ctx.lineTo(s.x, s.y + flareLen);
          ctx.stroke();
          ctx.restore();
        }
      });

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(draw);
      }
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [intensity, isVedic]);

  // Floating sparkling stars (✦, ✧) strategically framing the viewport
  const sparkleStars = useMemo(() => {
    return [
      { top: '4%',  left: '4%',  glyph: '✦', color: isVedic ? 'rgba(184, 134, 11, 0.82)' : 'rgba(254, 240, 138, 0.80)', size: '14px', twinkle: 'twinkle-1' },
      { top: '6%',  right: '6%', glyph: '✧', color: isVedic ? 'rgba(212, 175, 55, 0.80)' : 'rgba(186, 230, 253, 0.75)', size: '15px', twinkle: 'twinkle-2' },
      { top: '12%', left: '23%', glyph: '✧', color: isVedic ? 'rgba(194, 146, 26, 0.72)' : 'rgba(251, 191, 36, 0.70)',  size: '12px', twinkle: 'twinkle-3' },
      { top: '16%', right: '22%', glyph: '✦', color: isVedic ? 'rgba(212, 175, 55, 0.85)' : 'rgba(192, 132, 252, 0.75)', size: '14px', twinkle: 'twinkle-4' },
      { top: '30%', left: '2%',  glyph: '✦', color: isVedic ? 'rgba(176, 125, 30, 0.78)' : 'rgba(56, 189, 248, 0.78)',  size: '15px', twinkle: 'twinkle-2' },
      { top: '35%', right: '2.5%', glyph: '✧', color: isVedic ? 'rgba(212, 175, 55, 0.78)' : 'rgba(254, 240, 138, 0.72)', size: '13px', twinkle: 'twinkle-1' },
      { top: '52%', left: '4%',  glyph: '✧', color: isVedic ? 'rgba(184, 134, 11, 0.75)' : 'rgba(186, 230, 253, 0.70)', size: '13px', twinkle: 'twinkle-3' },
      { top: '58%', right: '4%', glyph: '✦', color: isVedic ? 'rgba(194, 146, 26, 0.82)' : 'rgba(251, 191, 36, 0.78)',  size: '15px', twinkle: 'twinkle-4' },
      { top: '72%', left: '3%',  glyph: '✦', color: isVedic ? 'rgba(212, 175, 55, 0.78)' : 'rgba(192, 132, 252, 0.70)', size: '13px', twinkle: 'twinkle-1' },
      { top: '78%', right: '3.5%', glyph: '✧', color: isVedic ? 'rgba(176, 125, 30, 0.75)' : 'rgba(56, 189, 248, 0.72)',  size: '14px', twinkle: 'twinkle-2' },
      { top: '88%', left: '16%', glyph: '✧', color: isVedic ? 'rgba(212, 175, 55, 0.78)' : 'rgba(254, 240, 138, 0.70)', size: '13px', twinkle: 'twinkle-3' },
      { top: '91%', right: '14%', glyph: '✦', color: isVedic ? 'rgba(184, 134, 11, 0.80)' : 'rgba(251, 191, 36, 0.75)', size: '14px', twinkle: 'twinkle-4' },
    ];
  }, [isVedic]);

  return (
    <div
      className={`cosmic-bg ${isVedic ? 'theme-vedic' : 'theme-cosmic'}`}
      aria-hidden="true"
      style={{
        '--lagna-ambient-glow': motionProfile?.glowTint || 'rgba(99, 102, 241, 0.14)',
        '--lagna-ambient-accent': motionProfile?.accentTint || '#818cf8',
      }}
    >
      {/* 1. Canvas Starfield & Milky Way Glow */}
      <canvas ref={canvasRef} className="star-canvas" />

      {/* 2. Floating Sparkling Stars (✦, ✧) */}
      <div className="cosmic-sparkle-field">
        {sparkleStars.map((sp, idx) => (
          <div
            key={`cosmic-sparkle-${idx}`}
            className={`cosmic-glint ${sp.twinkle}`}
            style={{
              top: sp.top,
              left: sp.left || 'auto',
              right: sp.right || 'auto',
              color: sp.color,
              fontSize: sp.size,
            }}
          >
            {sp.glyph}
          </div>
        ))}
      </div>

      {/* 3. Periodic Shooting Star Celestial Trails */}
      <div className="cosmic-shooting-trail cosmic-shooting-1" />
      <div className="cosmic-shooting-trail cosmic-shooting-2" />

      {/* 4. Layered Multi-Hue Organic Nebulae */}
      <div className="nebula-layer nebula-teal-stream" />
      <div className="nebula-layer nebula-deep-indigo" />
      <div className="nebula-layer nebula-violet-core" />
      <div className="nebula-layer nebula-warm-gold" />
      <div className="nebula-layer nebula-lagna-resonance" />

      {/* 5. Ethereal Distant Planetary Bodies (Cosmic Mode only) */}
      {!isVedic && (
        <>
          <div className="celestial-body planet-atmospheric-large">
            <div className="planet-atmosphere-glow" />
            <div className="planet-surface-body" />
          </div>
          <div className="celestial-body planet-rocky-mid" />
          <div className="celestial-body planet-crescent-moon" />
          <div className="celestial-body planet-distant-cyan" />
        </>
      )}

      {/* 6. Subtle Atmospheric Horizon Silhouette on Bottom Edge */}
      <div className="cosmic-horizon-silhouette" />

      {/* 7. Fine cosmic stardust grain */}
      <div className="cosmic-grain-overlay" />
    </div>
  );
}
