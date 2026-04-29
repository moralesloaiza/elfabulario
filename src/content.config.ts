import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Preprocesadores: convierten "" / null en undefined antes de validar.
// Decap CMS escribe campos opcionales vacíos como "" en lugar de omitirlos,
// y z.coerce.* rechaza string vacío. Esto los normaliza.
const emptyToUndefined = (val: unknown) =>
	val === '' || val === null ? undefined : val;

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());
const optionalInt = z.preprocess(emptyToUndefined, z.coerce.number().int().optional());

const fabulas = defineCollection({
	// Carga los archivos Markdown y MDX del directorio `src/content/fabulas/`.
	loader: glob({ base: './src/content/fabulas', pattern: '**/*.{md,mdx}' }),
	// Validación de frontmatter con Zod.
	// IMPORTANTE: este esquema debe mantenerse sincronizado a mano con
	// public/admin/config.yml (panel editorial Decap).
	schema: ({ image }) =>
		z.object({
			// --- Identidad de la fábula ---
			titulo: z.string(),
			resumen: z.string().optional(),
			fecha: z.coerce.date(),
			fecha_actualizada: optionalDate,
			ilustracion: z.optional(image()),
			etiquetas: z.array(z.string()).default([]),
			borrador: z.boolean().default(false),

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

export const collections = { fabulas, entradas };