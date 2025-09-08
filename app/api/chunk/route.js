import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { IncomingForm } from 'formidable';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false, uploadDir: tmpdir(), keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function toWav(webmPath) {
  const wavPath = webmPath.replace(/\.webm$/i, '.wav');
  await new Promise((resolve) => {
    const ff = spawn('ffmpeg', ['-y', '-i', webmPath, '-ar', '16000', '-ac', '1', wavPath]);
    ff.on('close', () => resolve());
  });
  return wavPath;
}

async function transcribeChunk(wavPath) {
  const WHISPER = process.env.WHISPER || '/app/vendor/whisper.cpp/main';
  const MODEL = process.env.WHISPER_MODEL || '/app/vendor/models/ggml-small.bin';
  return new Promise((resolve) => {
    try {
      const outFile = path.join(tmpdir(), `out-${Date.now()}`);
      const proc = spawn(WHISPER, ['-m', MODEL, '-f', wavPath, '-l', 'pt', '-otxt', '-of', outFile]);
      proc.on('close', (code) => {
        try {
          const text = fs.readFileSync(outFile + '.txt', 'utf8');
          resolve(text.trim());
        } catch {
          resolve('');
        }
      });
    } catch {
      resolve('');
    }
  });
}

export async function POST(req) {
  try {
    const { fields, files } = await parseForm(req);
    const patientId = String(fields.patientId || 'demo').trim();
    const consultationId = String(fields.consultationId || 'demo-consulta').trim();
    const dataPath = process.env.DATA_PATH || '/app/data/clinic';
    const baseDir = path.join(dataPath, patientId, consultationId);
    const audioDir = path.join(baseDir, 'audio');
    ensureDir(audioDir);

    const f = files.chunk;
    if (!f) return NextResponse.json({ ok:false, error:'no_file' }, { status: 400 });

    const srcPath = Array.isArray(f) ? f[0].filepath : f.filepath;
    const targetWebm = path.join(audioDir, path.basename(srcPath));
    fs.copyFileSync(srcPath, targetWebm);

    const wavPath = await toWav(targetWebm);
    const partial = await transcribeChunk(wavPath);
    const partialFile = path.join(baseDir, 'transcript_partial.txt');
    if (partial) {
      fs.appendFileSync(partialFile, (fs.existsSync(partialFile) ? '\n' : '') + partial);
    }

    return NextResponse.json({ ok:true, partial: (partial || '').slice(0, 1000) });
  } catch (e) {
    return NextResponse.json({ ok:false, error: e?.message || 'chunk_error' }, { status: 500 });
  }
}
