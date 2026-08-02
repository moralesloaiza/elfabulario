import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
	PERSONAJES,
	TEMAS,
	FORMAS,
	TRADICIONES,
} from './utils/taxonomia';

// Preprocesadores: convierten "" / null en undefined antes de validar.
// Decap CMS escribe campos opcionales vacíos como "" en lugar de omitirlos,
// y z.coerce.* rechaza string vacío. Esto los normaliza.
const emptyToUndefined = (val: unknown) =>
	val === '' || val === null ? undefined : val;

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
const optionalInt = z.preprocess(emptyToUndefined, z.coerce.number().int().optional());
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

// Punto focal vertical de la ilustración/retrato en el hero inmersivo, en %
// desde el borde superior. El hero recortará la imagen a una franja ~8:3
// (ver HeroInmersivo.astro, Fase 1): de una ilustración 3:2 solo se ve algo
// más de la mitad de su alto, y este campo decide QUÉ franja. 0 = pegado
// arriba, 100 = pegado abajo. Sin valor: el componente aplica 8 para
// ilustraciones de fábula/entrada y FOCO_RETRATO (15) para retratos de autor.
const optionalFoco = z.preprocess(
	emptyToUndefined,
	z.coerce.number().min(0).max(100).optional(),
);

// Los slugs válidos de la taxonomía viven en src/utils/taxonomia.ts.
// Ese módulo es la fuente única de verdad: arrays de slugs + mapas de
// display + bases de URL. DEBE mantenerse sincronizado a mano con los
// `select` de public/admin/config.yml (panel editorial Decap).

const fabulas = defineCollection({
	loader: glob({ base: './src/content/fabulas', pattern: '**/*.md' }),
	schema: ({ image }) =>
		z.object({
			// --- Identidad de la fábula ---
			titulo: z.string(),
			resumen: z.string().optional(),
			fecha: z.coerce.date(),
			fecha_actualizada: optionalDate,
			ilustracion: z.optional(image()),
			foco: optionalFoco,
			spotify_url: z.string().url().optional(),
			borrador: z.boolean().default(false),

			// --- Taxonomía ---
			// personajes: opcional. Lista cerrada. Humano genérico = implícito.
			// temas:      al menos uno obligatorio. Lista cerrada.
			// forma:      obligatorio. 'verso' o 'prosa'.
			// tradicion:  opcional. Tradición fabulística de origen.
			personajes: z.array(z.enum(PERSONAJES)).default([]),
			temas: z.array(z.enum(TEMAS)).min(1),
			forma: z.enum(FORMAS),
			tradicion: z.preprocess(emptyToUndefined, z.enum(TRADICIONES).optional()),

			// --- Autor (referencia a la colección `autores`) ---
			// Los datos biográficos (nacionalidad, fechas, siglo) viven en el
			// archivo del autor referenciado, no se duplican en cada fábula.
			autor: reference('autores'),

			// --- Curador (quien publica en el blog; puede usar seudónimo) ---
			curador: z.string(),
			es_seudonimo: z.boolean().default(false),
			nombre_real: z.string().optional(),

			// --- Traducción (opcional) ---
			// Cuando `traduccion: true`, la ficha se presenta como traducción:
			// la nota y el crédito de cierre acreditan a un traductor en lugar
			// del curador. `traductor` es una referencia opcional a `autores`
			// (un colaborador con ficha y slug); si se omite, el crédito cae al
			// string `curador`. Preprocesado emptyToUndefined: Decap escribe ""
			// en relaciones vacías (mismo patrón que `fabula_referida`).
			traduccion: z.boolean().default(false),
			traductor: z.preprocess(emptyToUndefined, reference('autores').optional()),

			// --- Extra ---
			nota_curador: z.string().optional(),
		}),
});

