import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { modalOverlayVariants, modalDialogVariants, buttonPress } from '../../lib/motion.js';
import { SIGN_LORDS } from './chartDataNormalizer.js';
import './PlanetDetailModal.css';

export default function PlanetDetailModal({ planet, onClose, onAskOracle }) {
  if (!planet) return null;

  const isRetro = planet.isRetrograde;
  const isExalted = planet.dignity === 'Exalted';
  const isDebilitated = planet.dignity === 'Debilitated';
  const isOwn = planet.dignity === 'Own Sign';
  const signRuler = SIGN_LORDS[planet.sign] || '—';

  const defaultQuestion = `What does ${planet.name} in ${planet.sign} in the ${planet.house}th house reveal about my destiny and karmic path?`;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="planet-modal-card"
          onClick={(e) => e.stopPropagation()}
          variants={modalDialogVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <span className="planet-symbol-badge" style={{ borderColor: planet.color, color: planet.color }}>
                {planet.sanskritAbbr || planet.abbr}
              </span>
              <div>
                <h3 className="modal-planet-name">
                  {planet.name} <span className="sanskrit-sub">· {planet.sanskrit}</span>
                </h3>
                <span className="modal-house-subtitle">
                  House {planet.house} • {planet.sign} ({planet.deg}°)
                </span>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          {/* Dignity & Status Chips */}
          <div className="modal-chips-row">
            <span className={`status-pill ${isExalted ? 'pill-exalted' : isDebilitated ? 'pill-debilitated' : isOwn ? 'pill-own' : 'pill-normal'}`}>
              {planet.dignity}
            </span>
            <span className={`status-pill ${isRetro ? 'pill-retro' : 'pill-direct'}`}>
              {isRetro ? 'Retrograde · वक्री ℞' : 'Direct · मार्गी'}
            </span>
            <span className="status-pill pill-neutral">
              Sign Ruler: {signRuler}
            </span>
          </div>

          {/* Grid Attributes */}
          <div className="modal-details-grid">
            <div className="detail-item">
              <span className="detail-label">Rashi (राशि)</span>
              <span className="detail-val">{planet.sign}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Bhava (भाव)</span>
              <span className="detail-val">{planet.house}th House</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Exact Longitude</span>
              <span className="detail-val">{planet.deg}° in sign</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Nakshatra & Pada</span>
              <span className="detail-val">{planet.nakshatra} {planet.pada ? `(Pada ${planet.pada})` : ''}</span>
            </div>
          </div>

          {/* Natural Karaka */}
          {planet.naturalSignificance && (
            <div className="modal-karaka-box">
              <span className="karaka-label">Natural Significator (कारक):</span>
              <p className="karaka-text">{planet.naturalSignificance}</p>
            </div>
          )}

          {/* Ask AI Trigger */}
          <div className="modal-footer">
            <motion.button
              className="btn-ask-oracle font-title-sm"
              onClick={() => {
                if (onAskOracle) onAskOracle(defaultQuestion);
                onClose();
              }}
              {...buttonPress}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Ask Your Kundli About {planet.name}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
