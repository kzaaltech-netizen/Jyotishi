# Jyotishly — SEO, AEO and GEO launch checklist

What is already built into the site, what to do on launch day, and what to do every
month after. Updated 2026-10-21.

## Already in the codebase

- **106 indexable pages**: home, Learn index and 15 guides in six languages
  (English, Hindi, Marathi, Bengali, Tamil, Telugu), plus About, Contact, Privacy
  and Terms in English. All are prerendered to static HTML at build time, so
  crawlers and AI assistants read full text without running JavaScript.
- **Per page**: unique title and description, canonical URL, `hreflang` for all six
  languages plus `x-default`, `html lang`, Open Graph and Twitter tags, a share image
  (`public/og/<lang>/<page>.jpg`, made by `npm run og`), and JSON-LD.
- **Structured data**: Organization (with contact email and city), WebSite,
  WebApplication, FAQPage, Article (with image, dates and `citation` sources),
  BreadcrumbList, CollectionPage, AboutPage, ContactPage.
- **Answer-first guides**: each guide opens with a 40–60 word "Short answer", then
  sections, FAQs, related guides and checked sources. The eight newest guides target
  real Google India autocomplete queries (see "Content plan" below).
- **Trust pages**: `/about` (who makes it, how charts are calculated, what the AI
  guides will not do), `/contact`, `/privacy` (all data processors listed),
  `/terms` (with the astrology and AI disclaimer).
- **Crawling**: `sitemap.xml` (every page with its language alternates),
  `robots.txt` (search and AI crawlers allowed on public pages; app screens
  blocked), `llms.txt` and `llms-full.txt`, a real 404 page with a 404 status.
- **Speed**: Three.js sky loads only after the page has finished loading (and not at
  all with Data Saver or on 2G); signed-in screens and animation code load in their
  own chunks; each language page preloads its text. Lab test, mobile, slow 4G with
  a 4× slower CPU: LCP 1.5–2.7 s, CLS ≤ 0.05.
- **Regression check**: `npm run build` ends with `scripts/audit-seo.mjs`, which
  fails the build on a missing title, description, canonical or H1, broken
  internal links, `hreflang` targets that do not exist or are not reciprocal,
  invalid JSON-LD, missing share images, or sitemap URLs that are not pages.

## Launch day (in this order)

1. **Domain** — In Vercel, add `jyotishly.com` as the primary domain and
   `www.jyotishly.com` as a redirect to it. All canonical URLs use
   `https://jyotishly.com` without `www`. Confirm HTTPS works on both.
2. **Production settings** — Set `JWT_SECRET`, `CORS_ORIGINS=https://jyotishly.com`,
   `DATABASE_URL`, `DIRECT_URL` and the API keys in Vercel. Do not deploy with test
   values.
3. **Smoke test the live site**
   - `https://jyotishly.com/robots.txt` and `/sitemap.xml` open.
   - `https://jyotishly.com/xyz` shows the 404 page (status 404, check in browser
     dev tools → Network).
   - `https://jyotishly.com/hi/learn/sade-sati` opens in Hindi.
   - `https://jyotishly.com/0e4a8977ae8a15d1f7d6bbc095da743c.txt` shows the
     IndexNow key.
4. **Google Search Console** (free) — Add a *Domain* property for `jyotishly.com`
   and verify with the DNS TXT record. Then:
   - Sitemaps → submit `https://jyotishly.com/sitemap.xml`.
   - URL inspection → request indexing for `/`, `/learn`, `/hi`, and the guides
     `/learn/how-to-read-a-kundli`, `/learn/marriage-timing-in-kundli`,
     `/learn/kundli-milan-guna-milan`.
5. **Bing Webmaster Tools** (free) — Sign in and choose *Import from Google Search
   Console*. Bing's index also feeds ChatGPT search and Copilot. Then run
   `npm run indexnow` to submit every URL.
6. **Validate** (free tools)
   - Rich Results Test: one guide, e.g. `/learn/sade-sati` (Article, FAQ,
     Breadcrumb should be detected).
   - PageSpeed Insights (mobile): `/`, `/hi`, `/learn/sade-sati`.
   - Share previews: paste a guide URL into WhatsApp, and into the Facebook Sharing
     Debugger and LinkedIn Post Inspector, to refresh the image cache.

## Every month

- Search Console → *Pages*: fix anything "Crawled — currently not indexed" or
  "Duplicate" for public pages. → *Performance*: note the queries that get
  impressions but few clicks, and improve those pages' titles and short answers.
- Bing Webmaster → same checks; run `npm run indexnow` after publishing changes.
- Ask ChatGPT, Gemini, Perplexity and Claude the questions the guides answer
  ("what is sade sati", "how to read a kundli", in Hindi too) and note whether
  Jyotishly is cited. Strengthen the pages that are not.
- After changing a guide title, run `npm run og` and commit the new images.

## Content plan (next guides)

Real queries from Google India autocomplete (Oct 2026) that the site does not
cover yet, in rough order of value:

| Query people type | Suggested guide |
|---|---|
| pitra dosh kya hota hai / ke lakshan | What is Pitra Dosh? (balanced, no fear selling) |
| career astrology by date of birth | Career in your Kundli: the 10th house and its lord |
| 7th house lord in 8th house, rahu in 7th house | Planets in the 7th house (one section per planet) |
| 10th house rahu / ketu in hindi | Rahu and Ketu in each house |
| sade sati kumbh / meen / mesh rashi | Sade Sati by Moon sign (12 short sections, dates per sign) |
| shani mahadasha rahu antardasha, rahu mahadasha ketu antardasha | Antardasha guides for the most searched pairs |
| manglik calculator / sade sati calculator | Free calculators (good GEO/AEO entry pages) |
| nakshatra list / kitne hote hain | All 27 nakshatras, one section each |

## Still needs input from you

- **Official social profiles** (Instagram, YouTube, X, LinkedIn): once they exist,
  add them as `sameAs` to the Organization schema in `src/lib/seo.js`.
- **A named astrologer reviewer**: if a real Jyotishi reviews the guides, add a
  "Reviewed by" line and a Person entry to the Article schema. This is the
  strongest trust signal for an astrology site.
- **Native-speaker review** of the Hindi, Marathi, Bengali, Tamil and Telugu text
  before launch.
- **Payments**: the token packs and Pro plans in the app are not connected to a
  payment gateway yet; keep pricing out of public pages until they are.
