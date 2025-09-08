# ---------- STAGE: deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
# só manifestos primeiro (cache de deps)
COPY package*.json ./
# cache de npm para builds repetidos
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- STAGE: build ----------
FROM node:18-alpine AS build
WORKDIR /app
# reutiliza node_modules do stage de deps
COPY --from=deps /app/node_modules ./node_modules
# agora o resto do código
COPY . .
# compila o Next
RUN npm run build

# ---------- STAGE: runtime ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copia artefatos necessários p/ rodar em prod
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=deps  /app/node_modules ./node_modules

# portas/entrada
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
