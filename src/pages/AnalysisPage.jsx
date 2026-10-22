import React, { useState } from 'react';
import { BookOpen, MessageCircle } from '../components/icons/index.jsx';
import AppShell, { Page } from '../components/shell/AppShell.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import PlanetaryTable from '../components/chart/PlanetaryTable.jsx';
import { NoChart } from './KundliPage.jsx';
import { useApp } from '../context/AppContext.jsx';
import useT from '../hooks/useT.js';

export default function AnalysisPage() {
  const { chartData, savedReports, setCurrentPage } = useApp();
  const [selected, setSelected] = useState(null);
  const { t, guide, date } = useT();
  const r0 = t.readings;
  const dateOf = (r) => date(r.timestamp || r.createdAt || Date.now(), { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <AppShell>
      <Page eyebrow={r0.eyebrow} title={r0.title} subtitle={r0.subtitle} width="max-w-6xl">
        {!chartData ? (
          <NoChart />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div>
              {savedReports.length === 0 ? (
                <div className="card p-6 text-center">
                  <BookOpen className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
                  <p className="mt-3 font-semibold">{r0.empty}</p>
                  <p className="mt-1 text-sm text-muted">{r0.emptySub}</p>
                  <button type="button" className="btn-primary mt-4" onClick={() => setCurrentPage('dashboard')}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    {r0.start}
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {savedReports.map((r, i) => {
                    const active = selected === r;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          aria-current={active ? 'true' : undefined}
                          className={`w-full rounded-2xl border p-4 text-left transition-colors ${active ? 'border-accent/50 bg-accent-soft/60' : 'border-line bg-panel/80 hover:bg-panel-2'}`}
                        >
                          <span className="flex items-center justify-between text-xs text-muted">
                            <span className="font-semibold text-accent">{guide(r.mode).name}</span>
                            <span>{dateOf(r)}</span>
                          </span>
                          <span className="mt-1.5 line-clamp-2 block text-sm">
                            {typeof r.content === 'string' ? r.content : r0.chartReading}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              {selected ? (
                <article className="card p-6">
                  <p className="eyebrow">{guide(selected.mode).name} · {dateOf(selected)}</p>
                  <div className="prose-answer mt-4 whitespace-pre-wrap">{selected.content}</div>
                </article>
              ) : (
                <div className="space-y-6">
                  <div className="card mx-auto max-w-[520px] p-4">
                    <NorthIndianChart chartData={chartData} title={r0.chartTitle} />
                  </div>
                  <PlanetaryTable planetaryData={chartData.planets} />
                </div>
              )}
            </div>
          </div>
        )}
      </Page>
    </AppShell>
  );
}
