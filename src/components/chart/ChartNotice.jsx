import React from 'react';
import { AlertTriangle } from '../icons/index.jsx';
import useT from '../../hooks/useT.js';

export default function ChartNotice({ message }) {
  const { t } = useT();
  return (
    <div className="rounded-2xl border border-line bg-panel-2/60 p-5 text-center">
      <AlertTriangle className="mx-auto h-5 w-5 text-gold" aria-hidden="true" />
      <p className="mt-2 font-semibold">{t.chart.notDrawn}</p>
      <p className="mt-1 text-sm text-muted">{message || t.chart.checkDetails}</p>
    </div>
  );
}
