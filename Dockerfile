# syntax=docker/dockerfile:1
# Single-container deploy: Express serves both the API (/api) and the built React frontend.

# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install deps first (cached layer). Schema is needed by the postinstall "prisma generate".
COPY package.json package-lock.json ./
COPY server/prisma ./server/prisma
RUN npm ci

# Build the frontend, then drop dev dependencies
COPY . .
RUN npx prisma generate && npm run build && npm prune --omit=dev

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    SERVE_FRONTEND=true

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server/prisma ./server/prisma
COPY --from=build --chown=node:node /app/server/src ./server/src

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/src/index.js"]
