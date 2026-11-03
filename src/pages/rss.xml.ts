import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', (p) => !p.data.draft)).sort((a, b) => b.data.data.getTime() - a.data.data.getTime());
  return rss({
    title: 'JR! — Social selling na prática',
    description: 'Guias de social selling e prospecção B2B, por quem faz pré-vendas todos os dias.',
    site: context.site!,
    items: posts.map((p) => ({ title: p.data.titulo, description: p.data.descricao, pubDate: p.data.data, link: `/blog/${p.id}/` })),
    customData: '<language>pt-BR</language>',
  });
}
