// Número en letras, en FEMENINO (concuerda con «fábulas»): 1 → «una»,
// 212 → «doscientas doce». Se usa en la cartela de archivo de la portada
// («Doscientas doce fábulas»). Soporta 0–9999, de sobra para el recuento de
// fábulas; por encima devuelve el dígito como cadena.

const ESPECIALES: Record<number, string> = {
	0: 'cero', 10: 'diez', 11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce',
	15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho',
	19: 'diecinueve', 20: 'veinte', 21: 'veintiuna', 22: 'veintidós',
	23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco', 26: 'veintiséis',
	27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve',
};
const UNIDADES = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientas', 'trescientas', 'cuatrocientas', 'quinientas', 'seiscientas', 'setecientas', 'ochocientas', 'novecientas'];

function menorMil(n: number): string {
	if (n in ESPECIALES) return ESPECIALES[n];
	if (n < 10) return UNIDADES[n];
	if (n < 100) {
		const d = Math.floor(n / 10);
		const u = n % 10;
		return u ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d];
	}
	if (n === 100) return 'cien';
	const c = Math.floor(n / 100);
	const r = n % 100;
	return r ? `${CENTENAS[c]} ${menorMil(r)}` : CENTENAS[c];
}

export function numeroEnLetrasFem(n: number): string {
	if (!Number.isInteger(n) || n < 0) return String(n);
	if (n < 1000) return menorMil(n);
	if (n < 10000) {
		const miles = Math.floor(n / 1000);
		const r = n % 1000;
		const prefijo = miles === 1 ? 'mil' : `${menorMil(miles)} mil`;
		return r ? `${prefijo} ${menorMil(r)}` : prefijo;
	}
	return String(n);
}

/** Igual, con la primera letra en mayúscula: «Doscientas doce». */
export function numeroEnLetrasFemCap(n: number): string {
	const s = numeroEnLetrasFem(n);
	return s.charAt(0).toUpperCase() + s.slice(1);
}
