import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { patientId='demo', consultationId='demo-consulta', title='Anamnese' } = body || {};
    const dataPath = process.env.DATA_PATH || '/app/data/clinic';
    const baseDir = path.join(dataPath, patientId, consultationId);
    const partial = path.join(baseDir, 'transcript_partial.txt');
    const final = path.join(baseDir, 'transcript_final.txt');

    if (fs.existsSync(partial)) {
      const content = fs.readFileSync(partial, 'utf8');
      fs.writeFileSync(final, content);
    } else {
      fs.writeFileSync(final, '');
    }

    return NextResponse.json({ ok:true, folder: baseDir, txt_path: final, title });
  } catch (e) {
    return NextResponse.json({ ok:false, error: e?.message || 'finish_error' }, { status: 500 });
  }
}
