import React from 'react';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Compass, Scroll, User } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { t } from '../../lib/i18n.js';
import { springTransition } from '../../lib/motion.js';
import './BottomNav.css';

const NAV_ITEMS = [
  { page: 'dashboard', labelKey: 'home', defaultLabel: 'Home', Icon: Home },
  { page: 'ask', labelKey: 'ask', defaultLabel: 'Ask', Icon: MessageSquare },
  { page: 'horoscope', labelKey: 'horoscope', defaultLabel: 'Horoscope', Icon: Compass },
  { page: 'kundli', labelKey: 'kundli', defaultLabel: 'Kundli', Icon: Scroll },
  { page: 'profile', labelKey: 'profile', defaultLabel: 'Profile', Icon: User },
];

export default function BottomNav() {
  const { currentPage, setCurrentPage, language } = useApp();

  const showNav = ['dashboard', 'ask', 'horoscope', 'kundli', 'profile', 'analysis', 'wallet', 'buy-tokens', 'premium', 'settings'].includes(currentPage);

  if (!showNav) return null;

  return (
    <nav className="bottom-nav hide-desktop" role="navigation" aria-label="Bottom Navigation">
      {NAV_ITEMS.map(({ page, labelKey, defaultLabel, Icon }) => {
        const active = currentPage === page;
        return (
          <button
            key={page}
            className={`bottom-nav-item ${active ? 'bottom-nav-active' : ''}`}
            onClick={() => setCurrentPage(page)}
            aria-current={active ? 'page' : undefined}
          >
            <div className="nav-icon-wrapper relative">
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="bottom-nav-indicator-pill"
                  transition={springTransition}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`} />
            </div>
            <span className="bottom-nav-label">
              {t(labelKey, language, defaultLabel)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
