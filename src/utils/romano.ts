// Numeral romano a partir de un entero positivo (1 → «I», 4 → «IV»,
// 38 → «XXXVIII»). Se usa para numerar las filas de «Sus fábulas» en la ficha
// de autor (Fase 4). Fuera de rango (0, negativos, no enteros) devuelve el
// dígito como cadena, para no romper el render.
const TABLA: ReadonlyArray<readonly [string, number]> = [
	['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
	['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
	['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
];

export function aRomano(n: number): string {
	if (!Number.isInteger(n) || n < 1) return String(n);
	let resto = n;
	let salida = '';
	for (const [simbolo, valor] of TABLA) {
		while (resto >= valor) {
			salida += simbolo;
			resto -= valor;
		}
	}
	return salida;
}
