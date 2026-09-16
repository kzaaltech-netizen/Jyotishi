// ─── Vedic Astrology Constants ──────────────────────────────────────────────────

export const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export const PLANET_KEYS = {
  Sun: 'sun', Moon: 'moon', Mars: 'mars', Mercury: 'mercury',
  Jupiter: 'jupiter', Venus: 'venus', Saturn: 'saturn', Rahu: 'rahu', Ketu: 'ketu'
};

export const PLANET_ABBR = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke'
};

export const PLANET_COLORS = {
  Sun: '#f2ca50', Moon: '#ffffff', Mars: '#ff7b7b', Mercury: '#00e4f2',
  Jupiter: '#ffd700', Venus: '#d8b9ff', Saturn: '#a0a0b0', Rahu: '#8b5cf6', Ketu: '#f97316'
};

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
export const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const SIGN_LORDS = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

export const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', years: 7 },
  { name: 'Bharani', lord: 'Venus', deity: 'Yama', years: 20 },
  { name: 'Krittika', lord: 'Sun', deity: 'Agni', years: 6 },
  { name: 'Rohini', lord: 'Moon', deity: 'Brahma', years: 10 },
  { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', years: 7 },
  { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', years: 18 },
  { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', years: 16 },
  { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', years: 19 },
  { name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', years: 17 },
  { name: 'Magha', lord: 'Ketu', deity: 'Pitras', years: 7 },
  { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', years: 20 },
  { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', years: 6 },
  { name: 'Hasta', lord: 'Moon', deity: 'Savitar', years: 10 },
  { name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma', years: 7 },
  { name: 'Swati', lord: 'Rahu', deity: 'Vayu', years: 18 },
  { name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni', years: 16 },
  { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', years: 19 },
  { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', years: 17 },
  { name: 'Mula', lord: 'Ketu', deity: 'Nirriti', years: 7 },
  { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', years: 20 },
  { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas', years: 6 },
  { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', years: 10 },
  { name: 'Dhanishtha', lord: 'Mars', deity: 'Ashta Vasus', years: 7 },
  { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', years: 18 },
  { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Ajaikapada', years: 16 },
  { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', years: 19 },
  { name: 'Revati', lord: 'Mercury', deity: 'Pushan', years: 17 },
];

export const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
export const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
export const DASHA_TOTAL = 120;

export const EXALTATION = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
export const DEBILITATION = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
export const OWN_SIGN = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10]
};
