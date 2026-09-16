import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import BottomNav from '../components/layout/BottomNav.jsx';
import NorthIndianChart from '../components/chart/NorthIndianChart.jsx';
import PlanetaryTable from '../components/chart/PlanetaryTable.jsx';
import DashaTimeline from '../components/chart/DashaTimeline.jsx';
import { t } from '../lib/i18n.js';
import './AnalysisPage.css';

export default function AnalysisPage() {
  const { chartData, savedReports, setCurrentMode, setCurrentPage } = useApp();
  const [selectedReport, setSelectedReport] = useState(null);

  if (!chartData) return null;

  return (
    <div className="analysis-page-wrapper">
      <TopBar />

      <main className="analysis-main">
        <div className="app-container">

          {/* Header */}
          <section className="analysis-hero-card">
            <span className="font-label-sm text-secondary uppercase font-semibold">शास्त्रीय विश्लेषण एवं अहवाल</span>
            <h1 className="font-headline-xl text-ivory">Reports & Shastric Folios</h1>
            <p className="font-editorial-italic text-ivory-muted">
              Deep analytical syntheses generated across Lagna, Navamsha, and active Dasha cycles.
            </p>
          </section>

          {/* Content Grid */}
          <div className="analysis-layout-grid">
            <div className="reports-list-col">
              <div className="section-title-box">
                <span className="font-title-md text-on-surface font-semibold">Saved Reports (संरक्षित रिपोर्ट्स)</span>
              </div>

              {savedReports.length === 0 ? (
                <div className="empty-reports-card text-center">
                  <span className="material-symbols-outlined empty-icon">menu_book</span>
                  <p className="font-editorial-italic text-on-surface-variant">No saved reports yet.</p>
                  <p className="font-body-sm text-outline">Inquire with the Jyotish Oracle to generate personalized reports.</p>
                  <button className="btn-submit font-title-md mt-space-md" onClick={() => setCurrentPage('ask')}>
                    <span>Start Consultation</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              ) : (
                <div className="reports-cards-list">
                  {savedReports.map((r, idx) => (
                    <div
                      key={idx}
                      className={`report-item-card ${selectedReport === r ? 'report-item-active' : ''}`}
                      onClick={() => setSelectedReport(r)}
                    >
                      <div className="report-item-top">
                        <span className="report-mode-tag">{r.mode?.toUpperCase() || 'GENERAL'}</span>
                        <span className="report-date">{new Date(r.timestamp || Date.now()).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="report-snippet font-body-sm">
                        {typeof r.content === 'string' ? r.content.slice(0, 100) + '...' : 'Astrological interpretation'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="report-detail-col">
              {selectedReport ? (
                <div className="report-folio-view">
                  <div className="folio-header">
                    <span className="font-label-sm text-secondary uppercase font-semibold">Inscribed Shastric Folio</span>
                    <h3 className="font-headline-sm text-on-surface">{selectedReport.mode?.toUpperCase()} ANALYSIS</h3>
                  </div>
                  <div className="folio-body font-body-md" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReport.content}
                  </div>
                </div>
              ) : (
                <div className="reports-overview-box">
                  <NorthIndianChart chartData={chartData} compact={true} title="Natal Lagna (D1) Reference" />
                  <PlanetaryTable planetaryData={chartData.planets} />
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
