// Migración única (se mantiene para futuros casos similares):
// - Reemplaza el string `autor` por el slug del archivo de autor referenciado.
// - Elimina los campos autor_nacionalidad / autor_nacimiento / autor_muerte / autor_siglo.
//
// Manipula los archivos como texto plano para no alterar el formato del
// frontmatter existente (fechas, comillas, orden de campos).

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const AUTORES_DIR = path.join(ROOT, 'src', 'content', 'autores');
const FABULAS_DIR = path.join(ROOT, 'src', 'content', 'fabulas');

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
const AUTOR_LINE_RE = /^(autor:\s*)(.*)$/m;
const NOMBRE_LINE_RE = /^nombre:\s*(.*)$/m;
const OLD_FIELDS_RE = /^(autor_nacionalidad|autor_nacimiento|autor_muerte|autor_siglo):[^\n]*\n?/gm;

function stripQuotes(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

async function buildAuthorMap() {
  const files = await readdir(AUTORES_DIR);
  const map = new Map();
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const raw = await readFile(path.join(AUTORES_DIR, f), 'utf8');
    const fm = raw.match(FRONTMATTER_RE);
    if (!fm) throw new Error(`No frontmatter in autor file: ${f}`);
    const nombreMatch = fm[1].match(NOMBRE_LINE_RE);
    if (!nombreMatch) throw new Error(`No 'nombre' field in autor file: ${f}`);
    const nombre = stripQuotes(nombreMatch[1]);
    const slug = f.replace(/\.md$/, '');
    if (map.has(nombre)) {
      throw new Error(`Duplicate author name: "${nombre}" in ${f}`);
    }
    map.set(nombre, slug);
  }
  return map;
}

async function main() {
  const authorMap = await buildAuthorMap();
  const slugSet = new Set(authorMap.values());

  console.log(`Mapped ${authorMap.size} authors:`);
  for (const [nombre, slug] of authorMap) {
    console.log(`  "${nombre}" → ${slug}`);
  }
  console.log('');

  const files = await readdir(FABULAS_DIR);
  let migrated = 0;
  let skipped = 0;
  const failures = [];

  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const filepath = path.join(FABULAS_DIR, f);
    const raw = await readFile(filepath, 'utf8');
    const fm = raw.match(FRONTMATTER_RE);
    if (!fm) {
      failures.push({ file: f, reason: 'no frontmatter' });
      continue;
    }
    const fmText = fm[1];

    const autorMatch = fmText.match(AUTOR_LINE_RE);
    if (!autorMatch) {
      failures.push({ file: f, reason: 'no autor field' });
      continue;
    }
    const autorValue = stripQuotes(autorMatch[2]);
    const hasOldFields = fmText.search(OLD_FIELDS_RE) !== -1;

    // Idempotencia: archivo ya migrado.
    if (!hasOldFields && slugSet.has(autorValue)) {
      skipped++;
      continue;
    }

    const slug = authorMap.get(autorValue);
    if (!slug) {
      failures.push({ file: f, reason: `autor "${autorValue}" not in author map` });
      continue;
    }

    const newFmText = fmText
      .replace(AUTOR_LINE_RE, `$1${slug}`)
      .replace(OLD_FIELDS_RE, '')
      .replace(/\n+$/, '');

    const newRaw = raw.replace(FRONTMATTER_RE, `---\n${newFmText}\n---`);
    await writeFile(filepath, newRaw, 'utf8');
    migrated++;
  }

  console.log(`✓ Migrated: ${migrated}`);
  console.log(`↷ Skipped (already migrated): ${skipped}`);
  if (failures.length) {
    console.log(`\n✗ Failures: ${failures.length}`);
    for (const { file, reason } of failures) {
      console.log(`  - ${file}: ${reason}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});