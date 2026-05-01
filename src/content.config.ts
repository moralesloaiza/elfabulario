import { defineCollection } from 'astro:content';
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

// Los slugs válidos de la taxonomía viven en src/utils/taxonomia.ts.
// Ese módulo es la fuente única de verdad: arrays de slugs + mapas de
// display + bases de URL. DEBE mantenerse sincronizado a mano con los
// `select` de public/admin/config.yml (panel editorial Decap).

const fabulas = defineCollection({
	loader: glob({ base: './src/content/fabulas', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			// --- Identidad de la fábula ---
			titulo: z.string(),
			resumen: z.string().optional(),
			fecha: z.coerce.date(),
			fecha_actualizada: optionalDate,
			ilustracion: z.optional(image()),
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

			// --- Autor (escritor original; siempre nombre real, invariable) ---
			autor: z.string(),
			autor_nacionalidad: z.string().optional(),
			autor_nacimiento: optionalInt,
			autor_muerte: optionalInt,
			autor_siglo: z.string().optional(),

			// --- Curador (quien publica en el blog; puede usar seudónimo) ---
			curador: z.string(),
			es_seudonimo: z.boolean().default(false),
			nombre_real: z.string().optional(),

			// --- Extra ---
			nota_curador: z.string().optional(),
		}),
});

// Colección de entradas: bitácora del blog (anuncios, hitos, biografías de
// colaboradores). No tienen autor histórico ni etiquetas; el curador firma.
const entradas = defineCollection({
	loader: glob({ base: './src/content/entradas', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			titulo: z.string(),
			fecha: z.coerce.date(),
			resumen: z.string().optional(),
			ilustracion: z.optional(image()),
			borrador: z.boolean().default(false),

			curador: z.string(),
			es_seudonimo: z.boolean().default(false),
			nombre_real: z.string().optional(),
		}),
});

// Colección de autores: una entrada por autor (clásico o colaborador).
// El "match" entre una fábula y un autor se hace por coincidencia exacta
// entre `autor` (campo de la fábula) y `nombre` (campo del autor).
// El cuerpo Markdown del archivo es la bio/reseña del autor.
const autores = defineCollection({
	loader: glob({ base: './src/content/autores', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			nombre: z.string(),
			tipo: z.enum(['clasico', 'colaborador']),
			imagen: z.optional(image()),

			nacionalidad: optionalString,
			nacimiento: optionalInt,
			muerte: optionalInt,
			siglo: optionalString,

			nombre_real: optionalString,
			enlaces: z
				.array(z.object({ etiqueta: z.string(), url: z.string().url() }))
				.optional(),
		}),
});

export const collections = { fabulas, entradas, autores };
