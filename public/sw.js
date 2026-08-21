/* El Fabulario · Service Worker (hecho a mano, sin dependencias)
   ---------------------------------------------------------------
   Estrategia POR TIPO de recurso. Un sitio estático que se
   redespliega a menudo no puede servir HTML cacheado a ciegas: las
   páginas deben ir NETWORK-FIRST para no quedarse obsoletas, mientras
   que los assets con hash de /_astro/ son inmutables y van CACHE-FIRST.

   Para invalidar todas las cachés en un despliegue, sube VERSION.       */

const VERSION = 'v1';
const STATIC_CACHE = `fab-static-${VERSION}`; // precache (offline.html)
const PAGES_CACHE = `fab-pages-${VERSION}`; // documentos HTML (network-first)
const ASSETS_CACHE = `fab-assets-${VERSION}`; // /_astro/ y otros GET (SWR)

const OFFLINE_URL = '/offline.html';

// Cachés vigentes en esta versión. `activate` borra todo lo demás.
const CURRENT_CACHES = new Set([STATIC_CACHE, PAGES_CACHE, ASSETS_CACHE]);

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(STATIC_CACHE);
			await cache.add(OFFLINE_URL);
			await self.skipWaiting();
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys();
			await Promise.all(
				names.map((name) =>
					CURRENT_CACHES.has(name) ? undefined : caches.delete(name),
				),
			);
			await self.clients.claim();
		})(),
	);
});

// Permite que la página fuerce la activación de un SW en espera.
self.addEventListener('message', (event) => {
	if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Solo GET del mismo origen. Todo lo demás (POST, cross-origin como
	// los embeds de Spotify) pasa directo a la red sin intervención.
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	// Navegaciones (clic/URL): NETWORK-FIRST con respaldo a caché y offline.
	const accept = request.headers.get('Accept') || '';
	const isNavigation =
		request.mode === 'navigate' || accept.includes('text/html');
	if (isNavigation) {
		event.respondWith(networkFirst(request));
		return;
	}

	// Assets con hash de Astro: inmutables → CACHE-FIRST.
	if (url.pathname.startsWith('/_astro/')) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// Índice de Pagefind: cambia en cada build conservando el mismo nombre,
	// así que NO se cachea (passthrough directo a la red).
	if (url.pathname.startsWith('/pagefind/')) {
		return;
	}

	// Resto del mismo origen (CSS, fuentes, imágenes, JSON): STALE-WHILE-REVALIDATE.
	event.respondWith(staleWhileRevalidate(request));
});

// Pide fresco; si la red responde ok, cachea y sirve. Si la red falla,
// sirve de la caché de páginas y, en último término, la página offline.
async function networkFirst(request) {
	const cache = await caches.open(PAGES_CACHE);
	try {
		const response = await fetch(request);
		if (response && response.ok) cache.put(request, response.clone());
		return response;
	} catch (err) {
		const cached = await cache.match(request);
		if (cached) return cached;
		const offline = await caches.match(OFFLINE_URL);
		if (offline) return offline;
		throw err;
	}
}

// Sirve de caché si existe; si no, red (y cachea si es ok).
async function cacheFirst(request) {
	const cache = await caches.open(ASSETS_CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response && response.ok) cache.put(request, response.clone());
	return response;
}

// Sirve de caché al instante y revalida en segundo plano.
async function staleWhileRevalidate(request) {
	const cache = await caches.open(ASSETS_CACHE);
	const cached = await cache.match(request);
	const network = fetch(request)
		.then((response) => {
			if (response && response.ok) cache.put(request, response.clone());
			return response;
		})
		.catch(() => undefined);
	return cached || network || fetch(request);
}
