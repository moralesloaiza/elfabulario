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

// --- Vocabulario controlado de la taxonomía de fábulas ---
// Estos cuatro arrays definen los valores válidos para los campos
// taxonómicos. DEBEN mantenerse sincronizados a mano con los `select` de
// public/admin/config.yml (panel editorial Decap).
//
// Slugs en ASCII: sin tildes ni ñ, separadores con guión. El display
// (con tildes y ñ) se resuelve en las páginas índice mediante un mapa
// slug → display, no se guarda aquí.

const PERSONAJES = [
	// Animales
	'aguila', 'ardilla', 'avispa', 'buho', 'burro', 'caballo', 'camello',
	'cangrejo', 'carnero', 'cerdo', 'ciervo', 'cigarra', 'ciguena', 'cisne',
	'codorniz', 'comadreja', 'conejo', 'culebra', 'elefante', 'escarabajo',
	'gallina', 'gallo', 'ganso', 'gato', 'grulla', 'hormiga', 'jabali',
	'leon', 'leopardo', 'liebre', 'lobo', 'loro', 'mariposa', 'milano',
	'mona', 'mosca', 'murcielago', 'oso', 'paloma', 'pelicano', 'perro',
	'pez', 'raton', 'tigre', 'tortuga', 'toro', 'zarigueya', 'zorro',
	// Roles humanos (humano genérico queda implícito, no se etiqueta)
	'abogado', 'anciano', 'cazador', 'doctor', 'emperador', 'labrador',
	'lechera', 'mago', 'nino', 'pobre', 'principe', 'rey',
	// Entidades míticas
	'hada', 'zeus',
] as const;

const TEMAS = [
	// Con apariciones en el corpus actual
	'adulacion', 'amistad', 'astucia', 'cobardia', 'codicia', 'critica-social',
	'engano', 'esperanza', 'gula', 'guerra', 'hambre', 'ingratitud',
	'inocencia', 'ironia', 'justicia', 'maldad', 'miedo', 'muerte',
	'naturaleza', 'necedad', 'pereza', 'piedad', 'poder', 'prudencia',
	'riqueza', 'sabiduria', 'trabajo', 'traicion', 'trampa', 'venganza',
	'verdad',
	// Anticipando crecimiento del corpus (sin entradas hoy)
	'envidia', 'generosidad', 'humildad', 'lealtad', 'libertad', 'mentira',
	'pobreza', 'soberbia', 'valentia', 'vanidad', 'vejez',
] as const;

const FORMAS = ['prosa', 'verso'] as const;

const TRADICIONES = [
	'budista', 'esopica', 'hispanica', 'oriental', 'popular', 'talmudica',
] as const;

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
			borrador: z.boolean().default(false),

			// --- Taxonomía ---
			// Reemplaza el campo `etiquetas` plano del esquema antiguo.
			// personajes: opcional. Lista cerrada. Humano genérico = implícito.
			// temas:      al menos uno obligatorio. Lista cerrada de moralejas/temas.
			// forma:      obligatorio. 'verso' o 'prosa'.
			// tradicion:  opcional. Tradición fabulística de origen. La primera
			//             migración deja este campo vacío en todas las fábulas;
			//             se llena en una segunda pasada manual.
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
