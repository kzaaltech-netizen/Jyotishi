/**
 * nakshatraData.js
 *
 * Vector geometries, star hierarchies, and astronomical metadata for all 27 classical
 * Vedic Nakshatras + Sacred Neutral Fallback.
 * Coordinate canvas: 960 x 620 (centered at 480, 290).
 * Expanded scale (1.8x – 2.4x) designed so constellation branches intentionally spread
 * around the sides, above the heading, and below the input area.
 */

import { NAKSHATRA_MOTION_PROFILES, NEUTRAL_MOTION_PROFILE } from './nakshatraMotionProfiles.js';

export const NAKSHATRA_CONSTELLATIONS = {
  PurvaPhalguni: {
    name: 'Purva Phalguni',
    devanagari: 'पूर्वा फाल्गुनी · PURVA PHALGUNI',
    coordsLabel: "13°20' - 26°40' SIMHA (LEO) · THE CELESTIAL COUCH",
    alphaStar: {
      x: 350,
      y: 135,
      name: 'δ LEONIS (ZOSMA)',
      desc: "UPPER CELESTIAL PILLAR · 17°10' LEO",
    },
    stars: [
      { x: 480, y: 115, r: 5.5, halo: 15, core: 2.8, type: 'bright', sparkle: true, label: 'Apex Crown' },
      { x: 210, y: 210, r: 5.0, halo: 14, core: 2.6, type: 'bright', delayed: true, label: 'Theta Leonis' },
      { x: 680, y: 215, r: 5.4, halo: 15, core: 2.8, type: 'bright', label: 'Chertan' },
      { x: 260, y: 420, r: 4.5, halo: 12, core: 2.4, type: 'secondary', label: '72 Leonis' },
      { x: 740, y: 440, r: 4.8, halo: 13, core: 2.5, type: 'secondary', delayed: true, label: '84 Leonis' },
      { x: 480, y: 490, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'Lower Base' },
    ],
    path: 'M 480 115 L 210 210 L 260 420 L 480 490 L 740 440 L 680 215 Z M 480 115 L 350 135 L 680 215 M 210 210 L 350 135 L 260 420',
    harmonics: [
      { x1: 350, y1: 135, x2: 740, y2: 440 },
      { x1: 350, y1: 135, x2: 480, y2: 490 },
      { x1: 210, y1: 210, x2: 680, y2: 215 },
      { x1: 260, y1: 420, x2: 740, y2: 440 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.PurvaPhalguni,
  },

  Ashlesha: {
    name: 'Ashlesha',
    devanagari: 'आश्लेषा · ASHLESHA',
    coordsLabel: "16°40' - 30°00' KARKA (CANCER) · THE SERPENT EMBER",
    alphaStar: {
      x: 450,
      y: 270,
      name: 'α HYDRAE (COR HYDRAE)',
      desc: "THE SERPENT'S EYE · 28°20' CANCER",
    },
    stars: [
      { x: 220, y: 280, r: 4.8, halo: 13, core: 2.4, type: 'secondary', label: 'Tail Star' },
      { x: 310, y: 190, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Coil Arch' },
      { x: 440, y: 140, r: 5.8, halo: 15, core: 3.0, type: 'bright', label: 'Epsilon Hydrae' },
      { x: 610, y: 170, r: 6.0, halo: 16, core: 3.2, type: 'primary', sparkle: true, delayed: true, label: 'Delta Hydrae' },
      { x: 740, y: 260, r: 5.5, halo: 14, core: 2.8, type: 'bright', label: 'Sigma Hydrae' },
      { x: 680, y: 390, r: 4.8, halo: 13, core: 2.5, type: 'secondary', delayed: true, label: 'Eta Hydrae' },
      { x: 550, y: 440, r: 4.6, halo: 12, core: 2.4, type: 'secondary', label: 'Lower Body' },
      { x: 400, y: 410, r: 4.4, halo: 11, core: 2.2, type: 'dim', delayed: true, label: 'Inner Coil' },
      { x: 330, y: 320, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Under-Chest' },
    ],
    path: 'M 220 280 L 310 190 L 440 140 L 610 170 L 740 260 L 680 390 L 550 440 L 400 410 L 330 320 L 450 270 L 610 170',
    harmonics: [
      { x1: 310, y1: 190, x2: 450, y2: 270 },
      { x1: 440, y1: 140, x2: 450, y2: 270 },
      { x1: 550, y1: 440, x2: 450, y2: 270 },
      { x1: 330, y1: 320, x2: 220, y2: 280 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Ashlesha,
  },

  Ashwini: {
    name: 'Ashwini',
    devanagari: 'अश्विनी · ASHWINI',
    coordsLabel: "00°00' - 13°20' MESHA (ARIES) · THE STAR OF TRANSPORT",
    alphaStar: {
      x: 480,
      y: 190,
      name: 'α ARIETIS (HAMAL)',
      desc: "THE RAM'S HEAD · 07°40' ARIES",
    },
    stars: [
      { x: 480, y: 190, r: 6.0, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Hamal' },
      { x: 340, y: 260, r: 5.2, halo: 14, core: 2.7, type: 'bright', delayed: true, label: 'Sheratan' },
      { x: 620, y: 250, r: 5.0, halo: 13, core: 2.6, type: 'bright', label: 'Mesarthim' },
      { x: 230, y: 410, r: 4.4, halo: 12, core: 2.2, type: 'secondary', delayed: true, label: '41 Arietis' },
      { x: 730, y: 390, r: 4.2, halo: 11, core: 2.1, type: 'secondary', label: '39 Arietis' },
      { x: 480, y: 480, r: 3.8, halo: 10, core: 1.9, type: 'dim', label: 'Pillar' },
    ],
    path: 'M 230 410 L 340 260 L 480 190 L 620 250 L 730 390 M 480 190 L 480 480',
    harmonics: [
      { x1: 340, y1: 260, x2: 620, y2: 250 },
      { x1: 480, y1: 190, x2: 230, y2: 410 },
      { x1: 480, y1: 190, x2: 730, y2: 390 },
      { x1: 230, y1: 410, x2: 730, y2: 390 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Ashwini,
  },

  Bharani: {
    name: 'Bharani',
    devanagari: 'भरणी · BHARANI',
    coordsLabel: "13°20' - 26°40' MESHA (ARIES) · THE BEARER OF LIFE",
    alphaStar: {
      x: 480,
      y: 160,
      name: '41 ARIETIS (BHARANI)',
      desc: "SACRED CELESTIAL YONI · 20°10' ARIES",
    },
    stars: [
      { x: 480, y: 160, r: 6.0, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: '41 Arietis' },
      { x: 280, y: 340, r: 5.2, halo: 14, core: 2.7, type: 'bright', delayed: true, label: '39 Arietis' },
      { x: 680, y: 340, r: 5.0, halo: 14, core: 2.6, type: 'bright', label: '35 Arietis' },
      { x: 480, y: 470, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Zeta Arietis' },
      { x: 200, y: 260, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'West Wing' },
      { x: 760, y: 260, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'East Wing' },
    ],
    path: 'M 480 160 L 280 340 L 480 470 L 680 340 Z M 200 260 L 280 340 M 760 260 L 680 340',
    harmonics: [
      { x1: 280, y1: 340, x2: 680, y2: 340 },
      { x1: 480, y1: 160, x2: 480, y2: 470 },
      { x1: 200, y1: 260, x2: 760, y2: 260 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Bharani,
  },

  Krittika: {
    name: 'Krittika',
    devanagari: 'कृत्तिका · KRITTIKA',
    coordsLabel: "26°40' MESHA - 10°00' VRISHABHA · THE CUTTER'S FIRE",
    alphaStar: {
      x: 480,
      y: 160,
      name: 'η TAURI (ALCYONE)',
      desc: "HEART OF THE PLEIADES · 00°00' TAURUS",
    },
    stars: [
      { x: 480, y: 160, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Alcyone' },
      { x: 350, y: 220, r: 5.0, halo: 13, core: 2.6, type: 'bright', delayed: true, label: 'Maia' },
      { x: 610, y: 220, r: 4.8, halo: 13, core: 2.5, type: 'bright', label: 'Electra' },
      { x: 270, y: 330, r: 4.5, halo: 12, core: 2.3, type: 'secondary', delayed: true, label: 'Taygeta' },
      { x: 690, y: 330, r: 4.5, halo: 12, core: 2.3, type: 'secondary', label: 'Merope' },
      { x: 210, y: 440, r: 4.0, halo: 10, core: 2.0, type: 'dim', delayed: true, label: 'Celaeno' },
      { x: 750, y: 430, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'Atlas' },
    ],
    path: 'M 210 440 L 270 330 L 350 220 L 480 160 L 610 220 L 690 330 L 750 430',
    harmonics: [
      { x1: 350, y1: 220, x2: 610, y2: 220 },
      { x1: 270, y1: 330, x2: 690, y2: 330 },
      { x1: 210, y1: 440, x2: 750, y2: 430 },
      { x1: 480, y1: 160, x2: 480, y2: 380 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Krittika,
  },

  Rohini: {
    name: 'Rohini',
    devanagari: 'रोहिणी · ROHINI',
    coordsLabel: "10°00' - 23°20' VRISHABHA (TAURUS) · THE RED LUMINARY",
    alphaStar: {
      x: 480,
      y: 170,
      name: 'α TAURI (ALDEBARAN)',
      desc: "EYE OF THE BULL · 15°40' TAURUS",
    },
    stars: [
      { x: 480, y: 170, r: 6.5, halo: 18, core: 3.5, type: 'primary', sparkle: true, label: 'Aldebaran' },
      { x: 320, y: 260, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Ain' },
      { x: 640, y: 260, r: 5.4, halo: 14, core: 2.8, type: 'bright', label: 'Hyadum I' },
      { x: 240, y: 420, r: 4.8, halo: 13, core: 2.5, type: 'secondary', delayed: true, label: 'Gamma Tauri' },
      { x: 720, y: 420, r: 4.8, halo: 13, core: 2.5, type: 'secondary', label: 'Delta Tauri' },
      { x: 480, y: 490, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Theta Tauri' },
    ],
    path: 'M 240 420 L 320 260 L 480 170 L 640 260 L 720 420 L 480 490 Z',
    harmonics: [
      { x1: 320, y1: 260, x2: 640, y2: 260 },
      { x1: 480, y1: 170, x2: 480, y2: 490 },
      { x1: 240, y1: 420, x2: 720, y2: 420 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Rohini,
  },

  Mrigashira: {
    name: 'Mrigashira',
    devanagari: 'मृगशीर्षा · MRIGASHIRA',
    coordsLabel: "23°20' VRISHABHA - 06°40' MITHUNA · THE DEER'S HEAD",
    alphaStar: {
      x: 480,
      y: 140,
      name: 'λ ORIONIS (MEISSA)',
      desc: "THE CROWN OF ORION · 02°10' GEMINI",
    },
    stars: [
      { x: 480, y: 140, r: 6.0, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Meissa' },
      { x: 340, y: 260, r: 5.0, halo: 13, core: 2.6, type: 'bright', delayed: true, label: 'Phi-1' },
      { x: 620, y: 260, r: 5.0, halo: 13, core: 2.6, type: 'bright', label: 'Phi-2' },
      { x: 480, y: 420, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Lambda' },
      { x: 230, y: 360, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'Left Ear' },
      { x: 730, y: 360, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'Right Ear' },
    ],
    path: 'M 480 140 L 340 260 L 230 360 M 480 140 L 620 260 L 730 360 M 340 260 L 480 420 L 620 260',
    harmonics: [
      { x1: 340, y1: 260, x2: 620, y2: 260 },
      { x1: 480, y1: 140, x2: 480, y2: 420 },
      { x1: 230, y1: 360, x2: 730, y2: 360 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Mrigashira,
  },

  Ardra: {
    name: 'Ardra',
    devanagari: 'आर्द्रा · ARDRA',
    coordsLabel: "06°40' - 20°00' MITHUNA (GEMINI) · THE TEARDROP GEM",
    alphaStar: {
      x: 480,
      y: 250,
      name: 'α ORIONIS (BETELGEUSE)',
      desc: "THE RED SUPERGIANT · 14°20' GEMINI",
    },
    stars: [
      { x: 480, y: 250, r: 7.0, halo: 20, core: 3.8, type: 'primary', sparkle: true, label: 'Betelgeuse' },
      { x: 280, y: 150, r: 5.0, halo: 13, core: 2.6, type: 'secondary', delayed: true, label: 'Upper Left' },
      { x: 680, y: 150, r: 5.0, halo: 13, core: 2.6, type: 'secondary', label: 'Upper Right' },
      { x: 220, y: 430, r: 4.4, halo: 11, core: 2.2, type: 'dim', delayed: true, label: 'Lower Flare Left' },
      { x: 740, y: 430, r: 4.4, halo: 11, core: 2.2, type: 'dim', label: 'Lower Flare Right' },
    ],
    path: 'M 280 150 L 680 150 L 480 250 L 280 150 M 480 250 L 220 430 M 480 250 L 740 430',
    harmonics: [
      { x1: 280, y1: 150, x2: 220, y2: 430 },
      { x1: 680, y1: 150, x2: 740, y2: 430 },
      { x1: 220, y1: 430, x2: 740, y2: 430 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Ardra,
  },

  Punarvasu: {
    name: 'Punarvasu',
    devanagari: 'पुनर्वसु · PUNARVASU',
    coordsLabel: "20°00' MITHUNA - 03°20' KARKA · THE RETURN OF LIGHT",
    alphaStar: {
      x: 420,
      y: 160,
      name: 'β GEMINORUM (POLLUX)',
      desc: "TWIN LUMINARY · 29°10' GEMINI",
    },
    stars: [
      { x: 420, y: 160, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Pollux' },
      { x: 540, y: 140, r: 6.0, halo: 15, core: 3.0, type: 'bright', delayed: true, label: 'Castor' },
      { x: 250, y: 360, r: 5.0, halo: 13, core: 2.6, type: 'secondary', label: 'Alhena' },
      { x: 710, y: 340, r: 4.8, halo: 13, core: 2.5, type: 'secondary', delayed: true, label: 'Wasat' },
      { x: 480, y: 470, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Mebsuta' },
    ],
    path: 'M 540 140 L 420 160 L 250 360 L 480 470 L 710 340 L 540 140',
    harmonics: [
      { x1: 420, y1: 160, x2: 710, y2: 340 },
      { x1: 250, y1: 360, x2: 710, y2: 340 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Punarvasu,
  },

  Pushya: {
    name: 'Pushya',
    devanagari: 'पुष्य · PUSHYA',
    coordsLabel: "03°20' - 16°40' KARKA (CANCER) · THE NOURISHER",
    alphaStar: {
      x: 480,
      y: 160,
      name: 'δ CANCRI (ASELLUS AUSTRALIS)',
      desc: "HEART OF THE BLOSSOM · 14°40' CANCER",
    },
    stars: [
      { x: 480, y: 160, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Delta Cancri' },
      { x: 340, y: 270, r: 5.2, halo: 14, core: 2.7, type: 'bright', delayed: true, label: 'Gamma Cancri' },
      { x: 620, y: 270, r: 5.2, halo: 14, core: 2.7, type: 'bright', label: 'Theta Cancri' },
      { x: 480, y: 420, r: 4.8, halo: 13, core: 2.5, type: 'secondary', delayed: true, label: 'Praesepe Core' },
      { x: 220, y: 230, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Petal Left' },
      { x: 740, y: 230, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Petal Right' },
    ],
    path: 'M 480 160 L 340 270 L 480 420 L 620 270 Z M 480 160 L 480 420',
    harmonics: [
      { x1: 340, y1: 270, x2: 620, y2: 270 },
      { x1: 220, y1: 230, x2: 340, y2: 270 },
      { x1: 740, y1: 230, x2: 620, y2: 270 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Pushya,
  },

  Magha: {
    name: 'Magha',
    devanagari: 'मघा · MAGHA',
    coordsLabel: "00°00' - 13°20' SIMHA (LEO) · THE ROYAL THRONE",
    alphaStar: {
      x: 480,
      y: 420,
      name: 'α LEONIS (REGULUS)',
      desc: "HEART OF THE LION · 05°40' LEO",
    },
    stars: [
      { x: 480, y: 420, r: 6.8, halo: 18, core: 3.5, type: 'primary', sparkle: true, label: 'Regulus' },
      { x: 430, y: 310, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Eta Leonis' },
      { x: 560, y: 220, r: 5.6, halo: 14, core: 2.9, type: 'bright', label: 'Algieba' },
      { x: 510, y: 140, r: 4.8, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Adhafera' },
      { x: 370, y: 150, r: 4.6, halo: 12, core: 2.3, type: 'secondary', label: 'Ras Elased' },
      { x: 250, y: 260, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Sickle Outer' },
      { x: 720, y: 330, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Throne Base' },
    ],
    path: 'M 480 420 L 430 310 L 560 220 L 510 140 L 370 150 L 250 260 L 430 310 M 560 220 L 720 330',
    harmonics: [
      { x1: 480, y1: 420, x2: 560, y2: 220 },
      { x1: 370, y1: 150, x2: 560, y2: 220 },
      { x1: 250, y1: 260, x2: 720, y2: 330 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Magha,
  },

  UttaraPhalguni: {
    name: 'Uttara Phalguni',
    devanagari: 'उत्तरा फाल्गुनी · UTTARA PHALGUNI',
    coordsLabel: "26°40' SIMHA - 10°00' KANYA · ENDURING FRUITION",
    alphaStar: {
      x: 450,
      y: 170,
      name: 'β LEONIS (DENEBOLA)',
      desc: "THE ROYAL TAIL · 27°30' LEO",
    },
    stars: [
      { x: 450, y: 170, r: 6.4, halo: 17, core: 3.3, type: 'primary', sparkle: true, label: 'Denebola' },
      { x: 680, y: 220, r: 5.2, halo: 13, core: 2.7, type: 'bright', delayed: true, label: '93 Leonis' },
      { x: 260, y: 420, r: 4.8, halo: 12, core: 2.5, type: 'secondary', label: 'Iota Leonis' },
      { x: 710, y: 440, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Sigma Leonis' },
      { x: 320, y: 140, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'Crown' },
    ],
    path: 'M 320 140 L 450 170 L 680 220 L 710 440 L 260 420 Z',
    harmonics: [
      { x1: 450, y1: 170, x2: 710, y2: 440 },
      { x1: 680, y1: 220, x2: 260, y2: 420 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.UttaraPhalguni,
  },

  Hasta: {
    name: 'Hasta',
    devanagari: 'हस्त · HASTA',
    coordsLabel: "10°00' - 23°20' KANYA (VIRGO) · THE SOLAR HAND",
    alphaStar: {
      x: 480,
      y: 150,
      name: 'γ CORVI (GIENAH)',
      desc: "THE CROWN OF THE HAND · 15°20' VIRGO",
    },
    stars: [
      { x: 480, y: 150, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Gienah' },
      { x: 320, y: 260, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Algorab' },
      { x: 640, y: 260, r: 5.4, halo: 14, core: 2.8, type: 'bright', label: 'Kraz' },
      { x: 240, y: 430, r: 4.8, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Minkar' },
      { x: 720, y: 430, r: 4.8, halo: 12, core: 2.4, type: 'secondary', label: 'Alchiba' },
    ],
    path: 'M 480 150 L 320 260 L 240 430 L 720 430 L 640 260 Z',
    harmonics: [
      { x1: 320, y1: 260, x2: 640, y2: 260 },
      { x1: 480, y1: 150, x2: 240, y2: 430 },
      { x1: 480, y1: 150, x2: 720, y2: 430 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Hasta,
  },

  Chitra: {
    name: 'Chitra',
    devanagari: 'चित्रा · CHITRA',
    coordsLabel: "23°20' KANYA - 06°40' TULA · THE RADIANT PEARL",
    alphaStar: {
      x: 480,
      y: 260,
      name: 'α VIRGINIS (SPICA)',
      desc: "THE CELESTIAL SOLITARY JEWEL · 00°10' LIBRA",
    },
    stars: [
      { x: 480, y: 260, r: 7.2, halo: 22, core: 3.8, type: 'primary', sparkle: true, label: 'Spica' },
      { x: 320, y: 140, r: 5.0, halo: 13, core: 2.6, type: 'bright', delayed: true, label: 'Heze' },
      { x: 640, y: 140, r: 5.0, halo: 13, core: 2.6, type: 'bright', label: 'Porrima' },
      { x: 230, y: 430, r: 4.4, halo: 11, core: 2.2, type: 'dim', delayed: true, label: 'Zavijava' },
      { x: 730, y: 430, r: 4.4, halo: 11, core: 2.2, type: 'dim', label: 'Zaniah' },
    ],
    path: 'M 320 140 L 640 140 L 480 260 Z M 480 260 L 230 430 M 480 260 L 730 430',
    harmonics: [
      { x1: 320, y1: 140, x2: 230, y2: 430 },
      { x1: 640, y1: 140, x2: 730, y2: 430 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Chitra,
  },

  Swati: {
    name: 'Swati',
    devanagari: 'स्वाति · SWATI',
    coordsLabel: "06°40' - 20°00' TULA (LIBRA) · THE INDEPENDENT SPROUT",
    alphaStar: {
      x: 480,
      y: 250,
      name: 'α BOÖTIS (ARCTURUS)',
      desc: "THE AMBER GIANT · 10°20' LIBRA",
    },
    stars: [
      { x: 480, y: 250, r: 7.2, halo: 22, core: 3.8, type: 'primary', sparkle: true, label: 'Arcturus' },
      { x: 340, y: 140, r: 5.0, halo: 13, core: 2.6, type: 'secondary', delayed: true, label: 'Izar' },
      { x: 620, y: 140, r: 4.8, halo: 13, core: 2.5, type: 'secondary', label: 'Muphrid' },
      { x: 240, y: 420, r: 4.4, halo: 11, core: 2.2, type: 'dim', delayed: true, label: 'Nekkar' },
      { x: 720, y: 420, r: 4.4, halo: 11, core: 2.2, type: 'dim', label: 'Seginus' },
    ],
    path: 'M 340 140 L 620 140 L 480 250 Z M 480 250 L 240 420 M 480 250 L 720 420',
    harmonics: [
      { x1: 340, y1: 140, x2: 240, y2: 420 },
      { x1: 620, y1: 140, x2: 720, y2: 420 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Swati,
  },

  Vishakha: {
    name: 'Vishakha',
    devanagari: 'विशाखा · VISHAKHA',
    coordsLabel: "20°00' TULA - 03°20' VRISHCHIKA · TRIUMPHAL GATEWAY",
    alphaStar: {
      x: 360,
      y: 170,
      name: 'β LIBRAE (ZUBENESCHAMALI)',
      desc: "THE NORTHERN CLAW · 25°00' LIBRA",
    },
    stars: [
      { x: 360, y: 170, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Zubeneschamali' },
      { x: 600, y: 170, r: 6.0, halo: 15, core: 3.0, type: 'bright', delayed: true, label: 'Zubenelgenubi' },
      { x: 250, y: 420, r: 5.0, halo: 13, core: 2.6, type: 'secondary', label: 'Zubenelakrab' },
      { x: 710, y: 420, r: 4.8, halo: 13, core: 2.5, type: 'secondary', delayed: true, label: 'Brachium' },
      { x: 480, y: 280, r: 4.5, halo: 12, core: 2.3, type: 'dim', label: 'Keystone Arch' },
    ],
    path: 'M 250 420 L 360 170 L 480 280 L 600 170 L 710 420 Z',
    harmonics: [
      { x1: 360, y1: 170, x2: 600, y2: 170 },
      { x1: 250, y1: 420, x2: 710, y2: 420 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Vishakha,
  },

  Anuradha: {
    name: 'Anuradha',
    devanagari: 'अनुराधा · ANURADHA',
    coordsLabel: "03°20' - 16°40' VRISHCHIKA (SCORPIO) · LOTUS OF HARMONY",
    alphaStar: {
      x: 480,
      y: 150,
      name: 'δ SCORPII (DSCHUBBA)',
      desc: "FOREHEAD OF THE SCORPION · 08°30' SCORPIO",
    },
    stars: [
      { x: 480, y: 150, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Dschubba' },
      { x: 380, y: 250, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Acrab' },
      { x: 560, y: 340, r: 5.2, halo: 13, core: 2.7, type: 'bright', label: 'Fang' },
      { x: 660, y: 440, r: 4.8, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Rho Scorpii' },
      { x: 260, y: 210, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Outer Petal' },
      { x: 730, y: 270, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Right Petal' },
    ],
    path: 'M 260 210 L 480 150 L 380 250 L 560 340 L 660 440 M 560 340 L 730 270',
    harmonics: [
      { x1: 480, y1: 150, x2: 560, y2: 340 },
      { x1: 260, y1: 210, x2: 380, y2: 250 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Anuradha,
  },

  Jyeshtha: {
    name: 'Jyeshtha',
    devanagari: 'ज्येष्ठा · JYESHTHA',
    coordsLabel: "16°40' - 30°00' VRISHCHIKA (SCORPIO) · THE ELDER TALISMAN",
    alphaStar: {
      x: 480,
      y: 270,
      name: 'α SCORPII (ANTARES)',
      desc: "HEART OF THE SCORPION · 25°40' SCORPIO",
    },
    stars: [
      { x: 480, y: 270, r: 7.2, halo: 22, core: 3.8, type: 'primary', sparkle: true, label: 'Antares' },
      { x: 350, y: 170, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Alniyat' },
      { x: 610, y: 370, r: 5.4, halo: 14, core: 2.8, type: 'bright', label: 'Tau Scorpii' },
      { x: 240, y: 250, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Shield Left' },
      { x: 720, y: 310, r: 4.6, halo: 12, core: 2.4, type: 'secondary', label: 'Shield Right' },
    ],
    path: 'M 350 170 L 480 270 L 610 370 M 240 250 L 480 270 L 720 310',
    harmonics: [
      { x1: 350, y1: 170, x2: 720, y2: 310 },
      { x1: 240, y1: 250, x2: 610, y2: 370 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Jyeshtha,
  },

  Mula: {
    name: 'Mula',
    devanagari: 'मूल · MULA',
    coordsLabel: "00°00' - 13°20' DHANU (SAGITTARIUS) · THE GALACTIC ROOT",
    alphaStar: {
      x: 480,
      y: 440,
      name: 'λ SCORPII (SHAULA)',
      desc: "THE SCORPION'S STING · 00°40' SAGITTARIUS",
    },
    stars: [
      { x: 480, y: 440, r: 6.5, halo: 17, core: 3.4, type: 'primary', sparkle: true, label: 'Shaula' },
      { x: 560, y: 390, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Lesath' },
      { x: 520, y: 270, r: 5.0, halo: 13, core: 2.6, type: 'bright', label: 'Sargas' },
      { x: 400, y: 180, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Iota' },
      { x: 280, y: 240, r: 4.4, halo: 11, core: 2.2, type: 'secondary', label: 'Kappa' },
      { x: 210, y: 360, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'Galactic Root' },
    ],
    path: 'M 210 360 L 280 240 L 400 180 L 520 270 L 560 390 L 480 440',
    harmonics: [
      { x1: 480, y1: 440, x2: 520, y2: 270 },
      { x1: 280, y1: 240, x2: 520, y2: 270 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Mula,
  },

  PurvaAshadha: {
    name: 'Purva Ashadha',
    devanagari: 'पूर्वाषाढ़ा · PURVA ASHADHA',
    coordsLabel: "13°20' - 26°40' DHANU (SAGITTARIUS) · THE INVINCIBLE WATER",
    alphaStar: {
      x: 360,
      y: 170,
      name: 'ε SAGITTARII (KAUS AUSTRALIS)',
      desc: "SOUTHERN BOW · 18°20' SAGITTARIUS",
    },
    stars: [
      { x: 360, y: 170, r: 6.4, halo: 17, core: 3.3, type: 'primary', sparkle: true, label: 'Kaus Australis' },
      { x: 600, y: 200, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Kaus Media' },
      { x: 690, y: 400, r: 4.8, halo: 12, core: 2.4, type: 'secondary', label: 'Kaus Borealis' },
      { x: 270, y: 420, r: 4.8, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Eta Sagittarii' },
      { x: 480, y: 290, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Basket Core' },
    ],
    path: 'M 360 170 L 600 200 L 690 400 L 270 420 Z',
    harmonics: [
      { x1: 360, y1: 170, x2: 480, y2: 290 },
      { x1: 600, y1: 200, x2: 480, y2: 290 },
      { x1: 690, y1: 400, x2: 480, y2: 290 },
      { x1: 270, y1: 420, x2: 480, y2: 290 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.PurvaAshadha,
  },

  UttaraAshadha: {
    name: 'Uttara Ashadha',
    devanagari: 'उत्तराषाढ़ा · UTTARA ASHADHA',
    coordsLabel: "26°40' DHANU - 10°00' MAKARA · UNIVERSAL VICTORY",
    alphaStar: {
      x: 380,
      y: 160,
      name: 'σ SAGITTARII (NUNKI)',
      desc: "THE SACRED TABLET · 02°40' CAPRICORN",
    },
    stars: [
      { x: 380, y: 160, r: 6.4, halo: 17, core: 3.3, type: 'primary', sparkle: true, label: 'Nunki' },
      { x: 620, y: 210, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Ascella' },
      { x: 280, y: 420, r: 4.8, halo: 12, core: 2.5, type: 'secondary', label: 'Phi Sagittarii' },
      { x: 690, y: 450, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Tau Sagittarii' },
    ],
    path: 'M 380 160 L 620 210 L 690 450 L 280 420 Z',
    harmonics: [
      { x1: 380, y1: 160, x2: 690, y2: 450 },
      { x1: 620, y1: 210, x2: 280, y2: 420 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.UttaraAshadha,
  },

  Shravana: {
    name: 'Shravana',
    devanagari: 'श्रवण · SHRAVANA',
    coordsLabel: "10°00' - 23°20' MAKARA (CAPRICORN) · THE SACRED HEARING",
    alphaStar: {
      x: 480,
      y: 260,
      name: 'α AQUILAE (ALTAIR)',
      desc: "THE EAGLE'S EYE · 16°40' CAPRICORN",
    },
    stars: [
      { x: 480, y: 260, r: 6.8, halo: 18, core: 3.5, type: 'primary', sparkle: true, label: 'Altair' },
      { x: 370, y: 170, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Tarazed' },
      { x: 590, y: 350, r: 5.2, halo: 13, core: 2.7, type: 'bright', label: 'Alshain' },
      { x: 240, y: 430, r: 4.4, halo: 11, core: 2.2, type: 'dim', delayed: true, label: 'Left Feather' },
      { x: 720, y: 180, r: 4.4, halo: 11, core: 2.2, type: 'dim', label: 'Right Feather' },
    ],
    path: 'M 370 170 L 480 260 L 590 350 M 480 260 L 240 430 M 480 260 L 720 180',
    harmonics: [
      { x1: 370, y1: 170, x2: 720, y2: 180 },
      { x1: 240, y1: 430, x2: 590, y2: 350 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Shravana,
  },

  Dhanishta: {
    name: 'Dhanishta',
    devanagari: 'धनिष्ठा · DHANISHTA',
    coordsLabel: "23°20' MAKARA - 06°40' KUMBHA · THE COSMIC DRUM",
    alphaStar: {
      x: 480,
      y: 150,
      name: 'β DELPHINI (ROTANEV)',
      desc: "THE CROWN OF THE DIAMOND · 01°20' AQUARIUS",
    },
    stars: [
      { x: 480, y: 150, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Rotanev' },
      { x: 340, y: 260, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Sualocin' },
      { x: 620, y: 260, r: 5.4, halo: 14, core: 2.8, type: 'bright', label: 'Gamma Delphini' },
      { x: 480, y: 370, r: 5.0, halo: 13, core: 2.6, type: 'bright', delayed: true, label: 'Delta Delphini' },
      { x: 480, y: 490, r: 4.4, halo: 11, core: 2.2, type: 'secondary', label: 'Epsilon Delphini' },
      { x: 230, y: 270, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'West Resonator' },
      { x: 730, y: 270, r: 4.0, halo: 10, core: 2.0, type: 'dim', label: 'East Resonator' },
    ],
    path: 'M 480 150 L 340 260 L 480 370 L 620 260 Z M 480 370 L 480 490 M 230 270 L 340 260 M 730 270 L 620 260',
    harmonics: [
      { x1: 340, y1: 260, x2: 620, y2: 260 },
      { x1: 480, y1: 150, x2: 480, y2: 370 },
      { x1: 230, y1: 270, x2: 730, y2: 270 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Dhanishta,
  },

  Shatabhisha: {
    name: 'Shatabhisha',
    devanagari: 'शतभिषा · SHATABHISHA',
    coordsLabel: "06°40' - 20°00' KUMBHA (AQUARIUS) · HUNDRED HEALERS",
    alphaStar: {
      x: 480,
      y: 150,
      name: 'γ AQUARII (SADACHBIA)',
      desc: "LUCKY STAR OF HIDDEN THINGS · 12°40' AQUARIUS",
    },
    stars: [
      { x: 480, y: 150, r: 6.2, halo: 16, core: 3.2, type: 'primary', sparkle: true, label: 'Sadachbia' },
      { x: 310, y: 220, r: 5.0, halo: 13, core: 2.6, type: 'bright', delayed: true, label: 'Alpha' },
      { x: 650, y: 220, r: 5.0, halo: 13, core: 2.6, type: 'bright', label: 'Zeta' },
      { x: 260, y: 360, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'Pi' },
      { x: 700, y: 360, r: 4.6, halo: 12, core: 2.4, type: 'secondary', label: 'Eta' },
      { x: 350, y: 470, r: 4.2, halo: 11, core: 2.2, type: 'dim', delayed: true, label: 'Lambda' },
      { x: 610, y: 470, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Phi' },
      { x: 480, y: 300, r: 4.8, halo: 13, core: 2.5, type: 'secondary', label: 'Sacred Heart' },
    ],
    path: 'M 480 150 L 310 220 L 260 360 L 350 470 L 610 470 L 700 360 L 650 220 Z',
    harmonics: [
      { x1: 480, y1: 150, x2: 480, y2: 300 },
      { x1: 260, y1: 360, x2: 480, y2: 300 },
      { x1: 700, y1: 360, x2: 480, y2: 300 },
      { x1: 310, y1: 220, x2: 650, y2: 220 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Shatabhisha,
  },

  PurvaBhadrapada: {
    name: 'Purva Bhadrapada',
    devanagari: 'पूर्वाभाद्रपद · PURVA BHADRAPADA',
    coordsLabel: "20°00' KUMBHA - 03°20' MEENA · THE FORWARD PILLAR",
    alphaStar: {
      x: 350,
      y: 160,
      name: 'α PEGASI (MARKAB)',
      desc: "THE WINGED PILLAR · 28°20' AQUARIUS",
    },
    stars: [
      { x: 350, y: 160, r: 6.4, halo: 17, core: 3.3, type: 'primary', sparkle: true, label: 'Markab' },
      { x: 610, y: 160, r: 6.2, halo: 16, core: 3.2, type: 'bright', delayed: true, label: 'Scheat' },
      { x: 260, y: 440, r: 5.0, halo: 13, core: 2.6, type: 'secondary', label: 'Zeta Pegasi' },
      { x: 700, y: 440, r: 5.0, halo: 13, core: 2.6, type: 'secondary', delayed: true, label: 'Mu Pegasi' },
      { x: 480, y: 100, r: 4.4, halo: 11, core: 2.2, type: 'dim', label: 'Apex Wing' },
    ],
    path: 'M 480 100 L 350 160 L 610 160 Z M 350 160 L 260 440 L 700 440 L 610 160',
    harmonics: [
      { x1: 350, y1: 160, x2: 700, y2: 440 },
      { x1: 610, y1: 160, x2: 260, y2: 440 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.PurvaBhadrapada,
  },

  UttaraBhadrapada: {
    name: 'Uttara Bhadrapada',
    devanagari: 'उत्तराभाद्रपद · UTTARA BHADRAPADA',
    coordsLabel: "03°20' - 16°40' MEENA (PISCES) · THE OCEAN SERPENT",
    alphaStar: {
      x: 350,
      y: 160,
      name: 'α ANDROMEDAE (ALPHERATZ)',
      desc: "THE CROWN OF PEGASUS · 09°40' PISCES",
    },
    stars: [
      { x: 350, y: 160, r: 6.4, halo: 17, core: 3.3, type: 'primary', sparkle: true, label: 'Alpheratz' },
      { x: 610, y: 160, r: 6.2, halo: 16, core: 3.2, type: 'bright', delayed: true, label: 'Algenib' },
      { x: 260, y: 440, r: 5.0, halo: 13, core: 2.6, type: 'secondary', label: 'Gamma Piscium' },
      { x: 700, y: 440, r: 5.0, halo: 13, core: 2.6, type: 'secondary', delayed: true, label: 'Theta Piscium' },
      { x: 480, y: 100, r: 4.4, halo: 11, core: 2.2, type: 'dim', label: 'Ocean Eye' },
    ],
    path: 'M 480 100 L 350 160 L 610 160 Z M 350 160 L 260 440 L 700 440 L 610 160',
    harmonics: [
      { x1: 350, y1: 160, x2: 700, y2: 440 },
      { x1: 610, y1: 160, x2: 260, y2: 440 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.UttaraBhadrapada,
  },

  Revati: {
    name: 'Revati',
    devanagari: 'रेवती · REVATI',
    coordsLabel: "16°40' - 30°00' MEENA (PISCES) · THE WEALTHY NURTURER",
    alphaStar: {
      x: 480,
      y: 150,
      name: 'ζ PISCIUM (REVATI)',
      desc: "THE FINAL YOGATARA · 29°50' PISCES",
    },
    stars: [
      { x: 480, y: 150, r: 6.4, halo: 17, core: 3.3, type: 'primary', sparkle: true, label: 'Zeta Piscium' },
      { x: 340, y: 250, r: 5.4, halo: 14, core: 2.8, type: 'bright', delayed: true, label: 'Eta Piscium' },
      { x: 620, y: 250, r: 5.4, halo: 14, core: 2.8, type: 'bright', label: 'Epsilon' },
      { x: 250, y: 390, r: 4.8, halo: 12, core: 2.5, type: 'secondary', delayed: true, label: 'Delta' },
      { x: 710, y: 390, r: 4.8, halo: 12, core: 2.5, type: 'secondary', label: 'Omega' },
      { x: 480, y: 480, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'Knot' },
    ],
    path: 'M 480 150 L 340 250 L 250 390 L 480 480 L 710 390 L 620 250 Z',
    harmonics: [
      { x1: 340, y1: 250, x2: 620, y2: 250 },
      { x1: 480, y1: 150, x2: 480, y2: 480 },
    ],
    ...NAKSHATRA_MOTION_PROFILES.Revati,
  },
};

/**
 * NEUTRAL_NAKSHATRA
 * Graceful fallback when user has no birth data or Nakshatra is unknown.
 * Displays sacred, quiet celestial geometry. Never renders "Unknown Nakshatra".
 */
export const NEUTRAL_NAKSHATRA = {
  name: null,
  devanagari: 'वैदिक नक्षत्र मण्डल · CELESTIAL SKY',
  coordsLabel: 'SACRED JAPAMALA · SACRED CELESTIAL ARCHITECTURE',
  alphaStar: {
    x: 480,
    y: 280,
    name: 'ध्रुव तारा · DHRUVA TARA (POLARIS)',
    desc: 'THE ETERNAL CELESTIAL PIVOT',
  },
  stars: [
    { x: 480, y: 130, r: 5.2, halo: 14, core: 2.7, type: 'bright', label: 'North Node' },
    { x: 270, y: 260, r: 5.0, halo: 13, core: 2.6, type: 'bright', delayed: true, label: 'West Node' },
    { x: 690, y: 260, r: 5.0, halo: 13, core: 2.6, type: 'bright', label: 'East Node' },
    { x: 320, y: 450, r: 4.6, halo: 12, core: 2.4, type: 'secondary', delayed: true, label: 'SW Node' },
    { x: 640, y: 450, r: 4.6, halo: 12, core: 2.4, type: 'secondary', label: 'SE Node' },
    { x: 480, y: 510, r: 4.2, halo: 11, core: 2.2, type: 'dim', label: 'South Node' },
  ],
  path: 'M 480 130 L 270 260 L 320 450 L 480 510 L 640 450 L 690 260 Z',
  harmonics: [
    { x1: 270, y1: 260, x2: 690, y2: 260 },
    { x1: 480, y1: 130, x2: 480, y2: 510 },
  ],
  ...NEUTRAL_MOTION_PROFILE,
};
