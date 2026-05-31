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
	'abeja', 'aguila', 'arana', 'ardilla', 'avestruz', 'avispa', 'avutarda',
	'buey', 'buho', 'burro', 'caballo', 'cabra', 'camello', 'cangrejo',
	'caracol', 'carnero', 'cerdo', 'chivo', 'ciervo', 'cigarra', 'ciguena',
	'cisne', 'cocodrilo', 'codorniz', 'comadreja', 'conejo', 'cordero', 'cuclillo',
	'cuervo', 'culebra', 'elefante', 'escarabajo', 'faisan', 'gallina', 'gallo',
	'ganso', 'gato', 'gorrion', 'grillo', 'grulla', 'gusano', 'hormiga',
	'huron', 'jabali', 'jilguero', 'lagarto', 'lechuza', 'leon', 'leopardo',
	'liebre', 'lobo', 'loro', 'mariposa', 'marmota', 'milano', 'mochuelo',
	'mona', 'mono', 'mosca', 'mosquito', 'mula', 'murcielago', 'oruga',
	'oso', 'oveja', 'paloma', 'pato', 'pava', 'pavo', 'pelicano',
	'perdiz', 'perro', 'pez', 'pulga', 'rana', 'raton', 'renacuajo',
	'ruisenor', 'sanguijuela', 'sapo', 'serpiente', 'tigre', 'topo', 'tordo',
	'toro', 'tortuga', 'urraca', 'zangano', 'zarigueya', 'zorro',
	// Roles humanos
	'abogado', 'amo', 'anciano', 'caminante', 'carretero', 'cazador', 'chalan',
	'ciego', 'cojo', 'criada', 'doctor', 'emperador', 'enfermo', 'erudito',
	'filosofo', 'juez', 'labrador', 'ladron', 'lechera', 'mago', 'manco',
	'medico', 'mudo', 'naturalista', 'nino', 'pastor', 'picaro', 'pobre',
	'poeta', 'principe', 'rey', 'rustico', 'sordo', 'titiritero', 'trapero',
	'zapatero',
	// Entidades míticas
	'amor', 'fantasma', 'hada', 'locura', 'muerte', 'vision', 'zeus',
] as const;

export const TEMAS = [
	'adulacion', 'amistad', 'astucia', 'cobardia', 'codicia', 'critica-literaria',
	'critica-social', 'engano', 'envidia', 'esperanza', 'generosidad', 'guerra',
	'gula', 'hambre', 'hipocresia', 'humildad', 'ingratitud', 'inocencia',
	'ironia', 'justicia', 'lealtad', 'libertad', 'maldad', 'mar',
	'mentira', 'miedo', 'muerte', 'naturaleza', 'necedad', 'pereza',
	'piedad', 'pobreza', 'poder', 'prudencia', 'riqueza', 'sabiduria',
	'soberbia', 'trabajo', 'traicion', 'trampa', 'valentia', 'vanidad',
	'vejez', 'venganza', 'verdad',
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
	abeja: 'Abeja',
	aguila: 'Águila',
	arana: 'Araña',
	ardilla: 'Ardilla',
	avestruz: 'Avestruz',
	avispa: 'Avispa',
	avutarda: 'Avutarda',
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
	cuclillo: 'Cuclillo',
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
	grillo: 'Grillo',
	grulla: 'Grulla',
	gusano: 'Gusano',
	hormiga: 'Hormiga',
	huron: 'Hurón',
	jabali: 'Jabalí',
	jilguero: 'Jilguero',
	lagarto: 'Lagarto',
	lechuza: 'Lechuza',
	leon: 'León',
	leopardo: 'Leopardo',
	liebre: 'Liebre',
	lobo: 'Lobo',
	loro: 'Loro',
	mariposa: 'Mariposa',
	marmota: 'Marmota',
	milano: 'Milano',
	mochuelo: 'Mochuelo',
	mona: 'Mona',
	mono: 'Mono',
	mosca: 'Mosca',
	mosquito: 'Mosquito',
	mula: 'Mula',
	murcielago: 'Murciélago',
	oruga: 'Oruga',
	oso: 'Oso',
	oveja: 'Oveja',
	paloma: 'Paloma',
	pato: 'Pato',
	pava: 'Pava',
	pavo: 'Pavo',
	pelicano: 'Pelícano',
	perdiz: 'Perdiz',
	perro: 'Perro',
	pez: 'Pez',
	pulga: 'Pulga',
	rana: 'Rana',
	raton: 'Ratón',
	renacuajo: 'Renacuajo',
	ruisenor: 'Ruiseñor',
	sanguijuela: 'Sanguijuela',
	sapo: 'Sapo',
	serpiente: 'Serpiente',
	tigre: 'Tigre',
	topo: 'Topo',
	tordo: 'Tordo',
	toro: 'Toro',
	tortuga: 'Tortuga',
	urraca: 'Urraca',
	zangano: 'Zángano',
	zarigueya: 'Zarigüeya',
	zorro: 'Zorro',
	// Roles humanos
	abogado: 'abogado',
	amo: 'amo',
	anciano: 'anciano',
	caminante: 'caminante',
	carretero: 'carretero',
	cazador: 'cazador',
	chalan: 'chalan',
	ciego: 'Ciego',
	cojo: 'cojo',
	criada: 'Criada',
	doctor: 'doctor',
	emperador: 'emperador',
	enfermo: 'enfermo',
	erudito: 'Erudito',
	filosofo: 'filosofo',
	juez: 'Juez',
	labrador: 'labrador',
	ladron: 'ladron',
	lechera: 'lechera',
	mago: 'mago',
	manco: 'Manco',
	medico: 'medico',
	mudo: 'Mudo',
	naturalista: 'Naturalista',
	nino: 'nino',
	pastor: 'pastor',
	picaro: 'picaro',
	pobre: 'pobre',
	poeta: 'poeta',
	principe: 'principe',
	rey: 'rey',
	rustico: 'rustico',
	sordo: 'Sordo',
	titiritero: 'titiritero',
	trapero: 'Trapero',
	zapatero: 'zapatero',
	// Entidades míticas
	amor: 'amor',
	fantasma: 'fantasma',
	hada: 'hada',
	locura: 'locura',
	muerte: 'Muerte',
	vision: 'vision',
	zeus: 'zeus',
};

export const TEMAS_DISPLAY: Record<Tema, string> = {
	adulacion: 'Adulación',
	amistad: 'Amistad',
	astucia: 'Astucia',
	cobardia: 'Cobardía',
	codicia: 'Codicia',
	'critica-literaria': 'Crítica literaria',
	'critica-social': 'Crítica social',
	engano: 'Engaño',
	envidia: 'Envidia',
	esperanza: 'Esperanza',
	generosidad: 'Generosidad',
	guerra: 'Guerra',
	gula: 'Gula',
	hambre: 'Hambre',
	hipocresia: 'hipocresia',
	humildad: 'humildad',
	ingratitud: 'Ingratitud',
	inocencia: 'Inocencia',
	ironia: 'Ironía',
	justicia: 'Justicia',
	lealtad: 'Lealtad',
	libertad: 'Libertad',
	maldad: 'Maldad',
	mar: 'Mar',
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
