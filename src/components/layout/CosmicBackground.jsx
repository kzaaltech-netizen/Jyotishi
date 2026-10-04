import React, { useEffect, useRef, useMemo } from 'react';
import { getZodiacMotionProfile } from '../../features/celestial/zodiacMotionProfiles.js';
import './CosmicBackground.css';

export default function CosmicBackground({ lagnaSign = 'Leo', intensity = 'normal' }) {
  const canvasRef = useRef(null);

  const motionProfile = useMemo(
    () => getZodiacMotionProfile(lagnaSign, 'cosmic'),
    [lagnaSign]
  );

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
    const starCount = isMobile ? 90 : (intensity === 'dense' ? 240 : 160);

    // Multi-depth starry sky: tiny distant stars, mid stars, and rare luminous star sparks
    const stars = Array.from({ length: starCount }, (_, idx) => {
      const isSpark = idx % 22 === 0; // Prominent diffraction star spark
      const isBright = idx % 6 === 0;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: isSpark ? Math.random() * 1.5 + 1.2 : (isBright ? Math.random() * 1.0 + 0.7 : Math.random() * 0.6 + 0.3),
        baseAlpha: isSpark ? 0.85 : (isBright ? 0.6 : Math.random() * 0.4 + 0.15),
        speed: Math.random() * 0.0025 + 0.0006,
        phase: Math.random() * Math.PI * 2,
        isSpark,
        // Color hierarchy matching reference: ivory, champagne gold, electric cyan, soft lavender
        colorType: isSpark
          ? (idx % 2 === 0 ? 'gold' : 'cyan')
          : (idx % 9 === 0 ? 'cyan' : (idx % 14 === 0 ? 'gold' : (idx % 21 === 0 ? 'lavender' : 'white'))),
      };
    });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += prefersReducedMotion ? 0 : 0.005;

      // Draw rich Milky Way diagonal diffuse band (spanning upper-right to lower-left)
      const mwGrad = ctx.createLinearGradient(canvas.width * 0.85, 0, canvas.width * 0.15, canvas.height);
      mwGrad.addColorStop(0, 'rgba(139, 92, 246, 0.045)');
      mwGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.04)');
      mwGrad.addColorStop(0.65, 'rgba(6, 182, 212, 0.035)');
      mwGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw starry field
      stars.forEach((s) => {
        const twinkle = prefersReducedMotion
          ? s.baseAlpha
          : s.baseAlpha * (0.45 + 0.55 * Math.sin(s.phase + t * s.speed * 12));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

        if (s.colorType === 'gold') {
          ctx.fillStyle = `rgba(251, 191, 36, ${Math.min(1, twinkle * 1.15)})`;
        } else if (s.colorType === 'cyan') {
          ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(1, twinkle * 1.1)})`;
        } else if (s.colorType === 'lavender') {
          ctx.fillStyle = `rgba(192, 132, 252, ${Math.min(1, twinkle * 1.05)})`;
        } else {
          ctx.fillStyle = `rgba(241, 245, 249, ${twinkle})`;
        }
        ctx.fill();

        // 4-point cross flare on prominent star sparks
        if (s.isSpark && !prefersReducedMotion && twinkle > 0.42) {
          ctx.save();
          ctx.strokeStyle = s.colorType === 'cyan'
            ? `rgba(56, 189, 248, ${twinkle * 0.5})`
            : `rgba(251, 191, 36, ${twinkle * 0.5})`;
          ctx.lineWidth = 0.65;
          const flareLen = s.r * 4.2;
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
  }, [intensity]);

  return (
    <div
      className="cosmic-bg"
      aria-hidden="true"
      style={{
        '--lagna-ambient-glow': motionProfile?.glowTint || 'rgba(99, 102, 241, 0.14)',
        '--lagna-ambient-accent': motionProfile?.accentTint || '#818cf8',
      }}
    >
      {/* Canvas Starfield & Milky Way Glow */}
      <canvas ref={canvasRef} className="star-canvas" />

      {/* Layered Multi-Hue Organic Nebulae matching visual target */}
      {/* 1. Electric Turquoise / Cyan Dust Stream (Center-Left & Lower-Left) */}
      <div className="nebula-layer nebula-teal-stream" />

      {/* 2. Deep Interstellar Indigo (Center & Upper Space) */}
      <div className="nebula-layer nebula-deep-indigo" />

      {/* 3. Radiant Magenta / Violet Celestial Swirl (Upper Right behind Guruji & Planets) */}
      <div className="nebula-layer nebula-violet-core" />

      {/* 4. Warm Celestial Gold Core Dust */}
      <div className="nebula-layer nebula-warm-gold" />

      {/* 5. Lagna Resonance Ambient Cloud */}
      <div className="nebula-layer nebula-lagna-resonance" />

      {/* Adaptive Distant Planetary Bodies matching visual reference */}
      {/* 1. Large Atmospheric Planet on Far Right (Behind Guruji stage) */}
      <div className="celestial-body planet-atmospheric-large">
        <div className="planet-atmosphere-glow" />
        <div className="planet-surface-body" />
      </div>

      {/* 2. Medium Shadowed Cratered Planet on Mid-Right */}
      <div className="celestial-body planet-rocky-mid" />

      {/* 3. Small Crescent Moon on Lower-Right Margin */}
      <div className="celestial-body planet-crescent-moon" />

      {/* 4. Textured Distant Cyan Planet on Left Margin */}
      <div className="celestial-body planet-distant-cyan" />

      {/* Subtle Atmospheric Horizon Silhouette on Bottom Edge */}
      <div className="cosmic-horizon-silhouette" />

      {/* Fine cosmic stardust grain */}
      <div className="cosmic-grain-overlay" />
    </div>
  );
}


