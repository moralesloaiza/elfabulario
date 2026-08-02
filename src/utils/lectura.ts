// Estimación de tiempo de lectura en minutos a partir del cuerpo Markdown de
// una fábula. El sitio muestra "Lectura · N min" (nunca "Audio": la acción de
// referencia es leer). 180 ppm es un ritmo prudente para prosa/verso literario
// en español; las fábulas son cortas, así que el mínimo es 1 minuto.
const PALABRAS_POR_MINUTO = 180;

export function tiempoLecturaMin(texto: string | undefined | null): number {
	if (!texto) return 1;
	const palabras = texto.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));
}
