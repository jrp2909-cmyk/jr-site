// Roteiro do video: texto falado, legendas na tela e imagens de cada cena.
// "Junior C R M" e a pronuncia do nome (a marca escrita e JR!).
const D = 'src/assets/desktop/';
const R = 'src/assets/recortes/';
const M = 'src/assets/mobile/';

export const cenas = [
  {
    id: 'intro', min: 3.6,
    fala: 'Júnior C R M. Relacionamento desde o primeiro contato.',
    tipo: 'logo', legenda: ['Relacionamento desde o 1º contato'],
  },
  {
    id: 'problema', min: 5,
    fala: 'Follow-up esquecido. Planilha que não entende de relacionamento. E a dúvida de sempre: quem merece atenção hoje?',
    tipo: 'texto',
    linhas: [['Follow-up esquecido.', 'ffffff'], ['Planilha não entende de relacionamento.', 'ffffff'], ['Quem merece atenção hoje?', 'f97316']],
  },
  {
    id: 'painel', min: 4,
    fala: 'Seu dia em um painel: metas, termômetro e tarefas, tudo num só lugar.',
    tipo: 'telas', legenda: ['Seu dia em um painel', 'Metas, termômetro, indicadores e tarefas'],
    visuais: [
      { img: D + '01-dashboard.png', z: [1.0, 1.2], f: [[0.5, 0.3], [0.45, 0.4]] },
      { img: D + '02-dashboard-graficos-e-tarefas.png', z: [1.15, 1.0], f: [[0.4, 0.55], [0.5, 0.5]] },
    ],
  },
  {
    id: 'termometro', min: 4,
    fala: 'O termômetro dá uma nota de zero a cem para cada empresa. Cada passo da relação vira pontos.',
    tipo: 'termometro', legenda: ['Termômetro de relacionamento', 'Nota de 0 a 100 por empresa e pessoa'],
  },
  {
    id: 'funil', min: 4,
    fala: 'Clique em quente, e veja só quem merece atenção agora.',
    tipo: 'clipe', ss: 9.2, legenda: ['Clique em Quente', 'e veja só quem merece atenção'],
  },
  {
    id: 'ia', min: 4,
    fala: 'A inteligência artificial escreve três versões da mensagem, com o contexto do seu cliente. Você revisa e escolhe.',
    tipo: 'telas', legenda: ['IA com o contexto do cliente', 'Três versões. Você escolhe.'],
    visuais: [{ img: D + '07-empresa-escrever-com-ia.png', z: [1.1, 1.38], f: [[0.3, 0.45], [0.38, 0.62]] }],
  },
  {
    id: 'tarefas', min: 4,
    fala: 'O próximo passo nasce sozinho. E o radar mostra o que seus leads estão fazendo.',
    tipo: 'telas', legenda: ['Tarefas que nascem sozinhas', 'Radar do LinkedIn: só leitura'],
    visuais: [
      { img: D + '08-tarefas.png', z: [1.0, 1.25], f: [[0.55, 0.3], [0.5, 0.45]] },
      { img: D + '09-radar.png', z: [1.2, 1.0], f: [[0.5, 0.4], [0.55, 0.5]] },
    ],
  },
  {
    id: 'assistente', min: 4,
    fala: 'Pergunte ao seu C R M. O assistente responde sobre os seus dados, e nunca altera nada.',
    tipo: 'clipe', ss: 35.5, legenda: ['Pergunte ao seu CRM', 'O assistente só lê. Nunca altera.'],
  },
  {
    id: 'relatorios', min: 4,
    fala: 'Relatórios simples, médios ou detalhados, prontos para enviar.',
    tipo: 'relatorios', legenda: ['Relatórios em um clique', 'Simplificado · Médio · Detalhado'],
  },
  {
    id: 'celular', min: 3.5,
    fala: 'No computador, ou no celular.',
    tipo: 'celulares', legenda: ['No computador e no celular'],
  },
  {
    id: 'comando', min: 4.5,
    fala: 'A IA sugere. Você decide. Nada é enviado sem você.',
    tipo: 'comando', legenda: null,
  },
  {
    id: 'final', min: 5,
    fala: 'Júnior C R M. Você constrói relações, e ele cuida do resto. Fale com o Júnior pelo WhatsApp.',
    tipo: 'logo', logoPequeno: true, legenda: ['Quero conhecer o JR!', 'WhatsApp (48) 99973-5087 · Junior Pereira'],
  },
];

