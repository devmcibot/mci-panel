# ====== STAGE 1: deps ======
FROM node:18-bullseye AS deps
WORKDIR /app

# copia só manifestos p/ cache eficiente
COPY package*.json ./

# configurações p/ instalações limpas e previsíveis
RUN npm i -g npm@10 && npm -v && \
    npm config set fund false && \
    npm config set audit false && \
    # se houver lockfile usa ci; senão usa install (fallback)
    bash -lc 'if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi'

# ====== STAGE 2: build ======
FROM node:18-bullseye AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# build do Next (usa devDeps já instaladas no stage deps)
RUN npm run build

# ====== STAGE 3: runtime ======
FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# (DATA_PATH vai pelo Easypanel Ambiente)
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm","start"]
