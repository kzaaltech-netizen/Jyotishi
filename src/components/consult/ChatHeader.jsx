import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Check, ChevronDown, Diamond, MoreVertical, Trash2 } from '../icons/index.jsx';
import { GuideAvatar } from './Message.jsx';
import TokenPill from '../ui/TokenPill.jsx';
import { GUIDES } from '../../lib/guides.js';
import useT from '../../hooks/useT.js';

function useOutside(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open, setOpen]);
  return ref;
}

// Top bar of the chat: the current guide. Tap the name to switch guide.
export default function ChatHeader({ guide, status, onGuideChange, onOpenChart, onClear, canClear }) {
  const { t, guide: localGuide } = useT();
  const [pickOpen, setPickOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pickRef = useOutside(pickOpen, setPickOpen);
  const menuRef = useOutside(menuOpen, setMenuOpen);

  return (
    <header className="glass relative z-20 flex items-center gap-2 border-x-0 border-t-0 px-2 py-2 sm:px-4">
      <div ref={pickRef} className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setPickOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={pickOpen}
          className="flex min-h-[48px] max-w-full items-center gap-3 rounded-xl px-2 text-left hover:bg-panel-2/70"
        >
          <GuideAvatar guide={guide} size={38} />
          <span className="min-w-0">
            <span className="flex items-center gap-1 font-semibold">
              {guide.name}
              <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
            </span>
            <span className="block truncate text-xs text-muted">{status}</span>
          </span>
        </button>
        <AnimatePresence>
          {pickOpen && (
            <m.ul
              role="listbox"
              aria-label={t.guides.choose}
              className="absolute left-0 top-full z-40 mt-1 w-[19rem] rounded-2xl border border-line bg-panel p-1.5 shadow-lift"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <li role="presentation" className="px-2.5 pb-1 pt-1.5 text-xs text-muted">{t.guides.pickerTitle}</li>
              {GUIDES.map(({ mode }) => localGuide(mode)).map((g) => (
                <li key={g.mode}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={g.mode === guide.mode}
                    onClick={() => {
                      onGuideChange(g.mode);
                      setPickOpen(false);
                    }}
                    className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-2.5 text-left text-sm hover:bg-panel-2"
                  >
                    <GuideAvatar guide={g} size={32} />
                    <span className="flex-1">
                      <span className="block font-medium">{g.name}</span>
                      <span className="block text-xs text-muted">{g.topic}</span>
                    </span>
                    {g.mode === guide.mode && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
      </div>

      <TokenPill className="lg:hidden" />
      <button type="button" className="icon-btn xl:hidden" onClick={onOpenChart} aria-label={t.chat.openChart}>
        <Diamond className="h-5 w-5" aria-hidden="true" />
      </button>
      <div ref={menuRef} className="relative">
        <button type="button" className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label={t.chat.more} aria-expanded={menuOpen}>
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <m.div
              className="absolute right-0 top-full z-40 mt-1 w-48 rounded-2xl border border-line bg-panel p-1.5 shadow-lift"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <button
                type="button"
                disabled={!canClear}
                onClick={() => {
                  onClear();
                  setMenuOpen(false);
                }}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-panel-2 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t.chat.clear}
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
