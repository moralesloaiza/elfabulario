#!/usr/bin/env node
// Validates that the PR author is the curador of every fabula/entrada
// they touch. Reads frontmatter directly without external deps.
//
// Required env: PR_AUTHOR, BASE_SHA, HEAD_SHA.
// Exits 0 on success, 1 on ownership violation, 2 on misconfiguration.

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ADMIN = 'moralesloaiza';
const AUTHORS_DIR = 'src/content/autores';
const CONTENT_PATTERN = /^src\/content\/(fabulas|entradas)\/.+\.(md|mdx)$/;

const { PR_AUTHOR, BASE_SHA, HEAD_SHA } = process.env;

if (!PR_AUTHOR || !BASE_SHA || !HEAD_SHA) {
  console.error('Missing required env: PR_AUTHOR, BASE_SHA, HEAD_SHA.');
  process.exit(2);
}

if (PR_AUTHOR === ADMIN) {
  console.log(`✓ PR author is ${ADMIN} (admin) — skipping ownership check.`);
  process.exit(0);
}

// 1. List content files changed in the PR.
const diff = execSync(
  `git diff --name-status ${BASE_SHA} ${HEAD_SHA}`,
  { encoding: 'utf8' }
).trim();

const changes = diff
  .split('\n')
  .filter(Boolean)
  .map(line => {
    const parts = line.split('\t');
    const status = parts[0][0]; // R100 -> R, M -> M, etc.
    const path = parts[parts.length - 1]; // for renames, use new path
    return { status, path };
  })
  .filter(({ path }) => CONTENT_PATTERN.test(path));

if (changes.length === 0) {
  console.log('✓ No fabula/entrada files modified — nothing to check.');
  process.exit(0);
}

// 2. Index authors from the PR head (post-merge state).
const authorIndex = new Map(); // nombre -> { tipo, github_username, file }

if (existsSync(AUTHORS_DIR)) {
  for (const file of readdirSync(AUTHORS_DIR)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const fm = parseFrontmatter(readFileSync(join(AUTHORS_DIR, file), 'utf8'));
    if (fm.nombre) {
      authorIndex.set(fm.nombre, {
        tipo: fm.tipo,
        github_username: fm.github_username,
        file,
      });
    }
  }
}

// 3. Check each changed file.
const errors = [];

for (const { status, path } of changes) {
  let content;
  try {
    if (status === 'D') {
      content = execSync(`git show ${BASE_SHA}:${path}`, { encoding: 'utf8' });
    } else {
      content = readFileSync(path, 'utf8');
    }
  } catch (err) {
    errors.push(`✗ ${path}: could not read file (${err.message})`);
    continue;
  }

  const fm = parseFrontmatter(content);

  if (!fm.curador) {
    errors.push(`✗ ${path}\n  Missing required field 'curador' in frontmatter.`);
    continue;
  }

  const author = authorIndex.get(fm.curador);

  if (!author) {
    errors.push(
      `✗ ${path}\n` +
      `  curador: "${fm.curador}"\n` +
      `  No file in ${AUTHORS_DIR}/ has nombre: "${fm.curador}".\n` +
      `  If you are a new contributor, include your author entry in this PR\n` +
      `  (tipo: colaborador, github_username: your-github-handle).`
    );
    continue;
  }

  if (author.tipo !== 'colaborador') {
    errors.push(
      `✗ ${path}\n` +
      `  curador: "${fm.curador}" → ${AUTHORS_DIR}/${author.file}\n` +
      `  This author is tipo: "${author.tipo}". Only 'colaborador' authors\n` +
      `  may be set as curador in a contributor PR.`
    );
    continue;
  }

  if (author.github_username !== PR_AUTHOR) {
    errors.push(
      `✗ ${path}\n` +
      `  curador: "${fm.curador}" → ${AUTHORS_DIR}/${author.file}\n` +
      `  github_username on file: ${author.github_username || '(empty)'}\n` +
      `  PR author:               ${PR_AUTHOR}\n` +
      `  You can only modify content where you are the curador.`
    );
    continue;
  }

  console.log(`✓ ${path} — curador "${fm.curador}" matches @${PR_AUTHOR}`);
}

if (errors.length > 0) {
  console.error('\nOwnership check failed:\n');
  for (const err of errors) console.error(err + '\n');
  process.exit(1);
}

console.log('\n✓ Ownership check passed.');

// --- Minimal frontmatter parser ---
// Handles only one-line scalar fields (sufficient for nombre, tipo,
// github_username, curador). Block scalars and arrays are ignored
// (their value line is empty or non-matching).
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-z_][a-z0-9_]*):\s*(.*)$/i);
    if (!m) continue;
    let [, key, value] = m;
    value = value.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === '') continue;
    result[key] = value;
  }
  return result;
}
