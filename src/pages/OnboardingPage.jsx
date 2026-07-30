import React, { useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { autocompleteCities } from '../lib/geocoding.js';
import CosmicBackground from '../components/layout/CosmicBackground.jsx';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const { generateNewChart, setCurrentPage, isGenerating, generateError } = useApp();
  const { deduct } = useTokens();

  const [form, setForm] = useState({
    fullName: '', dob: '', birthTime: '', birthplace: ''
  });
  const [cityResults, setCityResults]   = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearching, setCitySearching] = useState(false);
  const [step, setStep] = useState('form'); // form | generating | done
  const [localError, setLocalError] = useState('');
  const debounceRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCityChange = (val) => {
    set('birthplace', val);
    setSelectedCity(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (val.length < 2) { setCityResults([]); return; }
      setCitySearching(true);
      const results = await autocompleteCities(val);
      setCityResults(results);
      setCitySearching(false);
    }, 500);
  };

  const selectCity = (c) => {
    setSelectedCity(c);
    set('birthplace', c.label.split(',')[0]);
    setCityResults([]);
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.dob) return 'Please select your date of birth.';
    if (!form.birthTime) return 'Please enter your birth time.';
    if (!form.birthplace.trim()) return 'Please enter your birth city.';
    return null;
  };

  const handleGenerate = async () => {
    const err = validate();
    if (err) { setLocalError(err); return; }
    setLocalError('');
    setStep('generating');

    try {
      deduct('generate_chart', 'Generate natal chart');
      const profile = {
        fullName: form.fullName,
        dob: form.dob,
        birthTime: form.birthTime,
        birthplace: form.birthplace,
        lat: selectedCity?.lat,
        lon: selectedCity?.lon,
      };
      await generateNewChart(profile);
      setStep('done');
      setTimeout(() => setCurrentPage('dashboard'), 1200);
    } catch (e) {
      setStep('form');
      setLocalError(e.message || 'Chart generation failed. Please check your inputs.');
    }
  };

  if (step === 'generating' || step === 'done') {
    return (
      <div className="onboarding-page">
        <CosmicBackground intensity="dense" />
        <div className="generating-screen fade-in">
          <div className="gen-orb">
            <div className="gen-ring gen-ring-1" />
            <div className="gen-ring gen-ring-2" />
            <div className="gen-ring gen-ring-3" />
            <span className="material-symbols-outlined icon-filled gen-icon">
              {step === 'done' ? 'check_circle' : 'brightness_7'}
            </span>
          </div>
          <h2 className="headline-md text-primary">
            {step === 'done' ? 'Chart Generated!' : 'Reading the Stars…'}
          </h2>
          <p className="body-md text-muted">
            {step === 'done'
              ? 'Your natal chart is ready. Opening your dashboard…'
              : 'Calculating planetary positions, nakshatras, and dashas…'}
          </p>
          {step === 'generating' && (
            <div className="gen-steps">
              {['Geocoding birthplace', 'Calculating planets', 'Computing nakshatras', 'Analysing dashas'].map((s, i) => (
                <div key={s} className="gen-step" style={{ animationDelay: `${i * 0.4}s` }}>
                  <div className="gen-step-dot" />
                  <span className="label-sm text-muted">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <CosmicBackground />

      <main className="onboarding-main fade-in">
        {/* Header */}
        <header className="onboarding-header">
          <div className="ob-logo floating">
            <span className="material-symbols-outlined icon-filled">auto_awesome</span>
          </div>
          <h1 className="headline-lg text-primary">Aetheric Jyotish</h1>
          <p className="body-md text-muted italic">Your Destiny in the Stars</p>
        </header>

        {/* Form Card */}
        <section className="ob-card glass-strong">
          <div className="ob-card-header">
            <h2 className="title-md text-on-surface">Enter Your Birth Details</h2>
            <p className="body-md text-muted">Precise details yield more accurate insights</p>
          </div>

          <div className="ob-form">
            {/* Full Name */}
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-wrapper">
                <input
                  className="stellar-input"
                  type="text"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Arjun Sharma"
                />
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>

            {/* Birth Date */}
            <div className="input-group">
              <label className="input-label">Date of Birth</label>
              <div className="input-wrapper">
                <input
                  className="stellar-input"
                  type="date"
                  value={form.dob}
                  onChange={e => set('dob', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
            </div>

            {/* Time & City in grid */}
            <div className="ob-grid-2">
              <div className="input-group">
                <label className="input-label">Birth Time</label>
                <div className="input-wrapper">
                  <input
                    className="stellar-input"
                    type="time"
                    value={form.birthTime}
                    onChange={e => set('birthTime', e.target.value)}
                  />
                  <span className="material-symbols-outlined">schedule</span>
                </div>
              </div>
              <div className="input-group" style={{ position: 'relative' }}>
                <label className="input-label">Birth City</label>
                <div className="input-wrapper">
                  <input
                    className="stellar-input"
                    type="text"
                    value={form.birthplace}
                    onChange={e => handleCityChange(e.target.value)}
                    placeholder="New Delhi"
                    autoComplete="off"
                  />
                  <span className={`material-symbols-outlined ${citySearching ? 'spin-slow' : ''}`}>
                    {citySearching ? 'progress_activity' : 'location_on'}
                  </span>
                </div>
                {cityResults.length > 0 && (
                  <div className="city-dropdown">
                    {cityResults.map(c => (
                      <button key={c.displayName} className="city-option" onClick={() => selectCity(c)}>
                        <span className="material-symbols-outlined">location_on</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCity && (
                  <div className="city-confirmed">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="label-sm">Lat: {selectedCity.lat.toFixed(3)}, Lon: {selectedCity.lon.toFixed(3)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {(localError || generateError) && (
              <div className="ob-error">
                <span className="material-symbols-outlined">error</span>
                {localError || generateError}
              </div>
            )}

            {/* CTA */}
            <button
              className="btn btn-primary btn-lg generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <span>Generate My Chart</span>
              <span className="material-symbols-outlined icon-filled">drive_file_rename</span>
            </button>
          </div>
        </section>

        <footer className="ob-footer label-sm text-muted">
          By entering your data, you initiate a technical deep-scan of the celestial alignment at your moment of origin.
        </footer>
      </main>
    </div>
  );
}
