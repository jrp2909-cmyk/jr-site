import { getCollection } from 'astro:content';

// Rascunhos (draft: true) aparecem so no `npm run dev`, para o Junior revisar antes de publicar.
export const postsPublicados = async () =>
  (await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft)).sort(
    (a, b) => b.data.data.getTime() - a.data.data.getTime(),
  );

export const tempoLeitura = (texto = '') => Math.max(1, Math.round(texto.split(/\s+/).length / 200));
