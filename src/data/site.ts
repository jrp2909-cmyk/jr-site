// Dados compartilhados por todas as paginas do site.
export const SITE_NOME = 'JR! – Just Relationship CRM';
export const WHATS_NUM = '5548999735087';
export const WHATS_TXT = '(48) 99973-5087';
export const whats = (msg = 'Olá, Junior! Vi o site do JR! e quero conhecer o CRM.') =>
  `https://wa.me/${WHATS_NUM}?text=${encodeURIComponent(msg)}`;
export const WHATS = whats();
export const LINKEDIN = 'https://www.linkedin.com/in/juniorpereira-/';
export const NOTA = 'Imagens com dados fictícios de demonstração.';

// Termometro: mesma regra do produto (jr-crm/src/lib/thermometer.ts).
export const FAIXAS = [
  { key: 'gelado', label: 'Gelado', min: 0, cor: 'var(--jr-gelado)' },
  { key: 'morno', label: 'Morno', min: 20, cor: 'var(--jr-morno)' },
  { key: 'aquecendo', label: 'Aquecendo', min: 40, cor: 'var(--jr-aquecendo)' },
  { key: 'quente', label: 'Quente', min: 60, cor: 'var(--jr-quente)' },
  { key: 'em_brasa', label: 'Em brasa', min: 85, cor: 'var(--jr-em-brasa)' },
] as const;

export const CRITERIOS = [
  { etapa: 'Prospecção', label: 'Perfil do lead no LinkedIn', pts: 5 },
  { etapa: 'Prospecção', label: 'E-mail corporativo', pts: 5 },
  { etapa: 'Prospecção', label: 'WhatsApp', pts: 5 },
  { etapa: 'Prospecção', label: 'Site da empresa', pts: 5 },
  { etapa: 'Prospecção', label: 'Página da empresa no LinkedIn', pts: 5 },
  { etapa: 'Prospecção', label: 'Conexão aceita', pts: 15 },
  { etapa: 'Qualificação', label: 'Resposta a uma tentativa de contato', pts: 8 },
  { etapa: 'Qualificação', label: '1ª dor mapeada', pts: 8 },
  { etapa: 'Qualificação', label: '3 canais de contato diferentes', pts: 8 },
  { etapa: 'Qualificação', label: 'Demais decisores mapeados', pts: 8 },
  { etapa: 'Qualificação', label: '1º compromisso agendado', pts: 8 },
  { etapa: 'Qualificação', label: 'Apresentação agendada', pts: 10 },
  { etapa: 'Qualificação', label: 'Apresentação realizada', pts: 10 },
] as const;

export const faixaDe = (nota: number) => [...FAIXAS].reverse().find((f) => nota >= f.min)!;

// Navegacao principal. Os itens de funcionalidades e publicos vem das colecoes.
export const NAV = [
  { href: '/funcionalidades/', label: 'Funcionalidades', menu: 'funcionalidades' },
  { href: '/para/', label: 'Para quem', menu: 'para' },
  { href: '/#teste', label: 'Teste o JR!' },
  { href: '/blog/', label: 'Conteúdo' },
  { href: '/fundadores/', label: 'Fundadores' },
] as const;
