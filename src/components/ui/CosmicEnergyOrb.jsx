import React from 'react';
import './CosmicEnergyOrb.css';

/**
 * CosmicEnergyOrb
 * 
 * Living celestial energy core representing the Jyotish cosmic intelligence.
 * Replaces static human portrait with an authentic, breathing cosmic presence:
 * - Multi-layered stellar plasma sphere
 * - 3D gyroscopic orbital astrolabe rings
 * - Breathing coronal energy aura
 * - Sacred golden bindu / Om resonance center
 * - State-reactive dynamics (idle, thinking, answer)
 */
export default function CosmicEnergyOrb({
  size = 106,
  state = 'idle', // 'idle' | 'thinking' | 'answer'
  motionProfile = null,
  showRings = true,
  className = '',
}) {
  const isCompact = size < 50;
  const renderRings = showRings && !isCompact;

  return (
    <div
      className={`cosmic-energy-orb-root state-${state} ${isCompact ? 'orb-compact' : ''} ${className}`}
      style={{
        '--orb-size': `${size}px`,
        '--orb-accent': motionProfile?.accentTint || '#fbbf24',
        '--orb-glow': motionProfile?.glowTint || 'rgba(129, 140, 248, 0.35)',
      }}
      aria-label="Cosmic Energy Intelligence Core"
      role="img"
    >
      {/* Ambient Breathing Coronal Aura */}
      <div className="orb-corona-aura" aria-hidden="true" />
      <div className="orb-corona-pulse" aria-hidden="true" />

      {/* 3D Astrolabe Gyroscopic Orbital Rings */}
      {renderRings && (
        <div className="orb-gyroscopes" aria-hidden="true">
          <div className="orb-ring ring-latitude" />
          <div className="orb-ring ring-longitude" />
          <div className="orb-ring ring-equator">
            <span className="ring-node node-1" />
            <span className="ring-node node-2" />
          </div>
        </div>
      )}

      {/* The Central Energy Sphere Core */}
      <div className="orb-sphere">
        {/* Deep Cosmic Void Base */}
        <div className="orb-base-depth" />

        {/* Dynamic Swirling Plasma Streams */}
        <div className="orb-plasma-stream stream-violet" />
        <div className="orb-plasma-stream stream-cyan" />
        <div className="orb-plasma-stream stream-gold" />

        {/* Radiant Stellar Singularity / Core Flare */}
        <div className="orb-stellar-core" />

        {/* Sacred Golden Bindu / Om Resonance Center */}
        <div className="orb-sacred-center">
          <span className="orb-om-char">ॐ</span>
        </div>

        {/* Specular Celestial Sheen */}
        <div className="orb-specular-sheen" />
      </div>
    </div>
  );
}
