# Imagem base
FROM node:18-bullseye

# Pasta de trabalho
WORKDIR /app

# Copia somente manifestos para cache eficiente
COPY package*.json ./

# Instala apenas dependências necessárias para produção
# (se você precisar de devDeps, troque para "npm ci")
RUN npm ci --omit=dev

# Copia o restante do código
COPY . .

# Porta da aplicação
ENV PORT=3000
EXPOSE 3000

# Sobe o server (ajuste se o "start" do seu package.json for outro)
CMD ["npm", "start"]