// Colección de entradas: bitácora del blog (anuncios, hitos, biografías de
// colaboradores) y correspondencia (cartas del público con réplica del curador).
// El campo `tipo` discrimina entre ambos formatos. Las cartas se diferencian
// en plantilla mediante un componente <CartaHeader> que se renderiza solo
// cuando tipo='correspondencia'.
const entradas = defineCollection({
	loader: glob({ base: './src/content/entradas', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			titulo: z.string(),
			fecha: z.coerce.date(),
			resumen: z.string().optional(),
			ilustracion: z.optional(image()),
			foco: optionalFoco,
			borrador: z.boolean().default(false),

			curador: z.string(),
			es_seudonimo: z.boolean().default(false),
			nombre_real: z.string().optional(),

			// --- Discriminador de formato ---
			// 'bitacora':       entrada editorial regular (anuncios, hitos, bios).
			// 'correspondencia': carta de un lector con réplica del curador.
			tipo: z.enum(['bitacora', 'correspondencia']).default('bitacora'),

			// --- Campos exclusivos de correspondencia ---
			// `remitente`: nombre publicable del autor de la carta. Para cartas
			//   anónimas se publica como 'Un lector'. Obligatorio si
			//   tipo='correspondencia' (validado abajo en .refine()).
			// `fabula_referida`: opcional. Si la carta discute una fábula concreta,
			//   se enlaza desde el encabezado.
			remitente: optionalString,
			fabula_referida: z.preprocess(
				emptyToUndefined,
				reference('fabulas').optional(),
			),
		}).refine(
			(data) =>
				data.tipo !== 'correspondencia' ||
				(typeof data.remitente === 'string' && data.remitente.length > 0),
			{
				message:
					"Las entradas con tipo='correspondencia' requieren `remitente`. Usa 'Un lector' para cartas anónimas.",
				path: ['remitente'],
			},
		),
});

// Colección de autores: una entrada por autor (clásico o colaborador).
// El "match" entre una fábula y un autor se resuelve por la referencia
// `autor: reference('autores')` del schema de fábulas: el slug del archivo
// del autor (su `id`) es la clave canónica. El campo `nombre` es solo para
// presentación; renombrar un autor no rompe los vínculos.
// El cuerpo Markdown del archivo es la bio/reseña del autor.
const autores = defineCollection({
	loader: glob({ base: './src/content/autores', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			nombre: z.string(),
			tipo: z.enum(['clasico', 'colaborador']),
			imagen: z.optional(image()),
			foco: optionalFoco,

			nacionalidad: optionalString,
			nacimiento: optionalInt,
			muerte: optionalInt,
			siglo: optionalString,

			nombre_real: optionalString,
			github_username: optionalString,
			enlaces: z
				.array(z.object({ etiqueta: z.string(), url: z.string().url() }))
				.optional(),

			// --- Campos canónicos para JSON-LD (Person, schema.org) ---
			// No expuestos en Decap por ahora: solo aplican a autores
			// clásicos y se editan a mano vía Git. Si más adelante hay
			// colaboradores con Wikipedia entry, se exponen en config.yml.
			descripcion: optionalString,
			sameAs: z.array(z.string().url()).optional(),
			lugar_nacimiento: optionalString,
			lugar_muerte: optionalString,
		}),
});

// Colección `destacado`: singleton de configuración curatorial.
// Un único archivo (src/content/destacado/actual.md) describe qué se muestra
// en el slot destacado de la home. Polimórfico: el destacado puede ser una
// fábula, una entrada (bitácora o correspondencia) o un autor.
//
// La validación "el elemento referido tiene imagen" NO se hace aquí (Zod no
// hace cross-collection lookups). Se valida en src/pages/index.astro al
// resolver la referencia; si el target no tiene imagen, el build falla con
// mensaje explícito.
const destacado = defineCollection({
	loader: glob({ base: './src/content/destacado', pattern: '*.md' }),
	schema: z
		.object({
			activo: z.boolean().default(true),
			cintillo: z.string(),
			tipo: z.enum(['fabula', 'entrada', 'autor']),
			fabula_referida: z.preprocess(
				emptyToUndefined,
				reference('fabulas').optional(),
			),
			entrada_referida: z.preprocess(
				emptyToUndefined,
				reference('entradas').optional(),
			),
			autor_referido: z.preprocess(
				emptyToUndefined,
				reference('autores').optional(),
			),
		})
		.refine(
			(data) => {
				if (!data.activo) return true;
				if (data.tipo === 'fabula') return data.fabula_referida !== undefined;
				if (data.tipo === 'entrada') return data.entrada_referida !== undefined;
				if (data.tipo === 'autor') return data.autor_referido !== undefined;
				return false;
			},
			{
				message:
					'Cuando `activo: true`, debes seleccionar el elemento referido del tipo correspondiente.',
				path: ['tipo'],
			},
		),
});

// Colección `paginas`: textos fijos de las páginas del sitio (singletons).
// Un archivo .md por página. `titulo` y `subtitulo` son opcionales porque no
// todas las páginas usan ambos (la home solo tiene subtítulo; su título es
// SITE_TITLE). El cuerpo Markdown se usa solo en las páginas con contenido
// editable (correspondencia, sobre, colaborar). Files-collection equivalente
// en public/admin/config.yml.
const paginas = defineCollection({
	loader: glob({ base: './src/content/paginas', pattern: '*.md' }),
	schema: z.object({
		titulo: optionalString,
		subtitulo: optionalString,
	}),
});

export const collections = { fabulas, entradas, autores, destacado, paginas };