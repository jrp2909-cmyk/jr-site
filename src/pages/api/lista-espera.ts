// Recebe o formulario de clientes fundadores e grava na tabela `lista_espera` do Supabase.
// Usa a chave publica (anon/publishable): a tabela so aceita INSERT, ninguem consegue ler pela API.
// Variaveis na Vercel: SUPABASE_URL e SUPABASE_ANON_KEY. SQL da tabela: supabase/lista-espera.sql
import type { APIRoute } from 'astro';

export const prerender = false;

const recentes = new Map<string, number[]>(); // limite simples por IP (por instancia da funcao)
const LIMITE = 5, JANELA = 10 * 60_000;

const resp = (status: number, corpo: Record<string, unknown>) =>
  new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const texto = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origem = request.headers.get('origin');
  if (origem && new URL(origem).host !== new URL(request.url).host) return resp(403, { erro: 'origem' });

  let dados: FormData;
  try { dados = await request.formData(); } catch { return resp(400, { erro: 'formato' }); }

  // Robos: campo escondido preenchido ou envio rapido demais (menos de 3 s depois de abrir a pagina).
  const t = Number(dados.get('t'));
  if (texto(dados.get('site'), 10) || !t || Date.now() - t < 3000) return resp(200, { ok: true });

  const ip = clientAddress ?? 'x';
  const agora = Date.now();
  const lista = (recentes.get(ip) ?? []).filter((x) => agora - x < JANELA);
  if (lista.length >= LIMITE) return resp(429, { erro: 'muitos envios' });
  recentes.set(ip, [...lista, agora]);

  const registro = {
    nome: texto(dados.get('nome'), 120),
    email: texto(dados.get('email'), 160).toLowerCase(),
    whatsapp: texto(dados.get('whatsapp'), 30) || null,
    perfil: texto(dados.get('perfil'), 60),
    desafio: texto(dados.get('desafio'), 1000) || null,
    origem: texto(dados.get('origem'), 60) || 'site',
    aceite_privacidade: dados.get('aceite') === 'on',
  };
  if (!registro.nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registro.email) || !registro.perfil || !registro.aceite_privacidade) {
    return resp(422, { erro: 'campos' });
  }

  const url = import.meta.env.SUPABASE_URL ?? process.env.SUPABASE_URL;
  const chave = import.meta.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !chave) return resp(503, { erro: 'nao configurado' });

  const r = await fetch(`${url}/rest/v1/lista_espera`, {
    method: 'POST',
    headers: { apikey: chave, authorization: `Bearer ${chave}`, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(registro),
  });
  if (!r.ok) {
    console.error('lista_espera', r.status, await r.text());
    return resp(502, { erro: 'falha ao gravar' });
  }
  return resp(201, { ok: true });
};
