import React from 'react';
import './CurrentPhaseBadge.css';

export default function CurrentPhaseBadge({ dashaInfo, nakshatra }) {
  const currentDasha = dashaInfo?.currentDasha;
  const antardasha   = dashaInfo?.antardasha;

  const lord = currentDasha?.lord || 'Jupiter';
  const subLord = antardasha?.lord || 'Venus';

  return (
    <div className="current-phase-card card">
      <div className="phase-card-top">
        <div className="phase-badge-chip">
          <span className="live-pulse-dot" />
          <span className="label-sm">CURRENT ASTROLOGICAL PHASE</span>
        </div>
        <span className="phase-dates label-sm text-muted">Active Now</span>
      </div>

      <div className="phase-content-row">
        <div className="phase-main-info">
          <h3 className="headline-md text-primary">
            {lord} <span className="text-muted" style={{ fontWeight: 400, fontSize: 18 }}>/ {subLord} Phase</span>
          </h3>
          <p className="body-md text-on-surface phase-guidance">
            {getPhaseGuidance(lord)}
          </p>
        </div>

        <div className="phase-stat-chips">
          <div className="phase-chip">
            <span className="label-sm text-muted">Mahadasha</span>
            <span className="title-sm text-on-surface">{lord}</span>
          </div>
          <div className="phase-chip">
            <span className="label-sm text-muted">Moon Nakshatra</span>
            <span className="title-sm text-tertiary">{nakshatra?.name || 'Rohini'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPhaseGuidance(lord) {
  const guidance = {
    Jupiter: 'A period of expansion, wisdom, and inner growth. Focus on learning and long-term vision.',
    Saturn: 'A period of discipline, structure, and patience. Rewards persistent effort and boundary setting.',
    Mercury: 'A fast-paced period favoring communication, intellect, business, and skill refinement.',
    Venus: 'A creative and harmonious period. Focus on relationships, aesthetics, and material comfort.',
    Sun: 'A period of leadership, clarity, and vitality. Take initiative and embrace visibility.',
    Moon: 'An intuitive, emotionally rich period. Prioritize self-care, home, and emotional balance.',
    Mars: 'An energetic and decisive period. Pursue ambitious goals with courage and focus.',
    Rahu: 'A transformative, innovative period. Be mindful of illusions while exploring new avenues.',
    Ketu: 'A reflective and spiritual period. Ideal for introspection, detachment, and deep insight.',
  };
  return guidance[lord] || 'Align your actions with long-term goals and stay patient through transit shifts.';
}
