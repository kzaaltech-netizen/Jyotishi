# Jyotishly — test plan

Every kind of test the project has, what each one protects, and how to run it.
Tests use Node's built-in test runner; browser tests use Playwright with the
installed Google Chrome (set `CHROME_PATH` if Chrome is elsewhere).

## How to run

| Command | What it runs | Needs |
|---|---|---|
| `npm test` | Unit tests (front end) | nothing |
| `npm run test:server` | Server tests (astrology, conversation style, rate limiter, DB retry, guardrails) | `server/.env`; the guardrail suite uses the database |
| `npm run build` | Production build + prerender + SEO audit (fails on SEO errors) | nothing |
| `npm run test:perf` | Size budgets, no-JavaScript reading, slow-phone speed | a fresh `npm run build` |
| `npm run test:api` | HTTP API against a running server | API running (`npm run dev:server`), `API_URL` optional |
| `npm run test:e2e` | Real browser: visitor, user journeys, accessibility, layouts | app running (`npm run dev` + API), `E2E_URL` optional |
| `npm run test:all` | All of the above in order | both servers running |

API and browser tests create their own users with `@example.com` addresses and
delete them at the end through the account-deletion endpoint, so they leave no
data behind. The account journey makes one real AI request.

## Developer view — does each part work on its own?

| Area | Test file | Checks |
|---|---|---|
| Routing | `tests/unit/routes.test.mjs` | every screen and every guide in every language round-trips URL ↔ screen; language prefixes only on home/Learn; unknown URLs → 404 screen; trailing slashes |
| Content & translations | `tests/unit/content.test.mjs` | every language has every key, the same `{placeholders}`, every guide with the same sections/lists/FAQs; answer-first length; related links and featured guides exist; sources are https; policy pages complete; privacy lists every data processor |
| SEO metadata | `tests/unit/seo.test.mjs` | unique titles; canonical URLs; share image per page; hreflang complete and identical across languages; JSON-LD valid with Article image, dates and citations; policy pages English; 404 and app screens noindex |
| Chart maths | `src/components/chart/chartValidation.test.js` | chart data validation |
| Astrology engine | `server/src/astrology/tests/*` | API adapter, reference charts, conversation classification |
| Security helpers | `server/src/security/tests/rateLimit.test.js` | limit then 429 with Retry-After; per client; forged `X-Forwarded-For` cannot dodge it; window resets |
| Database resilience | `server/src/security/tests/dbRetry.test.js` | dropped connections retried; real query errors not |
| Guardrails | `server/src/security/tests/guardrailsAndPaywall.test.js` | free limits, paywall, provider budgets |

## Tester view — does the system hold up under wrong input and abuse?

`tests/api/api.test.mjs` (22 tests):

- security headers present, framework header hidden; unknown routes JSON 404; malformed JSON does not crash the server
- every protected endpoint refuses missing, forged and malformed tokens
- guests can make a Kundli but get `LOGIN_REQUIRED` for chat; a guest account cannot be signed into by email
- sign-up rejects empty, blank, invalid and short fields; duplicate email in any letter case; password hash never returned; HTML in names stored as plain text
- sign-in: wrong password, unknown email, then success with a differently-cased email
- guest → sign-up keeps the same user and Kundli; guest → sign-in merges the Kundli and removes the guest; sign-in never overwrites an existing Kundli
- birth details: impossible dates (30 Feb), future dates, bad times (25:99), out-of-range coordinates
- chat: empty and over-long messages refused before any AI call; no Kundli → clear error
- payments: tokens and plans cannot be credited without payment (`PAYMENTS_UNAVAILABLE`); token spending only for known actions
- account deletion needs the password, removes all data, and the account can no longer sign in; guests can delete without a password

`npm run build` → `scripts/audit-seo.mjs` checks all 106 published pages for title, description, canonical, one H1, language, robots, share image, valid JSON-LD, reciprocal hreflang, broken internal links, and sitemap consistency.

`tests/perf/build.test.mjs`:

- size budgets (gzip): main script ≤ 140 KB, CSS ≤ 16 KB, each language chunk ≤ 20 KB, share images ≤ 150 KB, Three.js not loaded up front
- with JavaScript turned off, home, Learn, guides (English and other languages) and policy pages still show their heading, full text and links
- slow phone (slow 4G, 4× slower CPU): LCP < 3 s and CLS < 0.1 on home, Hindi home and guides
- 404 page exists and is `noindex`

`tests/e2e/quality.test.mjs`:

- accessibility: axe-core WCAG 2.0/2.1 A and AA, no serious or critical issues on 15 screens, in both themes
- no sideways scrolling at 320, 375, 768 and 1280 px on all main screens
- phone bottom tabs reach every main screen
- touch targets at least 32 px tall

## User view — can a real person do what they came for?

`tests/e2e/public.test.mjs` (visitor, not signed in):

- home: headline, ask box, starter questions, FAQ opens, featured guides
- asking on the home page (or with an empty box) opens the chat with the question kept
- Learn: all guides listed; a guide shows its short answer, FAQs, sources (opening in a new tab safely) and related guides; back button works
- "Ask about mine" carries the guide's question into the chat
- switching language keeps you on the same page; back button returns; every language home renders in its own script
- a Hindi browser is offered Hindi, and "no thanks" is remembered
- policy pages, contact email, footer links; 404 page with a way home in your language
- theme toggle remembered after reload; skip link for keyboard users

`tests/e2e/journey.test.mjs`:

- **New visitor to answer**: asks on home → birth details in the chat → chart → send asks for an account with the question kept → empty form refused → sign up → question sent automatically → guide answers → conversation survives reload → switch guide → Kundli and Today pages → buying tokens explains payments are not open yet → change app language to Hindi and back → sign out (token cleared) → wrong password refused → sign in, conversation still there → delete account (wrong password refused first) → deleted account cannot sign in.
  If the AI provider is overloaded the chat shows a "busy" notice and returns the question to the box; the test retries like a person would and, if the provider stays down, still checks that behaviour.
- **Guest**: Kundli without an account → stepper validation → chart → Kundli page, planet table (9 planets), planet details open and close with Escape, dasha timeline → Today → profile shows guest status → delete guest data.

Every browser test also fails on JavaScript errors or console errors from the app.

## Bugs these tests found and fixed

- Unpaid credit: `/tokens/add` and `/subscription` gave tokens and Pro without payment; now refused unless `ALLOW_TEST_PURCHASES=true`. The Pro page also sent the wrong plan name, and both purchase pages showed success when the server failed.
- Birth details accepted impossible dates and times.
- Token spending accepted unknown actions and could double-spend under concurrent requests; now validated and atomic.
- Login and sign-up had no brute-force protection; now rate limited per IP (forged proxy headers ignored outside Vercel).
- No security headers on API responses.
- No way to delete an account; now in Settings (DPDP), including AI logs that were not linked to the user.
- Neon closing idle connections caused random 500s; queries now retry on dropped connections.
- An overloaded AI provider returned a raw 500; now the provider retries once, the API answers 503 `AI_BUSY`, and the chat shows a short localized message without doubling the question.
- A Gemini model that never answered left the chat request hanging forever (no timeout). Each model now gets 20 s and the whole reply 50 s; the browser waits 60 s.
- A question sent automatically after sign-in was lost when the AI failed; it now returns to the message box for another try.
- The token wallet polled the API every 500 ms until its first answer arrived (dozens of requests on a slow database), and kept the previous person's balance after switching accounts. It now loads once per signed-in user.
- Example buttons on the home page chart demo were 6 px tall on phones; all tap targets are now at least 32 px.
