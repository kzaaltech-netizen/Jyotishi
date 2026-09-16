import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Info } from 'lucide-react';
import { modalOverlayVariants, modalDialogVariants, buttonPress } from '../../lib/motion.js';
import './HouseDetailModal.css';

export default function HouseDetailModal({ house, onClose, onSelectPlanet, onAskOracle }) {
  if (!house) return null;

  const defaultQuestion = `What does my ${house.number}th house (${house.sign}, ruled by ${house.lord}) indicate about ${house.theme || 'this area of life'}?`;

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
          className="house-modal-card"
          onClick={(e) => e.stopPropagation()}
          variants={modalDialogVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <span className="house-badge-number">Bhava {house.number}</span>
              <h3 className="modal-house-title">{house.title}</h3>
              <span className="modal-house-rashi">
                Occupied by {house.sign} ({house.signSanskrit || ''}) • Lord: {house.lord}
              </span>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          {/* Theme Banner */}
          <div className="house-theme-box">
            <span className="theme-label">Core Bhava Theme:</span>
            <p className="theme-text">{house.theme}</p>
          </div>

          {/* Resident Planets */}
          <div className="house-planets-section">
            <span className="section-label">Resident Planets in House {house.number}:</span>
            {(!house.planets || house.planets.length === 0) ? (
              <div className="empty-planets-box">
                <span className="font-body-sm text-muted">No planetary occupants in this bhava. Governed solely by {house.lord}.</span>
              </div>
            ) : (
              <div className="house-planets-pills">
                {house.planets.map((p) => (
                  <button
                    key={p.name}
                    className="house-planet-pill"
                    onClick={() => {
                      if (onSelectPlanet) onSelectPlanet(p);
                    }}
                    title="Click for planet analysis"
                  >
                    <span className="pill-dot" style={{ background: p.color }}></span>
                    <span className="pill-name">{p.name}</span>
                    <span className="pill-deg">{p.deg}°</span>
                    {p.isRetrograde && <span className="pill-retro">℞</span>}
                    <Info className="w-3.5 h-3.5 text-on-surface-variant ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Significations */}
          {house.keySignifications && house.keySignifications.length > 0 && (
            <div className="house-significations-box">
              <span className="section-label">Shastric Portfolios:</span>
              <div className="significations-tags">
                {house.keySignifications.map((s, idx) => (
                  <span key={idx} className="sig-tag">• {s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Footer with Ask AI button */}
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
              <span>Ask Your Kundli About House {house.number}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
