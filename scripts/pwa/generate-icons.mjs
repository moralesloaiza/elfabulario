/**
 * Genera los iconos PWA de El Fabulario desde public/logo.svg.
 *
 *   node scripts/pwa/generate-icons.mjs      (o: npm run pwa:icons)
 *
 * Salidas en public/icons/:
 *   icon-192.png            logo a sangre, fondo transparente
 *   icon-512.png            logo a sangre, fondo transparente
 *   icon-maskable-512.png   logo al 80% centrado sobre fondo navy sólido
 *                           (safe zone de Android: recorta sin comerse la F)
 *   apple-touch-icon.png    180×180, logo a sangre sobre navy sólido
 *                           (iOS no respeta la transparencia)
 *
 * DEPENDENCIA `sharp`:
 *   Este proyecto ya lista `sharp` entre sus dependencias (lo usa Astro para
 *   procesar imágenes), así que el script funciona sin instalar nada extra.
 *   Si en un futuro `sharp` dejara de estar disponible, instálalo de forma
 *   PUNTUAL solo para regenerar iconos y quítalo después, dejando el
 *   package-lock.json intacto:
 *       npm i -D sharp && npm run pwa:icons && npm uninstall sharp
 *   Los PNG generados SÍ se commitean; `sharp` no debe quedar como dep fija
 *   añadida por este flujo.
 */

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const SRC_LOGO = join(ROOT, 'public', 'logo.svg');
const OUT_DIR = join(ROOT, 'public', 'icons');

// Tono oscuro dominante del logo (el rombo interior). Fondo sólido de los
// iconos que no admiten transparencia (maskable en Android, Apple touch).
const NAVY = '#0F1B3D';

async function renderLogo(size) {
	// Rasteriza el SVG a `size`px con canal alfa (fondo transparente).
	return sharp(SRC_LOGO, { density: 384 })
		.resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
		.png()
		.toBuffer();
}

async function bleed(size, out) {
	// Logo a sangre, transparente.
	await sharp(await renderLogo(size)).png().toFile(join(OUT_DIR, out));
	console.log(`✓ ${out} (${size}×${size}, transparente)`);
}

async function onSolid(size, out, inner = size) {
	// Logo (a `inner`px) centrado sobre fondo navy sólido de `size`px.
	const logo = await renderLogo(inner);
	const pad = Math.round((size - inner) / 2);
	await sharp({
		create: {
			width: size,
			height: size,
			channels: 4,
			background: NAVY,
		},
	})
		.composite([{ input: logo, top: pad, left: pad }])
		.png()
		.toFile(join(OUT_DIR, out));
	console.log(`✓ ${out} (${size}×${size}, fondo ${NAVY}, logo ${inner}px)`);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	// Iconos "any": logo a sangre, transparente.
	await bleed(192, 'icon-192.png');
	await bleed(512, 'icon-512.png');

	// Maskable: logo al 80% sobre navy, dejando la safe zone para el recorte.
	await onSolid(512, 'icon-maskable-512.png', Math.round(512 * 0.8));

	// Apple touch: logo a sangre sobre navy (iOS ignora la transparencia).
	await onSolid(180, 'apple-touch-icon.png', 180);

	console.log('\nListo. Iconos en public/icons/');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
