// Slugifica una cadena: minúsculas, sin acentos, espacios → guiones.
// Usado para construir URLs de etiquetas y para matchear etiquetas
// entre las fábulas (que las guardan en su forma original) y la URL.
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}
