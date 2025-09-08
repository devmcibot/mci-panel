# --------- BUILD ---------
FROM node:20-bullseye AS builder

# deps de build (se precisar no futuro para binários)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential cmake wget ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# instala dependências primeiro (cache eficiente)
COPY package*.json ./
# flags p/ evitar travas de peer deps e logs mais claros
RUN node -v && npm -v && \
    npm install --legacy-peer-deps --no-audit --no-fund --loglevel=info

# copia o restante do código e faz o build
COPY . .
RUN npm run build

# --------- RUNTIME ---------
FROM node:20-bullseye

WORKDIR /app
COPY --from=builder /app ./

# Variáveis NÃO sensíveis aqui; segredos vão no painel!
ENV PORT=3000
# DATA_PATH vai ser setado no Easypanel (Ambiente)
EXPOSE 3000
CMD ["npm","start"]
