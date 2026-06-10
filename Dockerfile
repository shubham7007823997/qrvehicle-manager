FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and prisma schema first (layer caching)
COPY backend/package*.json ./
COPY backend/prisma ./prisma

# Install ALL deps (including devDeps needed for tsc)
RUN npm ci

# Generate Prisma client at build time while still root
RUN npx prisma generate

# Copy source and compile TypeScript
COPY backend/src ./src
COPY backend/tsconfig.json ./

RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
COPY backend/prisma ./prisma

# Install production deps only — still as root so npm can write freely
RUN npm ci --omit=dev

# Generate Prisma client as root (fixes the permissions error)
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Run migrations then start — still as root inside container (Render handles isolation)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
