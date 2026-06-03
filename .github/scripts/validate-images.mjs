// Valida que toda fabula que declare 'ilustracion' apunte a un archivo existente.
// Falla (exit 1) listando cada fabula con imagen faltante.
// Pensado para CI: convierte el criptico [ImageNotFound] de Astro/Vite en un
// mensaje claro antes del build, y evita que una referencia huerfana llegue a main.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

// Fabulas versionadas (respeta .gitignore).
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
	const text = readFileSync(file, 'utf8');

	// Aislar el frontmatter (primer bloque entre delimitadores '---').
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) continue;
	const frontmatter = match[1];

	// Extraer el valor de 'ilustracion' (opcional; si falta, usa imagen por defecto).
	const line = frontmatter.match(/^ilustracion:\s*(.+)$/m);
	if (!line) continue;

	checked++;
	const raw = line[1].trim().replace(/^["']|["']$/g, '');

	// La ruta del frontmatter es absoluta de proyecto ('/src/assets/...').
	// Se normaliza a ruta relativa a la raiz del repo.
	const relative = raw.replace(/^\//, '');

	if (!existsSync(join(process.cwd(), relative))) {
		hasError = true;
		console.error(`FAIL ${file}`);
		console.error(`     ilustracion no encontrada: ${raw}`);
	}
}

if (hasError) {
	console.error('\nValidacion de imagenes fallida: hay fabulas que referencian ilustraciones inexistentes.');
	process.exit(1);
}

console.log(`${checked} fabula(s) con ilustracion validadas correctamente.`);