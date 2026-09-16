# ASTRO-AI ARCHITECTURE SPECIFICATION

## System Overview

`astro-ai-app` is structured as a full-stack astrological insights application:

```text
astro-ai-app/
├── src/                  # Vite + React 18 Frontend
│   ├── components/       # UI, Chart, Layout, Chat components
│   ├── pages/            # Application routes & views
│   ├── features/         # Domain feature groupings (kundli, ask, tokens, etc.)
│   ├── context/          # React Context (AppContext, TokenContext)
│   ├── lib/              # Utilities (astrology engine, geocoding, i18n)
│   └── services/         # API fetch wrappers
├── server/               # Express + Prisma Backend Service
│   ├── src/
│   │   ├── routes/       # Express REST API routes
│   │   ├── astrology/    # Calculation services & VedAstro integration
│   │   ├── ai/           # Multi-agent orchestrator, prompts, memory & providers
│   │   ├── middleware/   # Authentication & JWT middleware
│   │   └── config/       # Admin configuration & environment parameters
│   └── prisma/           # Prisma schema & SQLite database
├── mobile/               # React Native Expo app draft (isolated)
└── docs/                 # System architecture, project status & rebuild plan
```

---

## Backend Data Flow

```text
HTTP Request
  │
  ├──> Express Router (`server/src/routes/*`)
  │      └──> Middleware Auth (`middleware/auth.js`)
  │
  ├──> Domain Layer
  │      ├──> Astrology Domain (`server/src/astrology/`)
  │      └──> AI Orchestrator Domain (`server/src/ai/`)
  │
  └──> Database Layer
         └──> Prisma ORM (`server/prisma/schema.prisma`) ──> SQLite (`dev.db`)
```

---

## AI & Astrology Execution Pipeline

1. **Astrology Calculations:** Handled deterministically by VedAstro backend REST service (`server/src/astrology/vedastro.js`), with client-side Pure JS failover (`src/lib/astrology.js`).
2. **AI Interpretation:** Calculated astronomical facts (Lagna, planet longitudes, houses, Vimshottari dasha, VedAstro yogas) are injected as structured facts into system instructions built by `PromptBuilder.js`.
3. **LLM Execution:** Handled by `GeminiProvider.js` invoking Google Gemini API (`gemini-1.5-flash`).
4. **Token Ledgering:** Tokens pre-checked before execution and deducted post-success via Prisma transactions.
