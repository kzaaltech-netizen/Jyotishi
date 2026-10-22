import React from 'react';
import { MessageCircle } from '../icons/index.jsx';
import Modal from '../ui/Modal.jsx';
import { SIGN_LORDS } from './chartDataNormalizer.js';
import useT from '../../hooks/useT.js';

export default function PlanetDetailModal({ planet, onClose, onAskOracle }) {
  const p = planet;
  const { t, f, planet: planetName, sign, nak, dignity, house, abbr, signifies } = useT();
  const c = t.chart.planetModal;
  const question = p ? f(c.question, { planet: planetName(p.name), sign: sign(p.sign), house: house(p.house) }) : '';

  return (
    <Modal
      open={!!p}
      onClose={onClose}
      labelledBy="planet-modal-title"
      title={
        p && (
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft font-display text-lg text-accent">
              {abbr(p)}
            </span>
            <div>
              <h2 className="text-xl">
                {planetName(p.name)} {p.sanskrit && planetName(p.name) !== p.sanskrit && <span className="deva text-base text-muted">· {p.sanskrit}</span>}
              </h2>
              <p className="text-sm text-muted num">{f(c.houseLine, { n: p.house, sign: sign(p.sign), deg: p.deg })}</p>
            </div>
          </div>
        )
      }
      footer={
        p && (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              onAskOracle?.(question);
              onClose();
            }}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {f(c.ask, { planet: planetName(p.name) })}
          </button>
        )
      }
    >
      {p && (
        <>
          <div className="flex flex-wrap gap-2">
            <span className="pill">{dignity(p.dignity || 'Normal')}</span>
            <span className="pill">{p.isRetrograde ? `${t.common.retrograde} ℞` : t.common.direct}</span>
            <span className="pill">{f(c.signLord, { lord: SIGN_LORDS[p.sign] ? planetName(SIGN_LORDS[p.sign]) : '—' })}</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
            <Detail label={c.sign} value={sign(p.sign)} />
            <Detail label={c.house} value={`${p.house}`} />
            <Detail label={c.degree} value={`${p.deg}°`} />
            <Detail label={c.nakshatra} value={`${p.nakshatra ? nak(p.nakshatra) : '—'}${p.pada ? ` · ${f(t.common.pada, { n: p.pada })}` : ''}`} />
          </dl>
          {(signifies(p.name) || p.naturalSignificance) && (
            <div className="mt-5 rounded-xl bg-panel-2/70 p-4 text-sm">
              <p className="font-semibold">{c.signifies}</p>
              <p className="mt-1 text-muted">{signifies(p.name) || p.naturalSignificance}</p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold num">{value}</dd>
    </div>
  );
}
