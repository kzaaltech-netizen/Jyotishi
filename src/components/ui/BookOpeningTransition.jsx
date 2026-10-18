import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BookOpeningTransition.css';

/**
 * BookOpeningTransition
 * Sacred Vedic Manuscript / Book Opening Transition
 * Features dual-page manuscript leaves swinging open outwards in 3D space
 * to reveal the grand Ask Guruji consultation room.
 */
export default function BookOpeningTransition({ isOpen = false, onAnimationComplete }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="book-transition-overlay"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Central Spine */}
          <motion.div
            className="book-spine-crease"
            initial={{ opacity: 1, scaleY: 0.9 }}
            animate={{ opacity: [1, 0.8, 0], scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />

          {/* Left Manuscript Leaf */}
          <motion.div
            className="book-leaf book-leaf-left"
            initial={{ rotateY: 0, x: '0%', opacity: 1 }}
            animate={{ rotateY: -95, x: '-8%', opacity: [1, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.72,
              ease: [0.25, 1, 0.5, 1],
            }}
          >
            <div className="book-leaf-filigree" />
            <div className="corner-accent top-left" />
            <div className="corner-accent bottom-left" />
          </motion.div>

          {/* Right Manuscript Leaf */}
          <motion.div
            className="book-leaf book-leaf-right"
            initial={{ rotateY: 0, x: '0%', opacity: 1 }}
            animate={{ rotateY: 95, x: '8%', opacity: [1, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.72,
              ease: [0.25, 1, 0.5, 1],
            }}
            onAnimationComplete={onAnimationComplete}
          >
            <div className="book-leaf-filigree" />
            <div className="corner-accent top-right" />
            <div className="corner-accent bottom-right" />
          </motion.div>

          {/* Center Sacred Om Seal */}
          <motion.div
            className="book-center-seal"
            initial={{ scale: 0.9, opacity: 1 }}
            animate={{ scale: 1.12, opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="seal-disc">
              <span className="seal-om">ॐ</span>
            </div>
            <div className="seal-inscription">
              <span className="seal-title">Jyotishly</span>
              <span className="seal-sub">॥ अथ प्रश्न विचारः ॥</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
