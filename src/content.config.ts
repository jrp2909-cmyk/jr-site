import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

// Paginas de funcionalidade (/funcionalidades/<slug>/)
const funcionalidades = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/funcionalidades' }),
  schema: ({ image }) => z.object({
    ordem: z.number(),
    nome: z.string(), // nome curto (menu e cartoes)
    titulo: z.string(), // H1
    seoTitulo: z.string(),
    descricao: z.string(),
    resumo: z.string(), // frase do cartao
    icone: z.string(),
    imagem: image(),
    imagemAlt: z.string(),
    recorte: z.boolean().default(false),
    faq,
    relacionados: z.array(z.string()).default([]),
  }),
});

// Paginas por publico (/para/<slug>/)
const para = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/para' }),
  schema: ({ image }) => z.object({
    ordem: z.number(),
    nome: z.string(),
    titulo: z.string(),
    seoTitulo: z.string(),
    descricao: z.string(),
    resumo: z.string(),
    icone: z.string(),
    imagem: image(),
    imagemAlt: z.string(),
    dores: z.array(z.string()),
    funcionalidades: z.array(z.string()),
    faq,
  }),
});

// Blog: artigos em rascunho so aparecem em `npm run dev` ate o Junior aprovar (draft: false).
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    seoTitulo: z.string().optional(),
    descricao: z.string(),
    data: z.coerce.date(),
    atualizado: z.coerce.date().optional(),
    categoria: z.enum(['Social selling', 'Prospecção', 'Gestão comercial']),
    funcionalidade: z.string().optional(), // slug da funcionalidade ligada ao artigo
    draft: z.boolean().default(true),
    faq,
  }),
});

export const collections = { funcionalidades, para, blog };
