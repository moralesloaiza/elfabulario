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
	'aguila', 'ardilla', 'avispa', 'buey', 'buho', 'burro', 'caballo',
	'cabra', 'camello', 'cangrejo', 'caracol', 'carnero', 'cerdo', 'chivo',
	'ciervo', 'cigarra', 'ciguena', 'cisne', 'cocodrilo', 'codorniz',
	'comadreja', 'conejo', 'cordero', 'cuervo', 'culebra', 'elefante',
	'escarabajo', 'faisan', 'gallina', 'gallo', 'ganso', 'gato', 'gorrion',
	'grulla', 'hormiga', 'jabali', 'leon', 'leopardo', 'liebre', 'lobo',
	'loro', 'mariposa', 'milano', 'mochuelo', 'mona', 'mono', 'mosca',
	'murcielago', 'oso', 'oveja', 'paloma', 'pava', 'pelicano', 'perdiz',
	'perro', 'pez', 'pulga', 'rana', 'raton', 'ruisenor', 'serpiente',
	'tigre', 'tordo', 'toro', 'tortuga', 'zarigueya', 'zorro',
	// Roles humanos
        'abogado', 'amo', 'anciano', 'caminante', 'carretero', 'cazador',
        'chalan', 'cojo', 'doctor', 'emperador', 'enfermo', 'filosofo',
        'labrador', 'ladron', 'lechera', 'mago', 'medico', 'nino', 'pastor',
        'picaro', 'pobre', 'poeta', 'principe', 'rey', 'rustico', 'titiritero',
        'zapatero',
	// Entidades míticas
        'fantasma', 'hada', 'muerte', 'zeus',
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
	buey: 'Buey',
	buho: 'Búho',
	burro: 'Burro',
	caballo: 'Caballo',
	cabra: 'Cabra',
	camello: 'Camello',
	cangrejo: 'Cangrejo',
	caracol: 'Caracol',
	carnero: 'Carnero',
	cerdo: 'Cerdo',
	chivo: 'Chivo',
	ciervo: 'Ciervo',
	cigarra: 'Cigarra',
	ciguena: 'Cigüeña',
	cisne: 'Cisne',
	cocodrilo: 'Cocodrilo',
	codorniz: 'Codorniz',
	comadreja: 'Comadreja',
	conejo: 'Conejo',
	cordero: 'Cordero',
	cuervo: 'Cuervo',
	culebra: 'Culebra',
	elefante: 'Elefante',
	escarabajo: 'Escarabajo',
	faisan: 'Faisán',
	gallina: 'Gallina',
	gallo: 'Gallo',
	ganso: 'Ganso',
	gato: 'Gato',
	gorrion: 'Gorrión',
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
	mochuelo: 'Mochuelo',
	mona: 'Mona',
	mono: 'Mono',
	mosca: 'Mosca',
	murcielago: 'Murciélago',
	oso: 'Oso',
	oveja: 'Oveja',
	paloma: 'Paloma',
	pava: 'Pava',
	pelicano: 'Pelícano',
	perdiz: 'Perdiz',
	perro: 'Perro',
	pez: 'Pez',
	pulga: 'Pulga',
	rana: 'Rana',
	raton: 'Ratón',
	ruisenor: 'Ruiseñor',
	serpiente: 'Serpiente',
	tigre: 'Tigre',
	tordo: 'Tordo',
	toro: 'Toro',
	tortuga: 'Tortuga',
	zarigueya: 'Zarigüeya',
	zorro: 'Zorro',
	// Roles humanos
        abogado: 'Abogado',
        amo: 'Amo',
        anciano: 'Anciano',
        caminante: 'Caminante',
        carretero: 'Carretero',
        cazador: 'Cazador',
        chalan: 'Chalán',
        cojo: 'Cojo',
        doctor: 'Doctor',
        emperador: 'Emperador',
        enfermo: 'Enfermo',
        filosofo: 'Filósofo',
        labrador: 'Labrador',
        ladron: 'Ladrón',
        lechera: 'Lechera',
        mago: 'Mago',
        medico: 'Médico',
        nino: 'Niño',
        pastor: 'Pastor',
        picaro: 'Pícaro',
        pobre: 'Pobre',
        poeta: 'Poeta',
        principe: 'Príncipe',
        rey: 'Rey',
        rustico: 'Rústico',
        titiritero: 'Titiritero',
        zapatero: 'Zapatero',
	// Entidades míticas
        fantasma: 'Fantasma',
        hada: 'Hada',
        muerte: 'Muerte',
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
