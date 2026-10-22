import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Bookmark, Check, ChevronDown, Clock, Copy, ListChecks, Share2 } from '../icons/index.jsx';
import { splitChartRefs } from '../../lib/chartRefs.js';
import GuruAvatar from '../icons/GuruAvatar.jsx';
import { formatMessageContent } from '../../lib/formatMessage.js';
import useT from '../../hooks/useT.js';

// Text where house and planet mentions become buttons that light up the chart.
export function RichText({ text, onRef, focus }) {
  const { t } = useT();
  return (
    <>
      {splitChartRefs(String(text).replace(/^###\s+/gm, '')).map((part, i) => {
        if (typeof part === 'string') return <React.Fragment key={i}>{part}</React.Fragment>;
        const active =
          (part.type === 'house' && focus?.house === part.house) ||
          (part.type === 'planet' && focus?.planet === part.planet);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onRef?.(part)}
            className={`mx-0.5 rounded-md px-1.5 py-px font-semibold transition-colors ${
              active ? 'bg-accent text-accent-ink' : 'bg-accent-soft text-accent hover:bg-accent/20'
            }`}
            title={t.chat.showOnChart}
          >
            {part.text}
          </button>
        );
      })}
    </>
  );
}

export function GuideAvatar({ guide, size = 32 }) {
  return <GuruAvatar guide={guide} size={size} />;
}

// The guide's side of the conversation: avatar, name, then flowing text.
export function GuideBlock({ guide, children }) {
  return (
    <div className="flex gap-3">
      <GuideAvatar guide={guide} />
      <div className="min-w-0 flex-1 pt-1">
        <p className="mb-1.5 text-sm font-semibold">{guide.name}</p>
        {children}
      </div>
    </div>
  );
}

export function Thinking({ guide, label }) {
  const { t } = useT();
  return (
    <m.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <GuideBlock guide={guide}>
        <m.p
          className="text-[15px] italic text-muted"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          role="status"
        >
          {label || t.chat.reading}
        </m.p>
      </GuideBlock>
    </m.div>
  );
}

export function UserMessage({ msg }) {
  return (
    <m.div className="flex justify-end" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-accent-soft px-4 py-2.5 text-[15px] sm:max-w-[70%]">{msg.content}</p>
    </m.div>
  );
}

// Parts of one reply: `messages` from the server, else paragraphs of the answer.
function partsOf(msg) {
  const f = msg.formatted;
  if (Array.isArray(f?.messages) && f.messages.length) return f.messages;
  const text = f?.answer || formatMessageContent(msg.content);
  return String(text).split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
}

// Copy, share (e.g. to family on WhatsApp) or save a reply to Readings.
function ReplyActions({ text, guide, onSave }) {
  const { t } = useT();
  const [state, setState] = useState(null); // 'copied' | 'saved' | null
  const flash = (s) => {
    setState(s);
    setTimeout(() => setState(null), 2000);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash('copied');
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  const share = async () => {
    const body = `${text}\n\n— ${guide.name}, Jyotishly · https://jyotishly.com`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t.chat.shareTitle, text: body });
      } catch {
        /* share sheet closed */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
    }
  };
  const btn = 'inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2 text-xs text-muted transition-colors hover:bg-panel-2 hover:text-ink';
  return (
    <div className="mt-2 -ml-2 flex flex-wrap items-center gap-0.5">
      <button type="button" className={btn} onClick={copy}>
        {state === 'copied' ? <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        {state === 'copied' ? t.chat.copied : t.chat.copy}
      </button>
      <button type="button" className={btn} onClick={share}>
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        {t.chat.share}
      </button>
      {onSave && (
        <button
          type="button"
          className={btn}
          disabled={state === 'saved'}
          onClick={async () => {
            await onSave(text);
            flash('saved');
          }}
        >
          {state === 'saved' ? <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
          {state === 'saved' ? t.chat.saved : t.chat.save}
        </button>
      )}
    </div>
  );
}

// A guide's reply. When `live`, its parts appear one after another, like someone talking.
export function AiMessage({ msg, guide, onRef, focus, live = false, isLast = false, onFollowUp, disabled, onRevealed, onSave }) {
  const { t, f: fill } = useT();
  const parts = useMemo(() => partsOf(msg), [msg]);
  const [shown, setShown] = useState(live ? 1 : parts.length);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    if (shown >= parts.length) {
      onRevealed?.();
      return undefined;
    }
    const next = parts[shown] || '';
    const t = setTimeout(() => setShown((n) => n + 1), Math.min(1800, 500 + next.length * 10));
    return () => clearTimeout(t);
  }, [shown, parts, onRevealed]);

  const done = shown >= parts.length;
  const f = msg.formatted;
  const sections = Array.isArray(f?.sections) ? f.sections : [];
  const timing = f?.timing?.available && f?.timing?.summary ? f.timing.summary : null;
  const actions = Array.isArray(f?.actions) ? f.actions : [];
  const evidence = Array.isArray(f?.evidence) ? f.evidence : [];
  const followUps = isLast && Array.isArray(f?.followUps) ? f.followUps.slice(0, 3) : [];

  return (
    <GuideBlock guide={guide}>
      <div className="space-y-3 text-[15.5px] leading-[1.7]">
        {parts.slice(0, shown).map((p, i) => (
          <m.p key={i} className="whitespace-pre-wrap" initial={live ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <RichText text={p} onRef={onRef} focus={focus} />
          </m.p>
        ))}
        {!done && (
          <m.span className="inline-block h-4 w-1.5 rounded-full bg-accent/60" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }} aria-hidden="true" />
        )}
      </div>

      {done && (sections.length > 0 || timing || actions.length > 0) && (
        <m.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-line bg-panel/80 px-4 py-3 text-[14.5px]">
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-ink/85"><RichText text={s.body} onRef={onRef} focus={focus} /></p>
            </div>
          ))}
          {timing && (
            <div className="flex gap-2.5 rounded-xl bg-gold-soft/80 px-4 py-3 text-[14.5px]">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{timing}</span>
            </div>
          )}
          {actions.length > 0 && (
            <div className="rounded-xl border border-line bg-panel/80 px-4 py-3 text-[14.5px]">
              <p className="flex items-center gap-1.5 font-semibold"><ListChecks className="h-4 w-4 text-accent" aria-hidden="true" />{t.chat.tryThis}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">{actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          )}
        </m.div>
      )}

      {done && <ReplyActions text={parts.join('\n\n')} guide={guide} onSave={onSave} />}

      {done && evidence.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowEvidence((v) => !v)}
            aria-expanded={showEvidence}
            className="inline-flex min-h-[32px] items-center gap-1 text-xs text-muted hover:text-ink"
          >
            {evidence.length === 1 ? t.chat.basedOnOne : fill(t.chat.basedOn, { n: evidence.length })}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showEvidence ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {showEvidence && (
              <m.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-1.5 overflow-hidden pt-1">
                {evidence.map((e, i) => (
                  <li key={i} className="pill">{e.label}: {e.value}</li>
                ))}
              </m.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {done && followUps.length > 0 && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-wrap gap-2">
          {followUps.map((fu, i) => (
            <button key={i} type="button" className="chip" disabled={disabled} onClick={() => onFollowUp?.(fu.question)}>
              {fu.question}
            </button>
          ))}
        </m.div>
      )}
    </GuideBlock>
  );
}
