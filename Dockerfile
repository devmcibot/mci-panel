FROM node:20-bullseye

# Install build deps for whisper.cpp
RUN apt-get update && apt-get install -y --no-install-recommends     git build-essential cmake wget ffmpeg &&     rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Next.js
RUN npm run build

# Build whisper.cpp and download a small model
RUN mkdir -p /app/vendor && cd /app/vendor &&     git clone https://github.com/ggerganov/whisper.cpp.git &&     cd whisper.cpp && make -j &&     mkdir -p /app/vendor/models &&     wget -O /app/vendor/models/ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin?download=true

ENV PORT=3000
ENV DATA_PATH=/app/data/clinic
ENV DIRECTUS_URL=
ENV DIRECTUS_TOKEN=
ENV WHISPER=/app/vendor/whisper.cpp/main
ENV WHISPER_MODEL=/app/vendor/models/ggml-small.bin

# Ensure data path exists at runtime
RUN node scripts/ensure-data-path.js || true

EXPOSE 3000
CMD ["npm", "start"]
