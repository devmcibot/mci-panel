# -------- STAGE: build --------
FROM node:18-bullseye AS build
WORKDIR /app

# Copia somente manifestos (cache eficiente)
COPY package*.json ./

# Tenta ci (com lockfile); se não houver lock, cai para install
# (isso evita quebrar quando o lock não está presente ou está incompatível)
RUN npm --version && node --version && \
    (npm ci --omit=dev || npm install --omit=dev)

# Agora copia o código e faz o build
COPY . .
ENV NODE_ENV=production
RUN npm run build

# -------- STAGE: runtime --------
FROM node:18-bullseye
WORKDIR /app

# Copia artefatos necessários para rodar
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
# (se você tiver next.config.js/ts, copie também)
# COPY --from=build /app/next.config.js ./next.config.js

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm","start"]
