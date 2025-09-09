# ---------- stage: deps ----------
FROM node:18-bullseye AS deps
WORKDIR /app
COPY package*.json ./
# instala todas as deps necessárias para build e runtime
RUN npm ci --no-audit --no-fund

# ---------- stage: build ----------
FROM node:18-bullseye AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- stage: runtime ----------
FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# só o necessário pro runtime (sem fontes)
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm","start"]
