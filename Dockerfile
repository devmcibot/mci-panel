# ---------- STAGE: build ----------
FROM node:18-bullseye AS build
WORKDIR /app

# copia só manifestos para aproveitar cache
COPY package*.json ./

# instala deps (tolerante a peer deps)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# agora copia o código e faz o build
COPY . .
RUN npm run build

# ---------- STAGE: runtime ----------
FROM node:18-bullseye
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
WORKDIR /app

# traz apenas o necessário para rodar
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
# (se seu Next usa pasta app/, inclua)
COPY --from=build /app/app ./app

EXPOSE 3000
CMD ["npm","start"]
