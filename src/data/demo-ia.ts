// Roteiro da demonstracao "Teste o JR!" (tudo ficticio). As mensagens sao pre-escritas:
// o site nao chama nenhuma IA. Cliente (projeto) da demo: Orbita Cloud, gestao financeira na nuvem.

export const PROJETO = {
  nome: 'Órbita Cloud',
  oferta: 'gestão financeira na nuvem para médias empresas',
  dores: 'fechamento do mês lento, planilhas paralelas, retrabalho entre financeiro e comercial',
};

export type Canal = 'conexao' | 'dm' | 'email';
export const CANAIS: { id: Canal; nome: string }[] = [
  { id: 'conexao', nome: 'Nota de conexão' },
  { id: 'dm', nome: 'DM no LinkedIn' },
  { id: 'email', nome: 'E-mail' },
];

type Versao = { estrategia: string; texto: string; assunto?: string };
export type Lead = {
  id: string;
  nome: string;
  cargo: string;
  empresa: string;
  setor: string;
  nota: number;
  faixa: string;
  situacao: string;
  post: string;
  recomendado: Canal;
  porque: string;
  versoes: Record<Canal, Versao[]>;
};

export const LEADS: Lead[] = [
  {
    id: 'marina',
    nome: 'Marina Costa',
    cargo: 'Diretora Financeira',
    empresa: 'Vértice Logística',
    setor: 'Transporte e logística · 300 pessoas',
    nota: 25,
    faixa: 'Morno',
    situacao: 'Ainda não conectada. Dados de contato completos.',
    post: '“Fechamento do mês ainda depende de planilha que só uma pessoa entende. Alguém mais vive isso?”',
    recomendado: 'conexao',
    porque: 'A conexão ainda não existe e ela acabou de publicar sobre uma dor que a Órbita Cloud resolve. Comece pela nota de conexão, citando o post, sem vender.',
    versoes: {
      conexao: [
        { estrategia: 'Responder ao post com empatia', texto: 'Oi, Marina! Li seu post sobre a planilha que só uma pessoa entende e me identifiquei com a pergunta. Converso bastante com times financeiros sobre fechamento do mês e adoraria acompanhar o que você publica. Vamos nos conectar?' },
        { estrategia: 'Curiosidade sobre o setor', texto: 'Oi, Marina! Vi seu post sobre o fechamento do mês. Em logística isso costuma pesar ainda mais, com frete, notas e centros de custo espalhados. Fiquei curioso sobre como vocês organizam isso hoje. Posso te adicionar?' },
        { estrategia: 'Curta e leve', texto: 'Oi, Marina! Seu post sobre fechamento do mês rendeu uma boa conversa por aqui. Gosto de trocar ideias com quem lidera finanças. Bora conectar?' },
      ],
      dm: [
        { estrategia: 'Abrir conversa a partir do post', texto: 'Oi, Marina, tudo bem? Obrigado por aceitar. Fiquei pensando no seu post: quando o fechamento depende de uma planilha que só uma pessoa entende, qualquer férias vira risco. Hoje vocês já têm algum plano para reduzir essa dependência, ou ainda está no “vamos ver depois”?' },
        { estrategia: 'Oferecer algo útil antes de pedir', texto: 'Oi, Marina! Obrigado pela conexão. Separei um checklist curto que times financeiros usam para encurtar o fechamento do mês, sem trocar de sistema. Quer que eu te mande? Se fizer sentido, depois a gente troca uma ideia sobre o que mais pesa aí na Vértice.' },
        { estrategia: 'Pergunta direta e respeitosa', texto: 'Oi, Marina! Vi que o fechamento do mês é um tema para você. Pergunta sincera: o que mais toma tempo hoje, a conciliação ou juntar os números do comercial? Pergunto porque é exatamente o que a Órbita Cloud ajuda a resolver, mas antes quero entender se faz sentido no seu caso.' },
      ],
      email: [
        { estrategia: 'Gancho no post, pedido pequeno', assunto: 'A planilha que só uma pessoa entende', texto: 'Olá, Marina,\n\nVi seu post sobre o fechamento do mês e a planilha que só uma pessoa entende. É uma das dores que mais ouço de diretoras financeiras em empresas de logística.\n\nNa Órbita Cloud, ajudamos times financeiros a centralizar esses números na nuvem, com o comercial alimentando os dados direto, sem planilha paralela.\n\nFaz sentido conversarmos 15 minutos para eu entender como é o processo aí na Vértice?\n\nAbraço,' },
        { estrategia: 'Foco no risco do negócio', assunto: 'E se essa pessoa sair de férias?', texto: 'Olá, Marina,\n\nQuando o fechamento depende de uma pessoa e de uma planilha, o risco não é só demorar: é a empresa decidir com números atrasados.\n\nTrabalho com a Órbita Cloud, que tira essa dependência com fechamento organizado na nuvem e acesso para quem precisa.\n\nSe for útil, te mostro em uma conversa curta como outras empresas de logística estruturaram isso. Qual dia é melhor para você?\n\nAbraço,' },
        { estrategia: 'Curto, para ler no celular', assunto: 'Fechamento do mês na Vértice', texto: 'Oi, Marina,\n\nSeu post sobre o fechamento do mês me chamou atenção. A Órbita Cloud resolve exatamente isso para médias empresas.\n\nVale uma conversa de 15 minutos?\n\nAbraço,' },
      ],
    },
  },
  {
    id: 'rafael',
    nome: 'Rafael Mendes',
    cargo: 'Diretor de Operações',
    empresa: 'Lótus Bem-estar',
    setor: 'Rede de clínicas · 12 unidades',
    nota: 48,
    faixa: 'Aquecendo',
    situacao: 'Conectado. Respondeu uma vez, perguntando sobre integrações.',
    post: '“Inauguramos a 12ª unidade! Agora o desafio é manter o padrão em todas.”',
    recomendado: 'dm',
    porque: 'A conversa já começou e ele perguntou sobre integrações. A DM é o canal natural: parabenize pela unidade nova e responda a pergunta dele de forma específica.',
    versoes: {
      conexao: [
        { estrategia: 'Parabenizar pela conquista', texto: 'Oi, Rafael! Parabéns pela 12ª unidade da Lótus. Manter o padrão com tantas clínicas é um desafio e tanto, e gosto de acompanhar quem está crescendo assim. Vamos nos conectar?' },
        { estrategia: 'Tema de operação', texto: 'Oi, Rafael! Vi a inauguração da 12ª unidade. Padronizar a operação financeira entre clínicas é um tema que acompanho de perto. Posso te adicionar?' },
        { estrategia: 'Curta', texto: 'Oi, Rafael! Parabéns pela nova unidade. Bora conectar?' },
      ],
      dm: [
        { estrategia: 'Retomar a pergunta sobre integrações', texto: 'Oi, Rafael! Parabéns pela 12ª unidade, que fase! Sobre a sua pergunta de integrações: antes de mandar algo genérico, me conta quais sistemas vocês usam hoje nas clínicas e no financeiro? Assim te respondo com o que vale para o caso da Lótus.' },
        { estrategia: 'Conectar crescimento e padronização', texto: 'Oi, Rafael! Vi a inauguração, parabéns. Com 12 unidades, imagino que juntar os números de cada clínica no fim do mês já dê trabalho. É aí que a Órbita Cloud costuma ajudar: integra as unidades e o financeiro em um lugar só. Quer ver como ficaria com os sistemas que vocês já usam?' },
        { estrategia: 'Leve, deixando a decisão com ele', texto: 'Oi, Rafael! Parabéns pela unidade nova. Sei que a semana deve estar corrida, então fica simples: quando for um bom momento para falar de integrações, me diz o dia e eu me adapto. Se não for agora, a gente retoma depois.' },
      ],
      email: [
        { estrategia: 'Resposta técnica e objetiva', assunto: 'Integrações da Órbita Cloud com as clínicas', texto: 'Olá, Rafael,\n\nParabéns pela 12ª unidade da Lótus!\n\nRetomando sua pergunta sobre integrações: a Órbita Cloud conecta os sistemas das unidades ao financeiro central, para que o fechamento consolide todas as clínicas sem planilha.\n\nPara te responder com precisão, quais sistemas vocês usam hoje? Com isso, preparo uma demonstração com o cenário da Lótus.\n\nAbraço,' },
        { estrategia: 'Crescimento sem perder o controle', assunto: '12 unidades, um só fechamento', texto: 'Olá, Rafael,\n\nCrescer para 12 unidades é ótimo, e o desafio que você citou, manter o padrão, também vale para o financeiro.\n\nPosso te mostrar em 20 minutos como outras redes consolidam os números de todas as unidades em um painel só?\n\nAbraço,' },
        { estrategia: 'Curto', assunto: 'Sobre as integrações', texto: 'Oi, Rafael,\n\nParabéns pela nova unidade! Sobre integrações: me conta quais sistemas vocês usam e eu te mostro como ficaria na Órbita Cloud.\n\nAbraço,' },
      ],
    },
  },
  {
    id: 'paula',
    nome: 'Paula Ribeiro',
    cargo: 'CEO',
    empresa: 'Nexo Engenharia',
    setor: 'Engenharia e obras · 180 pessoas',
    nota: 64,
    faixa: 'Quente',
    situacao: 'Conversa ativa por 3 canais. Dor mapeada: retrabalho entre financeiro e comercial.',
    post: '“Crescer com disciplina de caixa é o que separa empresas boas de empresas duradouras.”',
    recomendado: 'email',
    porque: 'A relação está quente e a dor já foi mapeada. É hora de propor a apresentação por e-mail, com uma pauta clara para a CEO levar o financeiro junto.',
    versoes: {
      conexao: [
        { estrategia: 'Referência ao post', texto: 'Oi, Paula! Seu post sobre crescer com disciplina de caixa resume bem o que vejo nas empresas que duram. Seria ótimo acompanhar suas publicações. Vamos nos conectar?' },
        { estrategia: 'Tema de liderança', texto: 'Oi, Paula! Acompanho CEOs que olham o caixa de perto e gostei do seu ponto de vista. Posso te adicionar?' },
        { estrategia: 'Curta', texto: 'Oi, Paula! Gostei do seu post sobre disciplina de caixa. Bora conectar?' },
      ],
      dm: [
        { estrategia: 'Ligar o post à dor mapeada', texto: 'Oi, Paula! Seu post sobre disciplina de caixa tem tudo a ver com o que você me contou do retrabalho entre o financeiro e o comercial. Que tal 30 minutos para eu mostrar como a Órbita Cloud resolveria isso na Nexo? Se puder, chama alguém do financeiro também.' },
        { estrategia: 'Propor próximo passo concreto', texto: 'Oi, Paula! Pensando na nossa última conversa, preparei uma demonstração com o cenário da Nexo: o comercial lançando as medições e o financeiro fechando sem retrabalho. Terça ou quinta à tarde fica bom?' },
        { estrategia: 'Respeitar a agenda da CEO', texto: 'Oi, Paula! Sei que a agenda de CEO é disputada, então fica simples: se fizer sentido, me indica alguém do financeiro e eu alinho a apresentação com essa pessoa, te copiando no resumo. Pode ser?' },
      ],
      email: [
        { estrategia: 'Convite com pauta clara', assunto: 'Pauta: fim do retrabalho entre financeiro e comercial', texto: 'Olá, Paula,\n\nComo combinamos, proponho uma apresentação de 30 minutos com esta pauta:\n\n1. Como o retrabalho entre financeiro e comercial acontece hoje na Nexo\n2. Como a Órbita Cloud integra os dois times\n3. Próximos passos, se fizer sentido\n\nSeria ótimo ter alguém do financeiro junto. Terça às 15h ou quinta às 10h, qual fica melhor?\n\nAbraço,' },
        { estrategia: 'Conectar à visão da CEO', assunto: 'Disciplina de caixa sem retrabalho', texto: 'Olá, Paula,\n\nSeu post sobre crescer com disciplina de caixa ficou na minha cabeça. Disciplina de caixa depende de números confiáveis e no prazo, e isso fica difícil quando financeiro e comercial refazem o mesmo trabalho.\n\nPosso apresentar em 30 minutos como a Órbita Cloud resolve isso? Se puder, traga alguém do financeiro.\n\nAbraço,' },
        { estrategia: 'Curto e direto', assunto: 'Apresentação para a Nexo', texto: 'Oi, Paula,\n\nPreparei uma apresentação com o cenário da Nexo. Podemos marcar 30 minutos nesta semana?\n\nAbraço,' },
      ],
    },
  },
];
