import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
			fecha_actualizada: z.coerce.date().optional(),
			ilustracion: z.optional(image()),
			etiquetas: z.array(z.string()).default([]),
			borrador: z.boolean().default(false),

			// --- Autor (escritor original; siempre nombre real, invariable) ---
			autor: z.string(),
			autor_nacionalidad: z.string().optional(),
			autor_nacimiento: z.number().int().optional(),
			autor_muerte: z.number().int().optional(),
			autor_siglo: z.string().optional(),

			// --- Curador (quien publica en el blog; puede usar seudónimo) ---
			curador: z.string(),
			// Indica si la firma del curador es un seudónimo
			es_seudonimo: z.boolean().default(false),
			// Nombre real del curador, opcional y privado — solo registros internos
			nombre_real: z.string().optional(),

			// --- Extra ---
			// Comentario adicional del curador (notas, contexto, aclaraciones)
			nota_curador: z.string().optional(),
		}),
});

export const collections = { fabulas };
