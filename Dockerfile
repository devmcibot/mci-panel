# ---------- STAGE: build ----------
FROM node:18-bullseye AS build
WORKDIR /app

# se você tem package-lock.json, prefira npm ci
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund

# copia restante e builda
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---------- STAGE: runtime ----------
FROM node:18-bullseye
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# em vez de copiar item a item, traz tudo do build
COPY --from=build /app ./

EXPOSE 3000
CMD ["npm","start"]
