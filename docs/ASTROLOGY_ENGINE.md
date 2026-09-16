# ASTROLOGY ENGINE SPECIFICATION & LICENSING AUDIT

## 1. Engine Selection: Swiss Ephemeris (v2.10.03 via `swisseph-wasm`)

`astro-ai-app` uses **Swiss Ephemeris** (compiled to WebAssembly via `swisseph-wasm` running natively inside Node.js) as its authoritative astronomical calculation engine.

### Why Swiss Ephemeris?
* **Sub-arcsecond Astronomical Precision:** Uses compressed planetary ephemerides based on NASA JPL DE431/DE440 data.
* **100% Local & Deterministic Execution:** Eliminates external HTTP API calls (e.g. VedAstro REST latency of 2s–15s and 429 rate limit failures).
* **Native Vedic/Sidereal Support:** Built-in sidereal mode (`SEFLG_SIDEREAL`) with exact Lahiri ayanamsa (`SE_SIDM_LAHIRI`).

---

## 2. Licensing Audit & Compliance Requirements

### Dual Licensing Structure of Swiss Ephemeris
Swiss Ephemeris (developed by Astrodienst AG) is dual-licensed:

1. **GNU Affero General Public License v3 (AGPL v3):**
   * Default open-source license.
   * **Implication:** If `astro-ai-app` is deployed as a network SaaS application under AGPL v3, the full application source code (including backend modifications) must be made available to all network users under AGPL v3.

2. **Swiss Ephemeris Professional Commercial License (Astrodienst AG):**
   * Required if `astro-ai-app` is commercialized as a proprietary, closed-source SaaS application or mobile app without releasing source code under AGPL v3.
   * **Commercial Action Item:** Before public SaaS launch under a proprietary model, a commercial license must be purchased from Astrodienst AG (see [https://www.astro.com/swisseph/swephinfo_e.htm](https://www.astro.com/swisseph/swephinfo_e.htm)).

---

## 3. Canonical Vedic Calculation Settings

All astronomical calculations in `astro-ai-app` strictly enforce the following Vedic parameters:

| Parameter | Configuration | Value / Mode | Description |
| :--- | :--- | :--- | :--- |
| **Zodiac** | Sidereal (`SEFLG_SIDEREAL`) | `65536` | Nirayana (fixed star) zodiac relative to initial point of Aries. |
| **Ayanamsa** | Lahiri (`SE_SIDM_LAHIRI`) | `1` | Chitra Paksha Ayanamsa (default standard for Indian Vedic astrology). |
| **Lunar Nodes** | Mean Rahu/Ketu (`SE_MEAN_NODE`) | `10` | Mean node position (Ketu = Rahu + 180°). True node option configurable. |
| **House System** | Whole Sign (`W`) | Equal Sign | 1st House is the entire sign occupied by the Ascendant (Lagna); 2nd House is next sign, etc. |
| **Coordinate System** | Geocentric Lat/Lon | Topocentric optional | Latitude & Longitude in degrees with timezone offset conversion to UTC. |
| **Ephemeris Flags** | `SEFLG_SIDEREAL \| SEFLG_SPEED` | Sidereal + Speed | Computes sidereal longitudes and direct/retrograde speeds (deg/day). |

---

## 4. Architecture & Domain Structure

```text
server/src/astrology/
├── swissEphemeris.js         # WASM lifecycle & raw calculation wrapper
├── vedic/
│   ├── signs.js               # Canonical sign normalization (index 0..11, name, abbr, deg)
│   ├── nakshatra.js           # 27 Nakshatras & Pada calculations
│   ├── houses.js              # Whole Sign house placement & lord determination
│   ├── dasha.js               # 120-year Vimshottari Mahadasha & Antardasha engine
│   ├── divisionalCharts.js    # D1 (Natal), D9 (Navamsha), D10 (Dashamsha) builders
│   ├── transits.js            # Daily transit calculation primitives
│   └── panchangPrimitives.js  # Astronomical primitives for Tithi, Nakshatra, Yoga, Karana
├── constants/
│   └── astrologyConstants.js  # Zodiac signs, Nakshatra table, Dasha order, Planet lords
├── validators/
│   └── inputValidator.js      # Strict DOB, TOB, Lat, Lon, Timezone validation
├── tests/
│   └── referenceCharts.test.js# Automated reference chart test suite
├── astrology.service.js       # Unified application service boundary
└── vedastro.js                # Legacy VedAstro reference service (retained for comparison)
```

---

## 5. Data Contract Specification

### Canonical Sign Format
```json
{
  "signIndex": 6,
  "signName": "Libra",
  "signAbbr": "Li",
  "degree": 26.03
}
```

### Canonical Planet Format
```json
{
  "name": "Sun",
  "abbr": "Su",
  "lon": 176.50,
  "signIndex": 5,
  "sign": "Virgo",
  "signAbbr": "Vi",
  "house": 12,
  "deg": "26.5",
  "isRetrograde": false,
  "speed": 0.99,
  "nakshatra": {
    "name": "Chitra",
    "index": 13,
    "pada": 1,
    "lord": "Mars"
  },
  "dignity": "Normal",
  "color": "#f2ca50"
}
```

### Canonical Lagna Format
```json
{
  "lon": 206.03,
  "signIndex": 6,
  "sign": "Libra",
  "signAbbr": "Li",
  "deg": "26.0",
  "house": 1
}
```

---

## 6. Migration & Deprecation Strategy

1. **Swiss Ephemeris Backend (`astrology.service.js`):** Primary engine for all chart calculations, database caching, and AI prompt context injection.
2. **Legacy VedAstro Integration (`vedastro.js`):** Kept as a reference comparison module; no longer on critical path.
3. **Frontend JS Engine (`astrology.js`):** Kept as client fallback; backend responses are canonical.
