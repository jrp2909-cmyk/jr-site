// Roteiro do video (narracao + legendas).
// `fala` vai para a voz: a marca se PRONUNCIA "Júnior" e "CRM" se le letra por letra ("C R M").
// `legenda` aparece na tela: a marca se ESCREVE JR!.
export const roteiro = [
  { id: 'painel', fala: 'Este é o Júnior C R M. Sua prospecção inteira em um só lugar: metas, temperatura das relações e próximos passos.', legenda: 'Este é o JR! Sua prospecção inteira em um só lugar: metas, temperatura das relações e próximos passos.' },
  { id: 'funil', fala: 'No funil, você vê onde cada empresa está. Filtre por temperatura e descubra quem merece atenção hoje.', legenda: 'No funil, você vê onde cada empresa está. Filtre por temperatura e descubra quem merece atenção hoje.' },
  { id: 'termometro', fala: 'O Júnior mede a temperatura de cada relação. Cada passo conquistado vira pontos, de gelado a em brasa.', legenda: 'O JR! mede a temperatura de cada relação. Cada passo conquistado vira pontos, de Gelado a Em brasa.' },
  { id: 'ia', fala: 'A inteligência artificial usa o contexto do seu cliente e escreve três versões da mensagem. Você escolhe a sua.', legenda: 'A IA usa o contexto do seu cliente e escreve três versões da mensagem. Você escolhe a sua.' },
  { id: 'tarefas', fala: 'As tarefas ficam organizadas por dia, e a cadência mostra o próximo passo em cada canal.', legenda: 'As tarefas ficam organizadas por dia, e a cadência mostra o próximo passo em cada canal.' },
  { id: 'radar', fala: 'O radar acompanha os posts dos seus leads, só em leitura, e sugere como interagir.', legenda: 'O Radar acompanha os posts dos seus leads, só em leitura, e sugere como interagir.' },
  { id: 'assistente', fala: 'Pergunte ao seu C R M, em português, e receba a resposta com os seus dados.', legenda: 'Pergunte ao seu CRM, em português, e receba a resposta com os seus dados.' },
  { id: 'relatorios', fala: 'E preste contas em um clique, com relatórios em três níveis de detalhe.', legenda: 'E preste contas em um clique, com relatórios em três níveis de detalhe.' },
  { id: 'comando', fala: 'A inteligência artificial sugere. Você decide. Nada é enviado sem você.', legenda: 'A IA sugere. Você decide. Nada é enviado sem você.' },
  { id: 'final', fala: 'Júnior C R M. Seja um cliente fundador.', legenda: 'JR! Seja um cliente fundador. jrcrm.com.br' },
];

// Trava de seguranca: a voz leria "JR" como "jota erre" e "CRM" sem as pausas
for (const c of roteiro) {
  if (/\bJR\b|\bCRM\b/.test(c.fala)) throw new Error(`Grafia na fala da cena "${c.id}": escreva "Júnior" e "C R M".`);
}

export const FPS = 30;
export const BPM = 120; // 1 batida = 0,5 s = 15 quadros
export const BATIDA = (60 / BPM) * FPS;
export const TRANSICAO = BATIDA; // cada transicao dura uma batida, e o corte cai no meio dela

// Trechos da animacao do kit de marca (em segundos do arquivo original)
export const KIT = {
  abertura: { de: 1.0, ate: 6.0, velocidade: 1.25 }, // do ponto de luz a logo completa, levemente acelerado
  fim: { de: 1.0, ate: 8.0 }, // a animacao inteira, sem o trecho parado do comeco
  emenda: 0.4, // duracao da passagem entre a animacao e as telas
};
