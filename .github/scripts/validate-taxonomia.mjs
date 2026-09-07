// Valida que los campos de taxonomia de cada fabula usen solo slugs de la
// lista cerrada definida en src/utils/taxonomia.ts (PERSONAJES, TEMAS, FORMAS,
// TRADICIONES). Falla (exit 1) listando cada valor fuera del enum.
//
// Pensado para CI: convierte el criptico [InvalidContentEntryDataError] de
// Astro (que ademas se detiene en el PRIMER archivo y vuelca el enum entero)
// en un informe claro de TODOS los archivos y valores invalidos de una vez.
// Es la red que evita que un lote de metadatos con un slug inventado rompa el
// build de Cloudflare y congele el deploy en silencio.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// ── Enums desde la fuente de verdad ──────────────────────────────────────────
const tax = readFileSync('src/utils/taxonomia.ts', 'utf8');

function extractEnum(name) {
	const m = tax.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`));
	if (!m) {
		console.error(`No se pudo leer el enum ${name} de src/utils/taxonomia.ts`);
		process.exit(1);
	}
	return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

const ENUMS = {
	personajes: { set: extractEnum('PERSONAJES'), multi: true },
	temas: { set: extractEnum('TEMAS'), multi: true },
	forma: { set: extractEnum('FORMAS'), multi: false },
	tradicion: { set: extractEnum('TRADICIONES'), multi: false },
};

// ── Parseo de frontmatter ────────────────────────────────────────────────────
function parseList(fm, key) {
	// inline: key: [a, b, c]
	let m = fm.match(new RegExp(`^${key}:[ \\t]*\\[([^\\]]*)\\]`, 'm'));
	if (m) {
		return m[1]
			.split(',')
			.map((s) => s.trim().replace(/^["']|["']$/g, ''))
			.filter(Boolean);
	}
	// block: key:\n  - a\n  - b
	m = fm.match(new RegExp(`^${key}:[ \\t]*\\n((?:[ \\t]*-[ \\t]*.+\\n?)+)`, 'm'));
	if (m) {
		return [...m[1].matchAll(/-[ \t]*(.+?)[ \t]*$/gm)].map((x) =>
			x[1].trim().replace(/^["']|["']$/g, ''),
		);
	}
	return null;
}

function parseScalar(fm, key) {
	const m = fm.match(new RegExp(`^${key}:[ \\t]*(.+)$`, 'm'));
	if (!m) return null;
	const v = m[1].trim().replace(/^["']|["']$/g, '');
	return v === '' ? null : v;
}

// ── Recorrido de fabulas versionadas ─────────────────────────────────────────
const files = execSync('git ls-files "src/content/fabulas/*.md"', { encoding: 'utf8' })
	.split('\n')
	.map((f) => f.trim())
	.filter(Boolean);

if (files.length === 0) {
	console.log('No se encontraron fabulas que validar.');
	process.exit(0);
}

let hasError = false;
let checked = 0;

for (const file of files) {
	const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
	const match = text.match(/^---\n([\s\S]*?)\n---/);
	if (!match) continue;
	const fm = match[1];
	checked++;

	const bad = [];
	for (const [key, { set, multi }] of Object.entries(ENUMS)) {
		const values = multi ? parseList(fm, key) || [] : [parseScalar(fm, key)].filter(Boolean);
		for (const v of values) {
			if (!set.has(v)) bad.push(`${key}: "${v}"`);
		}
	}

	if (bad.length) {
		hasError = true;
		console.error(`FAIL ${file}`);
		for (const b of bad) console.error(`     valor fuera de la taxonomia -> ${b}`);
	}
}

if (hasError) {
	console.error(
		'\nValidacion de taxonomia fallida: hay valores fuera de la lista cerrada.',
	);
	console.error(
		'Corrige el slug en la fabula, o si es legitimo anadelo en 3 sitios:',
	);
	console.error(
		'  1) el array en src/utils/taxonomia.ts  2) su mapa *_DISPLAY  3) el select en public/admin/config.yml',
	);
	process.exit(1);
}

console.log(`${checked} fabula(s) con taxonomia valida.`);
