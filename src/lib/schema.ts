// Dados estruturados (schema.org) reaproveitados pelas paginas.
import { LINKEDIN, SITE_NOME } from '../data/site';

export const SITE = 'https://www.jrcrm.com.br';
const abs = (p: string) => new URL(p, SITE).href;

export const ORG_ID = `${SITE}/#org`;
export const AUTOR_ID = `${SITE}/sobre/#junior`;

export const organizacao = () => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NOME,
  alternateName: 'JR!',
  url: `${SITE}/`,
  logo: abs('/icone-256.png'),
  founder: { '@id': AUTOR_ID },
  sameAs: [LINKEDIN],
});

export const autor = () => ({
  '@type': 'Person',
  '@id': AUTOR_ID,
  name: 'Junior Pereira',
  jobTitle: 'Profissional de pré-vendas e criador do JR!',
  url: abs('/sobre/'),
  sameAs: [LINKEDIN],
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': `${SITE}/#site`,
  url: `${SITE}/`,
  name: SITE_NOME,
  inLanguage: 'pt-BR',
  publisher: { '@id': ORG_ID },
});

export const software = (descricao: string, url = '/') => ({
  '@type': 'SoftwareApplication',
  name: SITE_NOME,
  alternateName: 'JR!',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'CRM de social selling',
  operatingSystem: 'Web',
  url: abs(url),
  description: descricao,
  inLanguage: 'pt-BR',
  publisher: { '@id': ORG_ID },
});

export const faqPage = (itens: { q: string; a: string }[]) =>
  itens.length
    ? {
        '@type': 'FAQPage',
        mainEntity: itens.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
      }
    : null;

export const migalhas = (itens: { nome: string; href: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: itens.map((i, k) => ({ '@type': 'ListItem', position: k + 1, name: i.nome, item: abs(i.href) })),
});

export const artigo = (a: { titulo: string; descricao: string; url: string; data: Date; atualizado?: Date; imagem: string }) => ({
  '@type': 'BlogPosting',
  headline: a.titulo,
  description: a.descricao,
  url: abs(a.url),
  mainEntityOfPage: abs(a.url),
  datePublished: a.data.toISOString(),
  dateModified: (a.atualizado ?? a.data).toISOString(),
  image: abs(a.imagem),
  inLanguage: 'pt-BR',
  author: { '@id': AUTOR_ID },
  publisher: { '@id': ORG_ID },
});

export const video = () => ({
  '@type': 'VideoObject',
  name: 'O JR! por dentro: telas reais do CRM de social selling',
  description: 'Telas reais do JR!, CRM de social selling: painel, funil, termômetro de relacionamento, IA com o contexto do cliente, tarefas e cadências, radar, assistente e relatórios. Dados fictícios.',
  thumbnailUrl: abs('/media/poster.webp'),
  contentUrl: abs('/media/jr-demo.mp4'),
  uploadDate: '2026-11-04',
  duration: 'PT1M18S',
  inLanguage: 'pt-BR',
});
