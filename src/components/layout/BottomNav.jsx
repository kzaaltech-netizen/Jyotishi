import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import './BottomNav.css';

const NAV_ITEMS = [
  { key: 'dashboard', mode: 'general',    label: 'Cosmos',   icon: 'auto_awesome' },
  { key: 'analysis',  mode: 'career',     label: 'Career',   icon: 'work' },
  { key: 'analysis',  mode: 'wealth',     label: 'Wealth',   icon: 'payments' },
  { key: 'analysis',  mode: 'abundance',  label: 'Abundance',icon: 'eco' },
  { key: 'analysis',  mode: 'union',      label: 'Union',    icon: 'favorite' },
];

export default function BottomNav() {
  const { currentPage, setCurrentPage, currentMode, setCurrentMode } = useApp();

  const isActive = (item) => {
    if (item.key === 'dashboard') return currentPage === 'dashboard' && currentMode === 'general';
    return currentPage === 'analysis' && currentMode === item.mode;
  };

  return (
    <nav className="bottom-nav hide-desktop">
      {NAV_ITEMS.map(item => (
        <button
          key={`${item.key}-${item.mode}`}
          className={`bottom-nav-item ${isActive(item) ? 'bottom-nav-active' : ''}`}
          onClick={() => { setCurrentMode(item.mode); setCurrentPage(item.key); }}
        >
          <span className={`material-symbols-outlined ${isActive(item) ? 'icon-filled' : ''}`}>
            {item.icon}
          </span>
          <span className="bottom-nav-label label-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
