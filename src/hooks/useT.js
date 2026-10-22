import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { contentFor } from '../content/index.js';
import { DEFAULT_LOCALE, localeInfo } from '../content/locales.js';
import { ordinal } from '../lib/ordinal.js';
import { guideFor } from '../lib/guides.js';

// Fill `{name}` placeholders: f('Hi {name}', { name: 'Asha' }).
export const fill = (template, vars = {}) =>
  String(template ?? '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? vars[k] === 0 ? String(vars[k]) : m));

// App text and astrology names in the chosen language.
export function makeT(code) {
  const c = contentFor(code);
  const a = c.app;
  const n = a.names;
  const dateLocale = localeInfo(code).hreflang;
  const english = code === DEFAULT_LOCALE;
  const guideText = c.ui.home.guides.items;

  return {
    t: a,
    f: fill,
    code,
    dateLocale,
    planet: (name) => n.planets[name] || name,
    // Short planet label for chart cells; Devanagari by default.
    abbr: (p) => n.abbr?.[p.name] || p.sanskritAbbr || p.abbr,
    sign: (name) => n.signs[name] || name,
    nak: (name) => (name && n.nakshatras[name]) || name,
    dignity: (d) => n.dignity[d] || d,
    // "7th house" in English; a language-specific pattern elsewhere.
    house: (num) => (english ? `${ordinal(num)} house` : fill(n.houseN, { n: num })),
    houseInfo: (num) => n.houses[num] || null,
    signifies: (name) => n.signifies[name] || null,
    // Guide with its name, topic and placeholder in this language.
    guide: (mode) => {
      const g = guideFor(mode);
      const txt = guideText[g.mode] || {};
      return { ...g, name: txt.name || g.name, topic: txt.topic || g.topic, about: txt.about || g.about, placeholder: a.guides.placeholders[g.mode] || g.placeholder };
    },
    date: (d, opts) => {
      const date = new Date(d);
      return Number.isNaN(date.getTime()) ? String(d ?? '') : date.toLocaleDateString(dateLocale, opts);
    },
    dateTime: (d, opts) => new Date(d).toLocaleString(dateLocale, opts),
    // Guests are created as 'Seeker'; show that default in the app's language.
    personName: (user, birthProfile) => birthProfile?.fullName || (user?.name && user.name !== 'Seeker' ? user.name : a.common.seeker),
  };
}

export default function useT() {
  const { locale } = useApp();
  return useMemo(() => makeT(locale), [locale]);
}
