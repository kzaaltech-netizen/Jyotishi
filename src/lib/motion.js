// ─── Standardized Framer Motion Language for Astro-AI ─────────────────────────
// Enforces consistent spring physics, stagger rhythms, and reduced-motion respect.

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const gentleSpring = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
};

export const snappySpring = {
  type: 'spring',
  stiffness: 400,
  damping: 32,
};

// Page entrance variants
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// Stagger container
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Item reveal
export const revealItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: springTransition },
};

// Modal / Dialog scale & fade
export const modalOverlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalDialogVariants = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.15 } },
};

// Drawer slide variants
export const drawerVariants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: springTransition },
  exit: { y: '100%', transition: { duration: 0.2 } },
};

// Tap & hover micro-interactions
export const buttonPress = {
  whileHover: { scale: 1.02, transition: { duration: 0.1 } },
  whileTap: { scale: 0.98, transition: { duration: 0.05 } },
};

export const cardHover = {
  whileHover: { y: -3, transition: { duration: 0.18 } },
};
