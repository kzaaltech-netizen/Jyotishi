import React, { useEffect, useRef } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X } from '../icons/index.jsx';
import useT from '../../hooks/useT.js';

// Dialog that becomes a bottom sheet on small screens.
export default function Modal({ open, onClose, title, children, footer, labelledBy = 'modal-title' }) {
  const panelRef = useRef(null);
  const { t } = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.activeElement;
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <m.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className="safe-bottom max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-panel p-5 shadow-lift outline-none sm:max-w-lg sm:rounded-3xl sm:p-6"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div id={labelledBy} className="min-w-0">{title}</div>
              <button type="button" className="icon-btn -mr-2 -mt-2 shrink-0" onClick={onClose} aria-label={t.common.close}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
