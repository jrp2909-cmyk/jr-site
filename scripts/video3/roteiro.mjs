// Roteiro do video (narracao + legendas). "Júnior C R M" e a pronuncia da marca JR!.
// `legenda` e o texto que aparece na tela (com a grafia da marca); `fala` vai para a voz.
export const roteiro = [
  { id: 'intro', fala: 'Júnior C R M. Relacionamento desde o primeiro contato.', legenda: 'JR! Relacionamento desde o 1º contato.' },
  { id: 'problema', fala: 'Follow-up esquecido. Planilha que não entende de gente. E a pergunta de todo dia: quem merece atenção hoje?', legenda: 'Follow-up esquecido. Planilha que não entende de gente. E a pergunta de todo dia: quem merece atenção hoje?' },
  { id: 'termometro', fala: 'O JR! mede a temperatura de cada relação. Conexão aceita, resposta, dor mapeada: cada passo vira pontos, de gelado a em brasa.', legenda: 'O JR! mede a temperatura de cada relação. Conexão aceita, resposta, dor mapeada: cada passo vira pontos, de Gelado a Em brasa.' },
  { id: 'funil', fala: 'O funil se move sozinho. E o próximo passo aparece na hora certa.', legenda: 'O funil se move sozinho. E o próximo passo aparece na hora certa.' },
  { id: 'ia', fala: 'A inteligência artificial lê o contexto do seu cliente e escreve três versões da mensagem. Você escolhe a sua.', legenda: 'A IA lê o contexto do seu cliente e escreve três versões da mensagem. Você escolhe a sua.' },
  { id: 'radar', fala: 'O radar acompanha o LinkedIn dos seus leads, só em leitura, e sugere como interagir.', legenda: 'O Radar acompanha o LinkedIn dos seus leads, só em leitura, e sugere como interagir.' },
  { id: 'assistente', fala: 'Pergunte ao seu C R M. E preste contas em um clique.', legenda: 'Pergunte ao seu CRM. E preste contas em um clique.' },
  { id: 'comando', fala: 'A IA sugere. Você decide. Nada é enviado sem você.', legenda: 'A IA sugere. Você decide. Nada é enviado sem você.' },
  { id: 'final', fala: 'Júnior C R M. Seja um cliente fundador.', legenda: 'JR! Seja um cliente fundador. jrcrm.com.br' },
];

export const FPS = 30;
export const BPM = 120; // 1 batida = 0,5 s = 15 quadros
export const BATIDA = (60 / BPM) * FPS;
export const TRANSICAO = BATIDA; // cada transicao dura uma batida, e o corte cai no meio dela
