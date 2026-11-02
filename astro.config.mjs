import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio oficial (www e o principal; o dominio sem www redireciona para ele). SITE_URL pode sobrescrever.
const site = process.env.SITE_URL ?? 'https://www.jrcrm.com.br';

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
