# syntax=docker/dockerfile:1

# Multi-stage build producing a small image that runs Next.js's standalone server.
#   docker build -t next-enterprise-starter .
#   docker run -p 3000:3000 --env-file .env next-enterprise-starter
# Run migrations separately (see the `migrate` service in docker-compose.yml).

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies (postinstall runs `prisma generate`, so the schema is needed).
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# Build the app. Secrets aren't available here, so skip env validation.
# APP_URL is baked into prerendered pages: social cards, sitemap, llms.txt.
#   docker build --build-arg APP_URL=https://example.com .
FROM base AS builder
ARG APP_URL=http://localhost:3000
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV APP_URL=$APP_URL \
    SKIP_ENV_VALIDATION=1 \
    BUILD_STANDALONE=1
RUN npm run build

# Production image: only the standalone server, static assets and public files.
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
