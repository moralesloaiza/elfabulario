import type { CollectionEntry } from 'astro:content';
import {
	PERSONAJES_DISPLAY,
	TEMAS_DISPLAY,
	TRADICIONES_DISPLAY,
} from './taxonomia';

// Canonical origin. Kept here (not imported from Astro) so helper
// functions stay pure and testable in isolation.
const SITE_ORIGIN = 'https://elfabulario.com';

// Publisher entity. Emitted inline (not by reference) inside every
// ShortStory so the JSON-LD block is self-contained. `logo` will be
// added in PR #12 alongside the favicon redesign.
export const PUBLISHER = {
	'@type': 'Organization',
	'@id': `${SITE_ORIGIN}/#publisher`,
	name: 'El Fabulario',
	url: SITE_ORIGIN,
} as const;

// Resolve an Astro asset path (which carries a build hash) to an
// absolute URL using the configured site.
function absoluteUrl(path: string, site: URL): string {
	return new URL(path, site).href;
}

// Spotify embed URL → canonical resource URL.
// open.spotify.com/embed/episode/<id> → open.spotify.com/episode/<id>.
// Also handles /embed/track/ and regional prefixes like /embed/intl-es/.
export function spotifyToCanonical(url: string): string {
	return url.replace('/embed/', '/');
}

// Flatten taxonomía into a comma-separated keywords string for SEO.
// `forma` is intentionally omitted: no schema.org property maps to it
// and the verse/prose distinction is not useful for discovery.
export function taxonomiaToKeywords(
	personajes: readonly string[],
	temas: readonly string[],
	tradicion: string | undefined,
): string | undefined {
	const labels: string[] = [];
	for (const p of personajes) {
		const label = PERSONAJES_DISPLAY[p as keyof typeof PERSONAJES_DISPLAY];
		if (label) labels.push(label);
	}
	for (const t of temas) {
		const label = TEMAS_DISPLAY[t as keyof typeof TEMAS_DISPLAY];
		if (label) labels.push(label);
	}
	if (tradicion) {
		const label = TRADICIONES_DISPLAY[tradicion as keyof typeof TRADICIONES_DISPLAY];
		if (label) labels.push(label);
	}
	return labels.length > 0 ? labels.join(', ') : undefined;
}

// Minimal Person reference for embedding as `author` of a ShortStory.
// The canonical Person (with biography, dates, sameAs) lives at the
// author's own page; search engines unify entities by matching @id.
function personReference(autor: CollectionEntry<'autores'>, site: URL) {
	const autorUrl = absoluteUrl(`/autores/${autor.id}/`, site);
	return {
		'@type': 'Person',
		'@id': `${autorUrl}#person`,
		name: autor.data.nombre,
		url: autorUrl,
	};
}

// Build the `editor` field from the curator metadata. When the curator
// signs under a pseudonym and the real name is recorded, the real name
// is exposed as `alternateName` per schema.org conventions.
function buildEditor(
	curador: string,
	esSeudonimo: boolean,
	nombreReal: string | undefined,
) {
	const editor: Record<string, unknown> = {
		'@type': 'Person',
		name: curador,
	};
	if (esSeudonimo && nombreReal) editor.alternateName = nombreReal;
	return editor;
}

// Input shape matches what Fabula.astro receives via Astro.props:
// the entry's `data` flattened, plus `id` injected by the page.
type FabulaInput = CollectionEntry<'fabulas'>['data'] & { id: string };

// Build a ShortStory JSON-LD object for a fábula page.
export function buildFabulaJsonLd(
	fabula: FabulaInput,
	autor: CollectionEntry<'autores'>,
	site: URL,
): Record<string, unknown> {
	const canonical = absoluteUrl(`/fabulas/${fabula.id}/`, site);
	const datePublished = fabula.fecha.toISOString();
	const dateModified = (fabula.fecha_actualizada ?? fabula.fecha).toISOString();

	const data: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'ShortStory',
		'@id': `${canonical}#shortstory`,
		name: fabula.titulo,
		headline: fabula.titulo,
		inLanguage: 'es',
		genre: 'Fábula',
		url: canonical,
		mainEntityOfPage: canonical,
		datePublished,
		dateModified,
		author: personReference(autor, site),
		editor: buildEditor(fabula.curador, fabula.es_seudonimo, fabula.nombre_real),
		publisher: PUBLISHER,
	};

	if (fabula.resumen) data.description = fabula.resumen;
	if (fabula.ilustracion) data.image = absoluteUrl(fabula.ilustracion.src, site);

	const keywords = taxonomiaToKeywords(fabula.personajes, fabula.temas, fabula.tradicion);
	if (keywords) data.keywords = keywords;

	if (fabula.spotify_url) {
		data.associatedMedia = {
			'@type': 'AudioObject',
			name: fabula.titulo,
			contentUrl: spotifyToCanonical(fabula.spotify_url),
			embedUrl: fabula.spotify_url,
		};
	}

	return data;
}

// Build a Person JSON-LD object for an author page. The "anonimo" slug
// gets a minimal Person with name "Anónimo" and nothing else, matching
// how anonymous authorship is modelled in the collection.
export function buildAutorJsonLd(
	autor: CollectionEntry<'autores'>,
	site: URL,
): Record<string, unknown> {
	const canonical = absoluteUrl(`/autores/${autor.id}/`, site);
	const isAnonimo = autor.id === 'anonimo';

	const data: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': `${canonical}#person`,
		name: autor.data.nombre,
		url: canonical,
	};

	if (isAnonimo) return data;

	if (autor.data.descripcion) data.description = autor.data.descripcion;
	if (autor.data.nacionalidad) data.nationality = autor.data.nacionalidad;
	if (autor.data.nacimiento) data.birthDate = String(autor.data.nacimiento);
	if (autor.data.muerte) data.deathDate = String(autor.data.muerte);
	if (autor.data.lugar_nacimiento) {
		data.birthPlace = { '@type': 'Place', name: autor.data.lugar_nacimiento };
	}
	if (autor.data.lugar_muerte) {
		data.deathPlace = { '@type': 'Place', name: autor.data.lugar_muerte };
	}
	if (autor.data.imagen) data.image = absoluteUrl(autor.data.imagen.src, site);
	if (autor.data.sameAs && autor.data.sameAs.length > 0) {
		data.sameAs = autor.data.sameAs;
	}

	return data;
}

// Site-wide WebSite entity. Emitted only on the home page (canonical
// place for the site's identity). Hard-coded name/description match
// SITE_TITLE/SITE_DESCRIPTION in consts.ts; if those change, update here.
//
// The potentialAction (SearchAction) is honest: /buscar/ reads ?q= from
// the URL and dispatches Pagefind automatically on load. Google retired
// the Sitelinks Search Box feature in late 2024, but the markup remains
// valid schema.org and is consumed by Bing, voice assistants, and LLM agents.
export function buildWebSiteJsonLd(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_ORIGIN}/#website`,
		name: 'El Fabulario',
		url: SITE_ORIGIN,
		description: 'Colección de fábulas en español.',
		inLanguage: 'es',
		publisher: { '@id': `${SITE_ORIGIN}/#publisher` },
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${SITE_ORIGIN}/buscar/?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	};
}

// Build a BreadcrumbList JSON-LD object from an ordered list of crumbs.
// The last item should be the current page. URLs are emitted for every
// item (Google accepts both omitting and including the leaf URL).
export function buildBreadcrumbJsonLd(
	items: Array<{ name: string; path: string }>,
	site: URL,
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: absoluteUrl(item.path, site),
		})),
	};
}