// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import remarkBreaks from 'remark-breaks';

// https://astro.build/config
export default defineConfig({
	site: 'https://elfabulario.com',
	markdown: {
		remarkPlugins: [remarkBreaks],
	},
	integrations: [
		sitemap({
			// /buscar/ es una SERP (resultados de búsqueda), no contenido
			// indexable. Se excluye del sitemap para evitar que Google la
			// rastree como página de contenido.
			filter: (page) => !page.endsWith('/buscar/'),
			i18n: {
				defaultLocale: 'es',
				locales: { es: 'es-ES' },
			},
		}),		pagefind(),
	],
});