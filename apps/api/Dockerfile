# API image — build context is the repo root:
#   docker build -f apps/api/Dockerfile -t landednz-api .
# Same image runs locally (npm run docker:api), on Render (staging) and Railway (production).
# Pre-deploy command: npx prisma migrate deploy (run from apps/api)

# Stage 1 — build
FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/types ./packages/types
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN npm ci -w @landednz/api --include-workspace-root

COPY apps/api ./apps/api
WORKDIR /app/apps/api
# prisma.config.ts reads DATABASE_URL; generate never connects, so a placeholder is enough
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate
RUN npm run build

# Stage 2 — run (prod deps only, no dev tooling)
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY packages/types ./packages/types
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN npm ci -w @landednz/api --include-workspace-root --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/

ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/health || exit 1

CMD ["node", "apps/api/dist/src/server.js"]
