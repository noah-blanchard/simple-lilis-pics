# syntax=docker/dockerfile:1
#
# Lilis Pics — wedding site scaffold (apps/wedding).
# Build context MUST be the repository root:
#   docker build -f apps/wedding/Dockerfile -t lili-wedding .
#
# NEXT_PUBLIC_* values are inlined into the build, so they are build args.
# Server secrets: none yet. When the wedding app needs any, they are runtime env
# only — never pass them as build args.

ARG NODE_VERSION=24
ARG BUN_VERSION=1.3.13

FROM oven/bun:${BUN_VERSION} AS bun

# ── Build ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS builder
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

COPY . .
# apps/wedding/public has no files yet and git does not track empty folders,
# so create it here: the runner stage copies it unconditionally.
RUN mkdir -p apps/wedding/public
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_BUCKET=photos
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_PUBLIC_SUPABASE_BUCKET=${NEXT_PUBLIC_SUPABASE_BUCKET} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/wedding
# next/font/google downloads fonts from Google at build time and that fetch
# fails intermittently ("next/font/google queries have exactly one entry").
# Retry the build up to 3 times; a real error still fails after the last try.
RUN for i in 1 2 3; do bun run build && exit 0; echo "build attempt $i failed"; rm -rf .next; sleep 3; done; exit 1

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/wedding/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/wedding/.next/static ./apps/wedding/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/wedding/public ./apps/wedding/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/favicon.ico').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/wedding/server.js"]
