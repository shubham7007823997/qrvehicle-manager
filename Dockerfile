FROM node:20-alpine AS builder
WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY backend/src ./src
COPY backend/tsconfig.json ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5000

# DATABASE_URL must be set as env var in Render dashboard
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
