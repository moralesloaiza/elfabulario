// Fuente única de verdad para la taxonomía de fábulas.
//
// Los arrays `as const` definen los slugs válidos. El esquema Zod en
// `src/content.config.ts` los importa para sus enums; las páginas y
// layouts importan los mapas *_DISPLAY para renderizar.
//
// Si añades un slug aquí:
//   1. Súmalo al array correspondiente.
//   2. Añade su entrada en el mapa _DISPLAY del mismo grupo.
//   3. Sincroniza `public/admin/config.yml` (los `select` de Decap).

// ── Slugs ───────────────────────────────────────────────────────────────────

export const PERSONAJES = [
	// Animales
	'aguila', 'ardilla', 'avispa', 'buho', 'burro', 'caballo', 'camello',
	'cangrejo', 'carnero', 'cerdo', 'ciervo', 'cigarra', 'ciguena', 'cisne',
	'codorniz', 'comadreja', 'conejo', 'culebra', 'elefante', 'escarabajo',
	'gallina', 'gallo', 'ganso', 'gato', 'grulla', 'hormiga', 'jabali',
	'leon', 'leopardo', 'liebre', 'lobo', 'loro', 'mariposa', 'milano',
	'mona', 'mosca', 'murcielago', 'oso', 'paloma', 'pelicano', 'perro',
	'pez', 'raton', 'tigre', 'tortuga', 'toro', 'zarigueya', 'zorro',
	// Roles humanos
	'abogado', 'anciano', 'cazador', 'doctor', 'emperador', 'labrador',
	'lechera', 'mago', 'nino', 'pobre', 'principe', 'rey',
	// Entidades míticas
	'hada', 'zeus',
] as const;

export const TEMAS = [
	'adulacion', 'amistad', 'astucia', 'cobardia', 'codicia', 'critica-social',
	'engano', 'envidia', 'esperanza', 'generosidad', 'gula', 'guerra',
	'hambre', 'humildad', 'ingratitud', 'inocencia', 'ironia', 'justicia',
	'lealtad', 'libertad', 'maldad', 'mentira', 'miedo', 'muerte',
	'naturaleza', 'necedad', 'pereza', 'piedad', 'pobreza', 'poder',
	'prudencia', 'riqueza', 'sabiduria', 'soberbia', 'trabajo', 'traicion',
	'trampa', 'valentia', 'vanidad', 'vejez', 'venganza', 'verdad',
] as const;

export const FORMAS = ['prosa', 'verso'] as const;

export const TRADICIONES = [
	'budista', 'esopica', 'hispanica', 'oriental', 'popular', 'talmudica',
] as const;

// ── Tipos derivados ─────────────────────────────────────────────────────────

export type Personaje = (typeof PERSONAJES)[number];
export type Tema = (typeof TEMAS)[number];
export type Forma = (typeof FORMAS)[number];
export type Tradicion = (typeof TRADICIONES)[number];

// ── Mapas slug → display ────────────────────────────────────────────────────

export const PERSONAJES_DISPLAY: Record<Personaje, string> = {
	// Animales
	aguila: 'Águila',
	ardilla: 'Ardilla',
	avispa: 'Avispa',
	buho: 'Búho',
	burro: 'Burro',
	caballo: 'Caballo',
	camello: 'Camello',
	cangrejo: 'Cangrejo',
	carnero: 'Carnero',
	cerdo: 'Cerdo',
	ciervo: 'Ciervo',
	cigarra: 'Cigarra',
	ciguena: 'Cigüeña',
	cisne: 'Cisne',
	codorniz: 'Codorniz',
	comadreja: 'Comadreja',
	conejo: 'Conejo',
	culebra: 'Culebra',
	elefante: 'Elefante',
	escarabajo: 'Escarabajo',
	gallina: 'Gallina',
	gallo: 'Gallo',
	ganso: 'Ganso',
	gato: 'Gato',
	grulla: 'Grulla',
	hormiga: 'Hormiga',
	jabali: 'Jabalí',
	leon: 'León',
	leopardo: 'Leopardo',
	liebre: 'Liebre',
	lobo: 'Lobo',
	loro: 'Loro',
	mariposa: 'Mariposa',
	milano: 'Milano',
	mona: 'Mona',
	mosca: 'Mosca',
	murcielago: 'Murciélago',
	oso: 'Oso',
	paloma: 'Paloma',
	pelicano: 'Pelícano',
	perro: 'Perro',
	pez: 'Pez',
	raton: 'Ratón',
	tigre: 'Tigre',
	tortuga: 'Tortuga',
	toro: 'Toro',
	zarigueya: 'Zarigüeya',
	zorro: 'Zorro',
	// Roles humanos
	abogado: 'Abogado',
	anciano: 'Anciano',
	cazador: 'Cazador',
	doctor: 'Doctor',
	emperador: 'Emperador',
	labrador: 'Labrador',
	lechera: 'Lechera',
	mago: 'Mago',
	nino: 'Niño',
	pobre: 'Pobre',
	principe: 'Príncipe',
	rey: 'Rey',
	// Entidades míticas
	hada: 'Hada',
	zeus: 'Zeus',
};

export const TEMAS_DISPLAY: Record<Tema, string> = {
	adulacion: 'Adulación',
	amistad: 'Amistad',
	astucia: 'Astucia',
	cobardia: 'Cobardía',
	codicia: 'Codicia',
	'critica-social': 'Crítica social',
	engano: 'Engaño',
	envidia: 'Envidia',
	esperanza: 'Esperanza',
	generosidad: 'Generosidad',
	gula: 'Gula',
	guerra: 'Guerra',
	hambre: 'Hambre',
	humildad: 'Humildad',
	ingratitud: 'Ingratitud',
	inocencia: 'Inocencia',
	ironia: 'Ironía',
	justicia: 'Justicia',
	lealtad: 'Lealtad',
	libertad: 'Libertad',
	maldad: 'Maldad',
	mentira: 'Mentira',
	miedo: 'Miedo',
	muerte: 'Muerte',
	naturaleza: 'Naturaleza',
	necedad: 'Necedad',
	pereza: 'Pereza',
	piedad: 'Piedad',
	pobreza: 'Pobreza',
	poder: 'Poder',
	prudencia: 'Prudencia',
	riqueza: 'Riqueza',
	sabiduria: 'Sabiduría',
	soberbia: 'Soberbia',
	trabajo: 'Trabajo',
	traicion: 'Traición',
	trampa: 'Trampa',
	valentia: 'Valentía',
	vanidad: 'Vanidad',
	vejez: 'Vejez',
	venganza: 'Venganza',
	verdad: 'Verdad',
};

export const FORMAS_DISPLAY: Record<Forma, string> = {
	prosa: 'Prosa',
	verso: 'Verso',
};

export const TRADICIONES_DISPLAY: Record<Tradicion, string> = {
	budista: 'Budista',
	esopica: 'Esópica',
	hispanica: 'Hispánica',
	oriental: 'Oriental',
	popular: 'Popular',
	talmudica: 'Talmúdica',
};

// ── Bases de URL para las páginas índice ────────────────────────────────────

export const URL_PERSONAJES = '/personajes';
export const URL_TEMAS = '/temas';
export const URL_FORMAS = '/formas';
export const URL_TRADICIONES = '/tradiciones';
