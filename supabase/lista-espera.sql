-- Lista de clientes fundadores do site (www.jrcrm.com.br).
-- Rodar uma vez no SQL Editor do Supabase. O site grava com a chave publica (anon):
-- a politica abaixo so permite INSERT; ninguem consegue ler, alterar ou apagar pela API publica.
-- Para ver os inscritos: Table Editor > lista_espera (o painel do Supabase enxerga tudo).

create table if not exists public.lista_espera (
  id bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  nome text not null check (char_length(nome) between 1 and 120),
  email text not null check (char_length(email) between 3 and 160),
  whatsapp text check (char_length(whatsapp) <= 30),
  perfil text not null check (char_length(perfil) <= 60),
  desafio text check (char_length(desafio) <= 1000),
  origem text not null default 'site' check (char_length(origem) <= 60),
  aceite_privacidade boolean not null check (aceite_privacidade)
);

alter table public.lista_espera enable row level security;

drop policy if exists "site insere" on public.lista_espera;
create policy "site insere" on public.lista_espera
  for insert to anon
  with check (true);

revoke all on public.lista_espera from anon, authenticated;
grant insert on public.lista_espera to anon;
