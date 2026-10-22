import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, Square } from '../icons/index.jsx';
import useT from '../../hooks/useT.js';

const MAX = 500;
const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Speak instead of typing, in the app's language. English uses en-IN, which keeps
// Hinglish in Roman script the way people type it.
function useDictation(value, onChange, lang) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => () => recRef.current?.abort(), []);

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    const base = value.trim();
    rec.onresult = (e) => {
      const said = Array.from(e.results).map((r) => r[0].transcript).join('');
      onChange(base ? `${base} ${said}` : said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return { supported: Boolean(SpeechRecognition), listening, toggle };
}

// Message input: one rounded panel with mic and send buttons inside it.
const Composer = forwardRef(function Composer({ value, onChange, onSend, busy, placeholder, highlight = false, disabled = false }, ref) {
  const localRef = useRef(null);
  const textRef = ref || localRef;
  const { t, dateLocale } = useT();
  const dictation = useDictation(value, onChange, dateLocale);

  // Grow with content up to ~5 lines.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value, textRef]);

  const canSend = value.trim() && !busy && !disabled && value.length <= MAX;
  const submit = () => canSend && onSend(value);

  return (
    <div
      className={`flex items-end gap-1.5 rounded-xl border bg-panel p-2 pl-4 shadow-soft transition-all ${
        highlight || dictation.listening ? 'border-accent/60 ring-4 ring-accent/15' : 'border-line focus-within:border-accent/50'
      }`}
    >
      <label htmlFor="consult-input" className="sr-only">{t.chat.yourQuestion}</label>
      <textarea
        id="consult-input"
        ref={textRef}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={dictation.listening ? t.chat.listening : placeholder}
        className="block min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-muted/70 disabled:opacity-60"
      />
      {value.length > MAX - 80 && (
        <span className={`mb-3 text-xs num ${value.length > MAX ? 'text-danger' : 'text-muted'}`}>{MAX - value.length}</span>
      )}
      {dictation.supported && !disabled && (
        <button
          type="button"
          onClick={dictation.toggle}
          aria-label={dictation.listening ? t.chat.stopListening : t.chat.speak}
          aria-pressed={dictation.listening}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
            dictation.listening ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-panel-2 hover:text-ink'
          }`}
        >
          {dictation.listening ? <Square className="h-4 w-4 animate-pulse" fill="currentColor" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
        </button>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label={t.chat.send}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink transition-transform hover:scale-[1.04] active:scale-95 disabled:scale-100 disabled:opacity-40"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  );
});

export default Composer;
