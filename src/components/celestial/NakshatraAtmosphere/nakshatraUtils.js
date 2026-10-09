/**
 * nakshatraUtils.js
 *
 * Safe lookups, name normalization, and client capability helpers
 * for the Nakshatra celestial atmosphere system.
 */

import { useState, useEffect } from 'react';
import { NAKSHATRA_CONSTELLATIONS, NEUTRAL_NAKSHATRA } from './nakshatraData.js';

/**
 * Common transliteration and alternate spelling aliases
 * mapping to the canonical keys in NAKSHATRA_CONSTELLATIONS.
 */
const NAKSHATRA_ALIASES = {
  // Ashwini
  asvini: 'Ashwini',
  aswini: 'Ashwini',
  ashvini: 'Ashwini',

  // Bharani
  barani: 'Bharani',

  // Krittika
  kritika: 'Krittika',
  krithika: 'Krittika',
  karthigai: 'Krittika',

  // Rohini
  rohina: 'Rohini',

  // Mrigashira
  mrigasira: 'Mrigashira',
  mrigashirsha: 'Mrigashira',
  makayiram: 'Mrigashira',

  // Ardra
  arudra: 'Ardra',
  thiruvathira: 'Ardra',

  // Punarvasu
  punarpoosam: 'Punarvasu',

  // Pushya
  pushyami: 'Pushya',
  poosam: 'Pushya',
  tiya: 'Pushya',

  // Ashlesha
  aslesha: 'Ashlesha',
  ayilyam: 'Ashlesha',

  // Magha
  makha: 'Magha',
  magham: 'Magha',

  // Purva Phalguni
  poorvaphalguni: 'Purva Phalguni',
  purvaphalguni: 'Purva Phalguni',
  'purva phalguni': 'Purva Phalguni',
  'poorva phalguni': 'Purva Phalguni',
  pubba: 'Purva Phalguni',
  pooram: 'Purva Phalguni',

  // Uttara Phalguni
  uttaraphalguni: 'Uttara Phalguni',
  'uttara phalguni': 'Uttara Phalguni',
  uthiram: 'Uttara Phalguni',

  // Hasta
  hastham: 'Hasta',
  atham: 'Hasta',

  // Chitra
  chithra: 'Chitra',
  chithirai: 'Chitra',

  // Swati
  svati: 'Swati',
  chothi: 'Swati',

  // Vishakha
  visakha: 'Vishakha',
  vishakam: 'Vishakha',

  // Anuradha
  anusham: 'Anuradha',

  // Jyeshtha
  jyeshta: 'Jyeshtha',
  kettai: 'Jyeshtha',

  // Mula
  moola: 'Mula',
  moolam: 'Mula',

  // Purva Ashadha
  poorvashada: 'Purva Ashadha',
  purvaashadha: 'Purva Ashadha',
  'purva ashadha': 'Purva Ashadha',
  'poorva ashadha': 'Purva Ashadha',
  pooradam: 'Purva Ashadha',

  // Uttara Ashadha
  uttarashada: 'Uttara Ashadha',
  uttaraashadha: 'Uttara Ashadha',
  'uttara ashadha': 'Uttara Ashadha',
  uthiradam: 'Uttara Ashadha',

  // Shravana
  shravan: 'Shravana',
  sravana: 'Shravana',
  thiruvonam: 'Shravana',

  // Dhanishta
  dhanishtha: 'Dhanishta',
  dhanishta: 'Dhanishta',
  avittam: 'Dhanishta',

  // Shatabhisha
  satabhisha: 'Shatabhisha',
  satabhishak: 'Shatabhisha',
  shatabhishak: 'Shatabhisha',
  chathayam: 'Shatabhisha',

  // Purva Bhadrapada
  poorvabhadra: 'Purva Bhadrapada',
  poorvabhadrapada: 'Purva Bhadrapada',
  purvabhadrapada: 'Purva Bhadrapada',
  'purva bhadrapada': 'Purva Bhadrapada',
  'poorva bhadrapada': 'Purva Bhadrapada',
  poorattathi: 'Purva Bhadrapada',

  // Uttara Bhadrapada
  uttarabhadra: 'Uttara Bhadrapada',
  uttarabhadrapada: 'Uttara Bhadrapada',
  'uttara bhadrapada': 'Uttara Bhadrapada',
  uthirattathi: 'Uttara Bhadrapada',

  // Revati
  revathi: 'Revati',
};

/**
 * Normalizes any string into a clean lowercase token without extra spaces or symbols.
 */
export function normalizeToken(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, '');
}

/**
 * Resolves a given Nakshatra name against canonical 27 Nakshatras.
 * Returns the exact definition from NAKSHATRA_CONSTELLATIONS or NEUTRAL_NAKSHATRA.
 * Never throws, never invents an unverified Nakshatra.
 */
export function getNakshatraData(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return NEUTRAL_NAKSHATRA;
  }

  const clean = rawName.trim();

  // 1. Exact match on canonical key
  if (NAKSHATRA_CONSTELLATIONS[clean]) {
    return NAKSHATRA_CONSTELLATIONS[clean];
  }

  // 2. Case-insensitive key match
  const directKey = Object.keys(NAKSHATRA_CONSTELLATIONS).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  if (directKey) {
    return NAKSHATRA_CONSTELLATIONS[directKey];
  }

  // 3. Normalized alias match
  const token = normalizeToken(clean);
  if (NAKSHATRA_ALIASES[token] && NAKSHATRA_CONSTELLATIONS[NAKSHATRA_ALIASES[token]]) {
    return NAKSHATRA_CONSTELLATIONS[NAKSHATRA_ALIASES[token]];
  }

  // 4. Word-boundary substring match (e.g. "Rohini (Taurus)")
  for (const canonicalKey of Object.keys(NAKSHATRA_CONSTELLATIONS)) {
    const canonicalToken = normalizeToken(canonicalKey);
    if (token.includes(canonicalToken)) {
      return NAKSHATRA_CONSTELLATIONS[canonicalKey];
    }
  }

  // Graceful fallback to peaceful neutral sky
  return NEUTRAL_NAKSHATRA;
}

/**
 * React hook to detect `prefers-reduced-motion: reduce`.
 * Safe during SSR and dynamic user system setting changes.
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event) => setPrefersReducedMotion(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  return prefersReducedMotion;
}
