// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://elfabulario.com',

  integrations: [
      mdx(),
      sitemap({
          i18n: {
              defaultLocale: 'es',
              locales: { es: 'es-ES' },
          },
      }),
	],

  adapter: cloudflare(),
});