import React, { useEffect, useRef } from 'react';
import './CosmicBackground.css';

export default function CosmicBackground({ intensity = 'normal' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const starCount = intensity === 'dense' ? 200 : 120;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      stars.forEach(s => {
        const a = 0.2 + 0.8 * Math.abs(Math.sin(s.phase + t * s.speed * 10));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.7})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [intensity]);

  return (
    <div className="cosmic-bg">
      <canvas ref={canvasRef} className="star-canvas" />
      <div className="nebula-layer nebula-1" />
      <div className="nebula-layer nebula-2" />
      <div className="nebula-layer nebula-3" />
      <div className="grain-overlay" />
    </div>
  );
}
