import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const fabulas = defineCollection({
	// Carga los archivos Markdown y MDX del directorio `src/content/fabulas/`.
	loader: glob({ base: './src/content/fabulas', pattern: '**/*.{md,mdx}' }),
	// Validación de frontmatter con Zod
	schema: ({ image }) =>
		z.object({
			titulo: z.string(),
			resumen: z.string(),
			// El nombre que aparecerá públicamente (real o seudónimo)
			autor: z.string(),
			// Marca si el autor firma con seudónimo; útil para filtros e índices
			es_seudonimo: z.boolean().default(false),
			// Nombre real, opcional y privado — solo para registros internos
			nombre_real: z.string().optional(),
			// Convierte strings a Date
			fecha: z.coerce.date(),
			fecha_actualizada: z.coerce.date().optional(),
			ilustracion: z.optional(image()),
			etiquetas: z.array(z.string()).default([]),
			borrador: z.boolean().default(false),
		}),
});

export const collections = { fabulas };
