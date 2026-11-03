import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Dominio oficial (www e o principal; o dominio sem www redireciona para ele). SITE_URL pode sobrescrever.
const site = process.env.SITE_URL ?? 'https://www.jrcrm.com.br';
const hoje = new Date().toISOString();

export default defineConfig({
  site,
  trailingSlash: 'always',
  // Paginas estaticas; so a rota do formulario (/api/lista-espera/) roda como funcao na Vercel.
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (url) => !url.includes('/api/') && !url.endsWith('/404/'),
      serialize: (item) => ({ ...item, lastmod: hoje }),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
  // Scripts sempre em arquivo proprio (nunca inline), para a CSP do vercel.json poder usar script-src 'self'.
  vite: { build: { assetsInlineLimit: 0 } },
});
