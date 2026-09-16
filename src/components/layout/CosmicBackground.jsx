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
    const starCount = isMobile ? 80 : (intensity === 'dense' ? 220 : 140);

    // Multi-depth starry sky: tiny distant stars, mid stars, and rare luminous star sparks
    const stars = Array.from({ length: starCount }, (_, idx) => {
      const isSpark = idx % 28 === 0; // Rare diffraction star spark
      const isBright = idx % 7 === 0;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: isSpark ? Math.random() * 1.6 + 1.2 : (isBright ? Math.random() * 1.1 + 0.8 : Math.random() * 0.7 + 0.3),
        baseAlpha: isSpark ? 0.75 : (isBright ? 0.55 : Math.random() * 0.4 + 0.15),
        speed: Math.random() * 0.003 + 0.0008,
        phase: Math.random() * Math.PI * 2,
        isSpark,
        // Color hierarchy: mostly cool white/ivory, sparse gold & cyan
        colorType: isSpark ? 'gold' : (idx % 11 === 0 ? 'cyan' : (idx % 19 === 0 ? 'gold' : 'white')),
      };
    });

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += prefersReducedMotion ? 0 : 0.006;

      // Draw subtle Milky Way diagonal diffuse band
      const mwGrad = ctx.createLinearGradient(canvas.width * 0.8, 0, canvas.width * 0.2, canvas.height);
      mwGrad.addColorStop(0, 'rgba(99, 102, 241, 0.035)');
      mwGrad.addColorStop(0.3, 'rgba(139, 92, 246, 0.045)');
      mwGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.03)');
      mwGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mwGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw starry field
      stars.forEach((s) => {
        const twinkle = prefersReducedMotion
          ? s.baseAlpha
          : s.baseAlpha * (0.4 + 0.6 * Math.sin(s.phase + t * s.speed * 10));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

        if (s.colorType === 'gold') {
          ctx.fillStyle = `rgba(251, 191, 36, ${Math.min(1, twinkle * 1.1)})`;
        } else if (s.colorType === 'cyan') {
          ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(1, twinkle * 1.05)})`;
        } else {
          ctx.fillStyle = `rgba(226, 232, 240, ${twinkle})`;
        }
        ctx.fill();

        // Delicate 4-point cross flare on rare star sparks
        if (s.isSpark && !prefersReducedMotion && twinkle > 0.4) {
          ctx.save();
          ctx.strokeStyle = `rgba(251, 191, 36, ${twinkle * 0.45})`;
          ctx.lineWidth = 0.6;
          const flareLen = s.r * 3.8;
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
        '--lagna-ambient-glow': motionProfile?.glowTint || 'rgba(99, 102, 241, 0.12)',
        '--lagna-ambient-accent': motionProfile?.accentTint || '#818cf8',
      }}
    >
      {/* Canvas Starfield & Milky Way Glow */}
      <canvas ref={canvasRef} className="star-canvas" />

      {/* Layered Organic Nebulae (Indigo, Violet, Cyan/Teal & Lagna Resonance) */}
      <div className="nebula-layer nebula-deep-indigo" />
      <div className="nebula-layer nebula-violet-core" />
      <div className="nebula-layer nebula-teal-stream" />
      <div className="nebula-layer nebula-lagna-resonance" />

      {/* Adaptive Distant Planetary Bodies (Strictly placed on non-intrusive outer margins) */}
      {/* 1. Companion Planet: Crescent sphere near upper right (behind Guruji area) */}
      <div className="celestial-body planet-companion-crescent">
        <div className="planet-crescent-halo" />
        <div className="planet-crescent-core" />
      </div>

      {/* 2. Distant Shadowed Purple Planet on Mid-Right edge */}
      <div className="celestial-body planet-distant-purple" />

      {/* 3. Subtle Crescent Moon / Orb on Bottom-Left Margin */}
      <div className="celestial-body planet-crescent-left" />

      {/* 4. Distant Miniature Teal Planet on Upper Left (widescreen only) */}
      <div className="celestial-body planet-distant-teal" />

      {/* Very faint fine cosmic grain for cinematic depth */}
      <div className="cosmic-grain-overlay" />
    </div>
  );
}


