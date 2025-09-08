# MCI Panel — Express Starter

Next.js (App Router) + gravação de áudio do navegador, upload em chunks (3s), transcrição offline usando **whisper.cpp** e salvamento em pasta persistente.

## Variáveis de ambiente
- `PORT` (default 3000)
- `DATA_PATH` (default `/app/data/clinic`)
- `DIRECTUS_URL` (opcional para integrações futuras)
- `DIRECTUS_TOKEN` (opcional para integrações futuras)
- `WHISPER` (default `/app/vendor/whisper.cpp/main`)
- `WHISPER_MODEL` (default `/app/vendor/models/ggml-small.bin`)

## Endpoints
- `GET /api/health`
- `POST /api/chunk` (multipart form: `patientId`, `consultationId`, `chunk`)
- `POST /api/finish` (json: `{ patientId, consultationId, title }`)

## Build local (Docker)
```bash
docker build -t mci-panel .
docker run --rm -p 3000:3000 -v /data/clinic:/app/data/clinic mci-panel
```

Acesse http://localhost:3000/recorder
