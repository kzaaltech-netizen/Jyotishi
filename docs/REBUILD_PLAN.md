# MASTER REBUILD PLAN — HYBRID APPROACH

This plan represents the agreed product and engineering roadmap for `astro-ai-app`.

---

## 7-Phase Master Roadmap

### Phase 0: Repository Cleanup & Structure (COMPLETED)
* Organize codebase into clean domain directories (`web/src/features`, `server/src/astrology`, `server/src/ai`).
* Archive design assets and remove build output / duplicate directories.
* Verify project health and imports.

### Phase 1: Astrology Foundation (COMPLETED)
* Integrate local Swiss Ephemeris (`swisseph-wasm` v2.10.03) into backend `server/src/astrology/`.
* Implement sub-second sidereal calculations with Lahiri ayanamsa (`SE_SIDM_LAHIRI`) for D1 natal, D9 Navamsha, D10 Dashamsha, Nakshatras, and 120-year Vimshottari Dashas.
* Establish canonical data contract (`signIndex`, `signName`, `signAbbr`, `degree`, `signNum`).
* Build automated reference chart test suite (`server/src/astrology/tests/referenceCharts.test.js`) — 100% PASS (17/17 tests).
* Document Swiss Ephemeris dual-licensing requirements (AGPL v3 / Astrodienst Commercial License) in `docs/ASTROLOGY_ENGINE.md`.

### Phase 2: Kundli & Chart System (COMPLETED)
* Built calculation-provider agnostic data contract normalizer (`chartDataNormalizer.js`).
* Fixed `NorthIndianChart.jsx` SVG rashi-numbering bug for all 12 Ascendants with zero silent Aries fallback.
* Built deterministic collision-free planet placement engine (`planetLayoutEngine.js`) for 1 to 5+ planets.
* Implemented South Indian fixed-zodiac grid chart (`SouthIndianChart.jsx`) with North/South toggle.
* Created interactive progressive-disclosure modals for planets (`PlanetDetailModal.jsx`) and houses (`HouseDetailModal.jsx`).
* Connected chart interaction directly to "Ask Your Kundli" AI prompts.
* Created comprehensive automated test suite (`chartValidation.test.js`) with 8/8 test suites passing.

### Phase 3: Real Product Data Integration
* Connect Dashboard & Daily Horoscope views to real Swiss Ephemeris transits and dynamic Panchang APIs.
* Replace all static mock text on frontend with real calculated data.

### Phase 4: Daily Retention & Push Notifications
* Implement daily morning transit prediction generator.
* Add push notification delivery (Firebase Cloud Messaging / Expo Push).

### Phase 5: Production Security & Monetization
* Secure token creation endpoints (`/api/tokens/add`).
* Integrate Razorpay / Stripe payment gateway webhooks.
* Add rate-limiting middleware (`express-rate-limit`).
* Migrate SQLite to PostgreSQL.

### Phase 6: Advanced Features
* Ashtakoot Guna Milan (36-point Kundli matching).
* Server-side PDF Kundli report generator.
* Multi-profile / family chart management.
