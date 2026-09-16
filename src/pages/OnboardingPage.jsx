import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useTokens } from '../context/TokenContext.jsx';
import { autocompleteCities } from '../lib/geocoding.js';
import TopBar from '../components/layout/TopBar.jsx';
import { springTransition, gentleSpring, buttonPress } from '../lib/motion.js';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const { generateNewChart, setCurrentPage, navigateWithCurtain, isGenerating, generateError } = useApp();
  const { deduct } = useTokens();

  const [form, setForm] = useState({
    fullName: '', dob: '', birthTime: '', birthplace: ''
  });
  const [cityResults, setCityResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearching, setCitySearching] = useState(false);
  // Directly start on the details form, removing the interstitial welcome card
  const [step, setStep] = useState('details'); // details | generating | intro
  const [localError, setLocalError] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
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
    }, 450);
  };

  const selectCity = (c) => {
    setSelectedCity(c);
    set('birthplace', c.label.split(',')[0]);
    setCityResults([]);
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.dob) return 'Please select your date of birth.';
    if (!form.birthTime) return 'Please enter your exact birth time.';
    if (!form.birthplace.trim()) return 'Please select your birth location.';
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
      const res = await generateNewChart(profile);
      setGeneratedResult(res);
      setStep('intro');
    } catch (e) {
      setStep('details');
      setLocalError(e.message || 'Chart calculation failed. Please check birth coordinates.');
    }
  };

  return (
    <div className="onboarding-page-wrapper">
      <TopBar />

      <main className="onboarding-main">
        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div
              key="details"
              className="ob-form-card"
              initial={{ opacity: 0, scale: 0.98, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={springTransition}
            >
              <div className="ob-header">
                <span className="font-label-sm text-secondary uppercase tracking-wider font-semibold">जन्म विवरण · Birth Details</span>
                <h1 className="font-headline-lg text-on-surface mt-1">Enter Birth Details</h1>
                <p className="font-body-md text-on-surface-variant mt-1">
                  Enter your exact birth time and location to calculate your Vedic birth chart (Janam Kundli).
                </p>
              </div>

              <div className="ob-form">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label font-label-sm">Full Name (नाम)</label>
                  <div className="input-frame">
                    <User className="input-icon w-4 h-4 text-on-surface-variant" />
                    <input
                      className="form-input"
                      type="text"
                      value={form.fullName}
                      onChange={e => set('fullName', e.target.value)}
                      placeholder="e.g. Tushar Sharma"
                    />
                  </div>
                </div>

                {/* DOB & TOB in 2 Columns */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label font-label-sm">Date of Birth (जन्म तिथि)</label>
                    <div className="input-frame">
                      <Calendar className="input-icon w-4 h-4 text-on-surface-variant" />
                      <input
                        className="form-input"
                        type="date"
                        value={form.dob}
                        onChange={e => set('dob', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label font-label-sm">Time of Birth (जन्म समय)</label>
                    <div className="input-frame">
                      <Clock className="input-icon w-4 h-4 text-on-surface-variant" />
                      <input
                        className="form-input"
                        type="time"
                        value={form.birthTime}
                        onChange={e => set('birthTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Birth Location Autocomplete */}
                <div className="form-group relative">
                  <label className="form-label font-label-sm">Place of Birth (जन्म स्थान)</label>
                  <div className="input-frame">
                    <MapPin className="input-icon w-4 h-4 text-on-surface-variant" />
                    <input
                      className="form-input"
                      type="text"
                      value={form.birthplace}
                      onChange={e => handleCityChange(e.target.value)}
                      placeholder="e.g. New Delhi, India"
                      autoComplete="off"
                    />
                    {citySearching && <Loader2 className="input-icon w-4 h-4 text-primary animate-spin" />}
                  </div>

                  {cityResults.length > 0 && (
                    <div className="city-results-dropdown">
                      {cityResults.map(c => (
                        <button key={c.displayName} className="city-option-item" onClick={() => selectCity(c)}>
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Errors */}
                {(localError || generateError) && (
                  <div className="auth-error-box font-body-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-error shrink-0" />
                    <span>{localError || generateError}</span>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  className="btn-submit font-title-md mt-space-md"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  {...buttonPress}
                >
                  <span>Calculate Janam Kundli</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              className="generating-card text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={gentleSpring}
            >
              <div className="mantra-circle floating">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="font-headline-lg text-primary mt-space-sm">Calculating Your Kundli…</h2>
              <p className="font-editorial-italic text-on-surface-variant mt-space-2xs">
                Computing sidereal planetary positions, Bhavas, and Vimshottari Dasha…
              </p>
              <div className="gen-steps-list mt-space-lg">
                {[
                  'Resolving geographic coordinates & elevation',
                  'Calculating sidereal planetary longitudes (Lahiri)',
                  'Structuring 12 Bhavas and Nakshatras',
                  'Preparing your birth chart'
                ].map((s) => (
                  <div key={s} className="gen-step-item">
                    <span className="gen-dot"></span>
                    <span className="font-body-sm text-on-surface">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'intro' && (
            <motion.div
              key="intro"
              className="intro-card text-center"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={springTransition}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="font-label-sm text-secondary uppercase tracking-widest font-semibold block">॥ कुण्डली सम्पूर्णम् ॥</span>
              <h2 className="font-headline-lg text-on-surface mt-space-2xs">
                Namaste, {form.fullName.split(' ')[0]}
              </h2>
              <p className="font-editorial-italic text-on-surface-variant mt-space-xs max-w-md mx-auto">
                Your Janam Kundli has been calculated from your exact birth coordinates.
              </p>

              <div className="intro-editorial-coords mt-space-md">
                <div className="coord-item">
                  <span className="font-label-sm text-on-surface-variant">Lagna (लग्न)</span>
                  <span className="font-headline-sm text-primary font-bold">{generatedResult?.chart?.lagna?.sign || 'Calculated'}</span>
                </div>
                <div className="coord-divider">·</div>
                <div className="coord-item">
                  <span className="font-label-sm text-on-surface-variant">Chandra (चन्द्र)</span>
                  <span className="font-headline-sm text-secondary font-bold">{generatedResult?.chart?.planets?.find(p => p.name === 'Moon')?.sign || 'Calculated'}</span>
                </div>
                <div className="coord-divider">·</div>
                <div className="coord-item">
                  <span className="font-label-sm text-on-surface-variant">Nakshatra (नक्षत्र)</span>
                  <span className="font-headline-sm text-on-surface font-bold">{generatedResult?.chart?.nakshatra?.name || 'Calculated'}</span>
                </div>
              </div>

              <motion.button
                className="btn-submit font-title-md mt-space-xl"
                onClick={() => navigateWithCurtain('dashboard')}
                {...buttonPress}
              >
                <span>Open Janam Kundli</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
