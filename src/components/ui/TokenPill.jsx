import React, { useRef } from 'react';
import { Coins } from '../icons/index.jsx';
import { useTokens } from '../../context/TokenContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import CountUp from '../reactbits/CountUp.jsx';
import useT from '../../hooks/useT.js';

export default function TokenPill({ className = '' }) {
  const { balance } = useTokens();
  const { setCurrentPage } = useApp();
  const { t, f } = useT();
  const prev = useRef(balance);
  const from = prev.current;
  prev.current = balance;

  return (
    <button
      type="button"
      onClick={() => setCurrentPage('wallet')}
      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-line bg-panel/80 px-3 text-sm font-semibold num hover:bg-panel-2 ${className}`}
      aria-label={f(t.nav.wallet, { n: balance })}
    >
      <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
      <CountUp key={balance} from={from} to={balance} duration={0.8} trigger="load" />
    </button>
  );
}
