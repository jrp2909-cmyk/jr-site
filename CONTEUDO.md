# Conteúdo do site do JR!: como revisar, publicar e o calendário

## Como revisar os artigos (rascunhos)

Os artigos ficam em `src/content/blog/`, um arquivo `.md` por artigo. Todos começam com `draft: true`
(rascunho): **não aparecem no site publicado**, só no computador.

1. No PowerShell, dentro da pasta `C:\Users\usuario\jr-site`:
   ```
   $env:Path = "$HOME\tools\node;$HOME\tools\git\cmd;" + $env:Path
   npm run dev
   ```
2. Abra http://localhost:4321/blog/. Os rascunhos aparecem com a etiqueta "Rascunho".
3. Para corrigir um texto, edite o arquivo `.md` (o navegador atualiza sozinho).

## Como publicar um artigo

1. No topo do arquivo, troque `draft: true` por `draft: false`.
2. Atualize `data:` para o dia da publicação (formato `2026-11-10`).
3. Rode `node scripts/og.mjs` (gera a imagem de compartilhamento) e `npm run build` (confere se está tudo certo).
4. Faça o commit e o `git push`. A Vercel publica sozinha.

Atenção: os artigos têm links entre si. Se publicar um de cada vez, confira se os links apontam para artigos já publicados.
O glossário esconde sozinho os links para artigos que ainda são rascunho.

## Os 6 artigos-pilar (prontos para revisão)

| Arquivo | Palavra-chave principal | Liga com |
|---|---|---|
| social-selling-guia-pratico-b2b | o que é social selling | Termômetro |
| como-prospectar-no-linkedin | como prospectar no linkedin | Radar |
| modelos-de-mensagem-de-conexao-no-linkedin | mensagem de conexão linkedin | IA |
| cadencia-de-prospeccao-multicanal | cadência de prospecção | Cadências |
| follow-up-na-prospeccao | follow-up vendas | Funil e tarefas |
| relatorio-de-prospeccao-para-diretoria | relatório de prospecção | Relatórios |

Sugestão de ritmo: publicar 2 por semana nas 3 primeiras semanas e, depois, seguir o calendário.

## Calendário editorial (2 a 4 artigos por mês)

| Mês | Tema | Palavra-chave | Liga com |
|---|---|---|---|
| Dez/26 | Como usar o SSI do LinkedIn a seu favor | ssi linkedin | Termômetro |
| Dez/26 | Prospecção para quem atende vários clientes (pré-vendas PJ) | pré-vendas terceirizado | Vários clientes |
| Dez/26 | Como comentar posts no LinkedIn para gerar conversas | comentar no linkedin vendas | Radar |
| Jan/27 | ICP e personas para prospecção B2B, com modelo | icp b2b | IA (fit) |
| Jan/27 | SDR x BDR: diferenças e como medir cada um | sdr e bdr | SDRs |
| Jan/27 | Primeira mensagem depois da conexão aceita: 10 exemplos | mensagem após conexão linkedin | IA |
| Fev/27 | Lead scoring de relacionamento: além de cliques e aberturas | lead scoring | Termômetro |
| Fev/27 | WhatsApp na prospecção B2B: quando usar e como não incomodar | whatsapp prospecção | Cadências |
| Fev/27 | Como preparar uma reunião de descoberta | reunião de descoberta | Assistente |
| Mar/27 | Metas de atividade de prospecção: quantos toques por dia? | metas sdr | Painel |
| Mar/27 | Como mapear o comitê de compra numa venda B2B | comitê de compra | IA (cargos) |
| Mar/27 | Social selling para CEOs: como o dono pode prospectar | social selling ceo | CEOs |

Regras para todo artigo (as mesmas do site): nada de números inventados, depoimentos ou promessas de resultado;
dados de exemplo sempre fictícios; o JR! "sugere", nunca "automatiza o LinkedIn".

## Imagens de compartilhamento

`node scripts/og.mjs` gera `public/og.jpg` e uma imagem por funcionalidade, público e artigo em `public/og/`.
Rode de novo sempre que criar uma página ou mudar um título.

## Vídeo

O vídeo é feito em código, com Remotion, na pasta `scripts/video3/`:

- `roteiro.mjs`: texto da narração e das legendas.
- `node preparar.mjs`: gera a voz e calcula os tempos.
- `node render.mjs`: renderiza o vídeo do site e as versões para as redes, em `scripts/video3/saida/redes/`.
- Para ver e ajustar as cenas no navegador: `npx remotion studio` dentro de `scripts/video3`.
