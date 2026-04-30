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
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

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

// Colección de autores: una entrada por autor (clásico o colaborador).
// El "match" entre una fábula y un autor se hace por coincidencia exacta
// entre `autor` (campo de la fábula) y `nombre` (campo del autor).
// El cuerpo Markdown del archivo es la bio/reseña del autor.
const autores = defineCollection({
	loader: glob({ base: './src/content/autores', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			// Nombre visible del autor. DEBE coincidir, exacto, con el campo
			// `autor` que las fábulas usan para referirse a esta persona.
			nombre: z.string(),

			// 'clasico'    : autor histórico cuyo trabajo se cura en el blog
			//                (Samaniego, Esopo, Iriarte, Anónimo, etc.).
			// 'colaborador': persona viva con cuenta en el blog que publica
			//                aquí. Tiene "página bio" en lugar de página de
			//                autor clásica (sin fechas/nacionalidad obligatorias).
			tipo: z.enum(['clasico', 'colaborador']),

			imagen: z.optional(image()),

			// --- Datos biográficos (clásicos) ---
			nacionalidad: optionalString,
			nacimiento: optionalInt,
			muerte: optionalInt,
			// Para autores cuya fecha exacta se desconoce.
			// Ej.: "VI a.C." o "XII".
			siglo: optionalString,

			// --- Solo colaboradores ---
			// Nombre real del colaborador, opcional y privado.
			// Si el colaborador firma con seudónimo, su archivo de autor usa
			// el seudónimo en `nombre` y guarda aquí el nombre legal.
			// Este campo NO se renderiza en ninguna página pública.
			nombre_real: optionalString,
			// Enlaces externos del colaborador (web, Instagram, etc.).
			enlaces: z
				.array(z.object({ etiqueta: z.string(), url: z.string().url() }))
				.optional(),
		}),
});

export const collections = { fabulas, entradas, autores };
