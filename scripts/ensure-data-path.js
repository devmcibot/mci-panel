const fs = require('fs');
const path = process.env.DATA_PATH || '/app/data/clinic';
try {
  fs.mkdirSync(path, { recursive: true });
  console.log('[ensure-data-path] ensured:', path);
} catch (e) {
  console.error('[ensure-data-path] failed:', e.message);
}
