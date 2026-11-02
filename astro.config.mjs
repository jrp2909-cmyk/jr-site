import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Para trocar para um dominio proprio: defina SITE_URL (ex.: https://www.meudominio.com.br) na Vercel e refaca o deploy.
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://jr-site.vercel.app');

export default defineConfig({
  site,
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
