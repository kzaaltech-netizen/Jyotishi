import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CurtainTransition.css';

/**
 * Royal Blood Red Curtain Transition Component
 * Sweeps left and right curtain panels in dramatic royal deep blood red
 * with gold trim and sacred emblem when triggered.
 */
export default function CurtainTransition({ isOpen = false, onAnimationComplete }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="curtain-overlay"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.45, duration: 0.15 } }}
        >
          {/* Left Curtain Panel */}
          <motion.div
            className="curtain-panel curtain-left"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 26,
              mass: 0.85
            }}
          >
            <div className="curtain-texture"></div>
            <div className="curtain-gold-border right-gold"></div>
          </motion.div>

          {/* Right Curtain Panel */}
          <motion.div
            className="curtain-panel curtain-right"
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 26,
              mass: 0.85
            }}
            onAnimationComplete={onAnimationComplete}
          >
            <div className="curtain-texture"></div>
            <div className="curtain-gold-border left-gold"></div>
          </motion.div>

          {/* Center Royal Gold Medallion */}
          <motion.div
            className="curtain-center-seal"
            initial={{ scale: 0, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 22,
              delay: 0.12
            }}
          >
            <div className="seal-outer-ring">
              <div className="seal-inner-emblem">॥ ॐ ॥</div>
              <span className="seal-subtext">JYOTISHLY</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

