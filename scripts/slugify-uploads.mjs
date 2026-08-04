// Renombra cada ilustración de `src/assets/uploads/` para que coincida con el
// slug del contenido que la referencia: la imagen de `fabulas/<slug>.md` pasa a
// llamarse `<slug>.<ext>`, y su campo `ilustracion:` (o `imagen:` en autores)
// se reescribe en el mismo paso. Determinista e idempotente: si ya coincide, no
// hace nada.
//
// Regla de naming del proyecto: cada ilustración se guarda como `<slug>.png`
// (ver docs). Decap CMS sube los ficheros con su nombre original
// (`chatgpt-image-…png`), así que este script normaliza tras cada importación.
//
// Uso:
//   node scripts/slugify-uploads.mjs           # renombra (git mv) + reescribe refs
//   node scripts/slugify-uploads.mjs --dry     # solo informa, no toca nada
//   node scripts/slugify-uploads.mjs --check    # sale 1 si algo está por renombrar (CI)
//
// Excepción · imágenes compartidas: si un mismo fichero lo referencian dos o más
// contenidos (p. ej. una entrada que reutiliza el retrato de un autor), NO se
// renombra —no puede llamarse como dos slugs a la vez— y se avisa.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UP = path.join(ROOT, 'src/assets/uploads');
const DRY = process.argv.includes('--dry');
const CHECK = process.argv.includes('--check');

const COLS = [
  { dir: 'fabulas', field: 'ilustracion' },
  { dir: 'autores', field: 'imagen' },
  { dir: 'entradas', field: 'ilustracion' },
];

function refRegex(field) {
  return new RegExp(`^(${field}:\\s*)(\\S+)`, 'm');
}

// 1ª pasada: contar cuántos contenidos referencian cada fichero (para detectar
// imágenes compartidas, que no se pueden renombrar a un único slug).
const refCount = new Map();
const entries = [];
for (const { dir, field } of COLS) {
  const base = path.join(ROOT, 'src/content', dir);
  if (!fs.existsSync(base)) continue;
  for (const f of fs.readdirSync(base)) {
    if (!/\.mdx?$/.test(f)) continue;
    const id = f.replace(/\.mdx?$/, '');
    const mdPath = path.join(base, f);
    const txt = fs.readFileSync(mdPath, 'utf8');
    const m = txt.match(refRegex(field));
    if (!m) continue;
    const bn = path.basename(m[2]);
    refCount.set(bn, (refCount.get(bn) || 0) + 1);
    entries.push({ dir, field, id, mdPath, refPath: m[2], bn });
  }
}

const uploads = new Set(fs.readdirSync(UP));
let renamed = 0, shared = 0, pending = 0;

for (const e of entries) {
  const ext = e.bn.includes('.') ? e.bn.slice(e.bn.lastIndexOf('.') + 1) : 'png';
  const target = `${e.id}.${ext}`;
  if (e.bn === target) continue; // ya coincide
  if (refCount.get(e.bn) > 1) {
    console.log(`  ~ compartida (no se renombra): ${e.bn} · ${refCount.get(e.bn)} referencias`);
    shared++;
    continue;
  }
  if (!uploads.has(e.bn)) { console.log(`  ! fuente ausente: ${e.dir}/${e.id} -> ${e.bn}`); continue; }
  if (uploads.has(target)) { console.log(`  ! target ya existe: ${e.bn} -> ${target}`); continue; }

  pending++;
  if (DRY || CHECK) { console.log(`  · ${e.dir}/${e.id}: ${e.bn} -> ${target}`); continue; }

  execFileSync('git', ['-C', ROOT, 'mv',
    path.relative(ROOT, path.join(UP, e.bn)),
    path.relative(ROOT, path.join(UP, target))]);
  const txt = fs.readFileSync(e.mdPath, 'utf8')
    .replace(refRegex(e.field), `$1${e.refPath.replace(e.bn, target)}`);
  fs.writeFileSync(e.mdPath, txt);
  uploads.delete(e.bn); uploads.add(target);
  renamed++;
}

if (CHECK) {
  if (pending > 0) { console.error(`\n✗ ${pending} ilustración(es) sin slugificar. Corre: npm run slugify:uploads`); process.exit(1); }
  console.log('✓ todas las ilustraciones están slugificadas'); process.exit(0);
}
console.log(`\n${DRY ? '[dry] ' : ''}renombradas: ${DRY ? pending : renamed} · compartidas omitidas: ${shared}`);
