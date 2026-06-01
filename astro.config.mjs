// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';
// https://astro.build/config
export default defineConfig({
	site: 'https://elfabulario.com',
	markdown: {
		remarkPlugins: [remarkBreaks],
		// Los enlaces externos del Markdown (fabulas, entradas, paginas) abren en
		// pestana nueva con rel de seguridad. Reemplaza el target="_blank" que
		// antes vivia hardcodeado en las plantillas de sobre/colaborar.
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{ target: '_blank', rel: ['noopener', 'noreferrer'] },
			],
		],
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
		}),
		pagefind(),
	],
});