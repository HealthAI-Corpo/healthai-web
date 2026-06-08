# ─── Build ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Variables NEXT_PUBLIC_* bakées au build (disponibles côté client)
ARG NEXT_PUBLIC_USE_MOCK=false
ARG NEXT_PUBLIC_NESTJS_URL=http://localhost:3001
ARG NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
ARG NEXT_PUBLIC_API_KEY=""
ARG NEXT_PUBLIC_CLIENT_ID=healthai-admin-front
ARG NEXT_PUBLIC_METABASE_URL=http://localhost:3002

ENV NEXT_PUBLIC_USE_MOCK=$NEXT_PUBLIC_USE_MOCK
ENV NEXT_PUBLIC_NESTJS_URL=$NEXT_PUBLIC_NESTJS_URL
ENV NEXT_PUBLIC_FASTAPI_URL=$NEXT_PUBLIC_FASTAPI_URL
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_CLIENT_ID=$NEXT_PUBLIC_CLIENT_ID
ENV NEXT_PUBLIC_METABASE_URL=$NEXT_PUBLIC_METABASE_URL

RUN npm run build

# ─── Runner ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
