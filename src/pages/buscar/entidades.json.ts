// src/pages/buscar/entidades.json.ts
// Endpoint estático que sirve el índice de entidades del buscador.
//
// El buscador del sitio combina dos fuentes:
//   1. Pagefind para texto libre del cuerpo de las fábulas.
//   2. Este JSON para entidades de la taxonomía (autor, personaje, tema,
//      forma, tradición), con conteos.
//
// El archivo resultante (~14 KB con 76 fábulas) se hospeda en
// /buscar/entidades.json y se carga una vez al cargar el componente Buscador.
//
// Inclusión: solo entidades con al menos una fábula publicada (no borrador).
// Orden: por conteo descendente, alfabético en empate (locale es).

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
	PERSONAJES_DISPLAY,
	TEMAS_DISPLAY,
	FORMAS_DISPLAY,
	TRADICIONES_DISPLAY,
} from '../../utils/taxonomia';

type TipoEntidad = 'autor' | 'personaje' | 'tema' | 'forma' | 'tradicion';

interface Entidad {
	tipo: TipoEntidad;
	slug: string;
	nombre: string;
	conteo: number;
	url: string;
}

export const GET: APIRoute = async () => {
	const fabulas = await getCollection('fabulas', ({ data }) => !data.borrador);
	const autores = await getCollection('autores');

	// ── Autores ───────────────────────────────────────────────────────────
	// Match por nombre exacto entre fabula.autor y autor.data.nombre, igual
	// que hacen /autores/index.astro y /autores/[slug].astro.
	const conteoAutores = new Map<string, number>();
	for (const f of fabulas) {
		const n = f.data.autor;
		conteoAutores.set(n, (conteoAutores.get(n) ?? 0) + 1);
	}
	const entidadesAutor: Entidad[] = autores
		.map((a) => ({
			tipo: 'autor' as const,
			slug: a.id,
			nombre: a.data.nombre,
			conteo: conteoAutores.get(a.data.nombre) ?? 0,
			url: `/autores/${a.id}/`,
		}))
		.filter((e) => e.conteo > 0);

	// ── Personajes ────────────────────────────────────────────────────────
	const conteoPersonajes = new Map<string, number>();
	for (const f of fabulas) {
		for (const p of f.data.personajes) {
			conteoPersonajes.set(p, (conteoPersonajes.get(p) ?? 0) + 1);
		}
	}
	const entidadesPersonaje: Entidad[] = Array.from(conteoPersonajes.entries()).map(
		([slug, conteo]) => ({
			tipo: 'personaje' as const,
			slug,
			nombre: PERSONAJES_DISPLAY[slug as keyof typeof PERSONAJES_DISPLAY],
			conteo,
			url: `/personajes/${slug}/`,
		}),
	);

	// ── Temas ─────────────────────────────────────────────────────────────
	const conteoTemas = new Map<string, number>();
	for (const f of fabulas) {
		for (const t of f.data.temas) {
			conteoTemas.set(t, (conteoTemas.get(t) ?? 0) + 1);
		}
	}
	const entidadesTema: Entidad[] = Array.from(conteoTemas.entries()).map(
		([slug, conteo]) => ({
			tipo: 'tema' as const,
			slug,
			nombre: TEMAS_DISPLAY[slug as keyof typeof TEMAS_DISPLAY],
			conteo,
			url: `/temas/${slug}/`,
		}),
	);

	// ── Formas ────────────────────────────────────────────────────────────
	const conteoFormas = new Map<string, number>();
	for (const f of fabulas) {
		conteoFormas.set(f.data.forma, (conteoFormas.get(f.data.forma) ?? 0) + 1);
	}
	const entidadesForma: Entidad[] = Array.from(conteoFormas.entries()).map(
		([slug, conteo]) => ({
			tipo: 'forma' as const,
			slug,
			nombre: FORMAS_DISPLAY[slug as keyof typeof FORMAS_DISPLAY],
			conteo,
			url: `/formas/${slug}/`,
		}),
	);

	// ── Tradiciones ───────────────────────────────────────────────────────
	const conteoTradiciones = new Map<string, number>();
	for (const f of fabulas) {
		if (f.data.tradicion) {
			conteoTradiciones.set(
				f.data.tradicion,
				(conteoTradiciones.get(f.data.tradicion) ?? 0) + 1,
			);
		}
	}
	const entidadesTradicion: Entidad[] = Array.from(conteoTradiciones.entries()).map(
		([slug, conteo]) => ({
			tipo: 'tradicion' as const,
			slug,
			nombre: TRADICIONES_DISPLAY[slug as keyof typeof TRADICIONES_DISPLAY],
			conteo,
			url: `/tradiciones/${slug}/`,
		}),
	);

	// ── Ensamblado y orden global ─────────────────────────────────────────
	// Orden estable: primero por conteo desc, luego alfabético por nombre.
	const ordenar = (a: Entidad, b: Entidad) => {
		if (b.conteo !== a.conteo) return b.conteo - a.conteo;
		return a.nombre.localeCompare(b.nombre, 'es');
	};

	const entidades: Entidad[] = [
		...entidadesAutor.sort(ordenar),
		...entidadesPersonaje.sort(ordenar),
		...entidadesTema.sort(ordenar),
		...entidadesForma.sort(ordenar),
		...entidadesTradicion.sort(ordenar),
	];

	return new Response(JSON.stringify(entidades), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};