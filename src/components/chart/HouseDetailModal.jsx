import React from 'react';
import { ChevronRight, MessageCircle } from '../icons/index.jsx';
import Modal from '../ui/Modal.jsx';
import useT from '../../hooks/useT.js';

export default function HouseDetailModal({ house, onClose, onSelectPlanet, onAskOracle }) {
  const h = house;
  const { t, f, planet, sign, house: houseName, houseInfo } = useT();
  const c = t.chart.houseModal;
  const info = h ? houseInfo(h.number) : null;
  const theme = info?.theme || h?.theme;
  const question = h ? f(c.question, { house: houseName(h.number), sign: sign(h.sign), lord: planet(h.lord), theme: theme || c.thisArea }) : '';

  return (
    <Modal
      open={!!h}
      onClose={onClose}
      labelledBy="house-modal-title"
      title={
        h && (
          <div>
            <p className="eyebrow">{f(c.eyebrow, { n: h.number })}</p>
            <h2 className="mt-1 text-xl">{info?.title || h.title || f(c.eyebrow, { n: h.number })}</h2>
            <p className="text-sm text-muted">
              {sign(h.sign)} {h.signSanskrit && sign(h.sign) !== h.signSanskrit && <span className="deva">({h.signSanskrit})</span>} · {f(c.lordLine, { lord: planet(h.lord) })}
            </p>
          </div>
        )
      }
      footer={
        h && (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              onAskOracle?.(question);
              onClose();
            }}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {f(c.ask, { n: h.number })}
          </button>
        )
      }
    >
      {h && (
        <>
          {theme && <p className="rounded-xl bg-panel-2/70 p-4 text-sm">{theme}</p>}
          <p className="mt-5 text-sm font-semibold">{c.planetsHere}</p>
          {!h.planets?.length ? (
            <p className="mt-1 text-sm text-muted">{f(c.noPlanets, { lord: planet(h.lord) })}</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {h.planets.map((p) => (
                <li key={p.name}>
                  <button
                    type="button"
                    className="flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-line px-3 text-left text-sm hover:bg-panel-2"
                    onClick={() => onSelectPlanet?.(p)}
                    disabled={!onSelectPlanet}
                  >
                    <span className="font-semibold">{planet(p.name)}</span>
                    <span className="text-muted num">{p.deg}°{p.isRetrograde ? ' ℞' : ''}</span>
                    {onSelectPlanet && <ChevronRight className="ml-auto h-4 w-4 text-muted" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {(info?.keys || h.keySignifications)?.length > 0 && (
            <>
              <p className="mt-5 text-sm font-semibold">{c.governs}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(info?.keys || h.keySignifications).map((s) => (
                  <span key={s} className="pill">{s}</span>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
