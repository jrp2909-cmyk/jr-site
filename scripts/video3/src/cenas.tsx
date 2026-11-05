// Cenas do video: telas REAIS da plataforma (dados ficticios) com camera, destaque e cursor.
// Coordenadas no espaco de 2000x1250 (os prints de 2880x1800, divididos por 1,44).
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, Cena, entra, Fundo, mola, Radi, useU } from './comum';

type Quadro = { t: number; x: number; y: number; w: number }; // camera: centro e largura visivel, em fracao da cena
type Destaque = { a: number; b: number; x: number; y: number; w: number; h: number };
type Cursor = { t: number; x: number; y: number; clique?: boolean };
type Capa = { t: number; x: number; y: number; w: number; h: number; cor: string }; // esconde um trecho ate o instante t
type Tela = {
  img: string;
  troca?: { t: number; img: string }; // outro print real entra em fusao
  cam: Quadro[];
  destaques?: Destaque[];
  cursor?: Cursor[];
  capas?: Capa[];
  balao?: { t: number; txt: string; lado?: 'esq' | 'dir'; alto?: number };
  movel?: string; // na versao vertical, usa este print real de celular
  inserto?: { t: number; img: string };
  vw?: number; // versao vertical: largura visivel
  vx?: number; // versao vertical: centro horizontal
};

const src = (n: string) => staticFile(`img/${n}.png`);
const curva = Easing.bezier(0.45, 0, 0.2, 1);
const L = 2000, A = 1250;

const interpola = (t: number, kfs: Quadro[], k: 'x' | 'y' | 'w') =>
  interpolate(t, kfs.map((q) => q.t), kfs.map((q) => q[k]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva });

// Cursor em seta, sempre do mesmo tamanho na tela
const Seta: React.FC<{ pontos: Cursor[]; t: number; f: number; d: number; s: number }> = ({ pontos, t, f, d, s }) => {
  const x = interpolate(t, pontos.map((p) => p.t), pontos.map((p) => p.x), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva });
  const y = interpolate(t, pontos.map((p) => p.t), pontos.map((p) => p.y), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva });
  const op = entra(f, pontos[0].t * d - 8, 8);
  return (
    <>
      {pontos.filter((p) => p.clique).map((p) => {
        const k = interpolate(f, [p.t * d, p.t * d + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return k > 0 && k < 1 ? <div key={p.t} style={{ position: 'absolute', left: p.x, top: p.y, width: 90 / s, height: 90 / s, marginLeft: -45 / s, marginTop: -45 / s, borderRadius: '50%', border: `${4 / s}px solid ${C.laranjaClaro}`, opacity: 1 - k, transform: `scale(${0.2 + k})` }} /> : null;
      })}
      <svg viewBox="0 0 24 24" width={44 / s} height={44 / s} style={{ position: 'absolute', left: x, top: y, opacity: op, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.6))' }}>
        <path d="M4 2l15 11-7 1.2L8.5 21z" fill="#fff" stroke="#02060F" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </>
  );
};

// Radi no canto, com uma fala curta
const Balao: React.FC<{ t: number; txt: string; lado?: 'esq' | 'dir'; alto?: number; d: number }> = ({ t, txt, lado = 'dir', alto, d }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const ini = t * d;
  const k = mola(f, fps, ini);
  if (f < ini) return null;
  const esq = lado === 'esq';
  const base = (v ? 330 : alto ?? 160) * u;
  const pulo = Math.sin((f - ini) / 22) * 4 * u;
  return (
    <div style={{ position: 'absolute', bottom: base, [esq ? 'left' : 'right']: 34 * u, display: 'flex', flexDirection: esq ? 'row' : 'row-reverse', alignItems: 'center', gap: 14 * u, transform: `translateY(${(1 - k) * 60 * u + pulo}px) scale(${0.7 + 0.3 * k})`, opacity: Math.min(1, k * 1.4), transformOrigin: `${esq ? 'left' : 'right'} bottom` }}>
      <Radi largura={(v ? 140 : 118) * u} estado="feliz" f={f} />
      <div style={{ background: C.laranja, color: C.fundo, fontWeight: 800, fontSize: (v ? 36 : 30) * u, lineHeight: 1.2, padding: `${13 * u}px ${22 * u}px`, borderRadius: 20 * u, maxWidth: 400 * u, boxShadow: `0 ${10 * u}px ${24 * u}px -${6 * u}px rgba(255,122,26,.7)` }}>{txt}</div>
    </div>
  );
};

// Selo e marca d'agua do kit, em todas as telas
const Selos: React.FC = () => {
  const { u, v } = useU();
  return (
    <>
      <div style={{ position: 'absolute', top: (v ? 30 : 22) * u, right: 26 * u, display: 'flex', alignItems: 'center', gap: 12 * u, fontSize: 22 * u, fontWeight: 600, color: C.suave, background: C.fundo, border: `${1.5 * u}px solid ${C.borda}`, borderRadius: 999, padding: `${6 * u}px ${18 * u}px` }}>
        Dados fictícios
        <Img src={staticFile('img/jr-marca-dagua-icone-branco-30.png')} style={{ height: 38 * u }} />
      </div>
    </>
  );
};

// Print de celular dentro de um aparelho, rolando devagar (so na versao vertical)
const Celular: React.FC<{ img: string; d: number }> = ({ img, d }) => {
  const f = useCurrentFrame();
  const { u } = useU();
  const larg = 760 * u, alt = 1420 * u;
  const altImg = (larg * 2532) / 1170;
  const y = interpolate(f, [15, d - 10], [0, -(altImg - alt) * 0.75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: curva });
  return (
    <div style={{ position: 'absolute', left: '50%', top: 110 * u, marginLeft: -larg / 2, width: larg, height: alt, overflow: 'hidden', borderRadius: 54 * u, border: `${6 * u}px solid ${C.borda}`, background: C.fundo, boxShadow: `0 ${30 * u}px ${50 * u}px -${20 * u}px #000` }}>
      <Img src={src(img)} style={{ width: larg, height: altImg, transform: `translateY(${y}px)` }} />
    </div>
  );
};

const CenaTela: React.FC<Cena & { tela: Tela }> = ({ d, tela }) => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const { u, v } = useU();
  const t = f / d;

  if (v && tela.movel) {
    return (
      <Fundo>
        <Celular img={tela.movel} d={d} />
        <Selos />
        {tela.balao && <Balao {...tela.balao} d={d} />}
      </Fundo>
    );
  }

  // Camera: na versao vertical a largura visivel fica menor, e a tela se mantem no alto
  let w = interpola(t, tela.cam, 'w'), x = interpola(t, tela.cam, 'x'), y = interpola(t, tela.cam, 'y');
  if (v) {
    w = Math.min(w, tela.vw ?? 1120);
    x = tela.vx ?? Math.max(w / 2 - 20, Math.min(L - w / 2 + 20, x));
    const alto = height / (width / w); // altura visivel, em coordenadas do print
    y = alto < A ? Math.max(alto / 2, y + alto * 0.09) : A / 2 + alto * 0.09; // sobe a tela para abrir espaco a legenda
  }
  const s = width / w;
  const trocaK = tela.troca ? interpolate(f, [tela.troca.t * d, tela.troca.t * d + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  return (
    <Fundo>
      <div style={{ position: 'absolute', left: 0, top: 0, width: L, height: A, transformOrigin: '0 0', transform: `translate(${width / 2 - x * s}px, ${height / 2 - y * s}px) scale(${s})`, borderRadius: 18, overflow: 'hidden', outline: `2px solid ${C.borda}`, background: C.fundo }}>
        <Img src={src(tela.img)} style={{ position: 'absolute', inset: 0, width: L, height: A }} />
        {tela.troca && <Img src={src(tela.troca.img)} style={{ position: 'absolute', inset: 0, width: L, height: A, opacity: trocaK }} />}
        {tela.capas?.map((c) => {
          const k = interpolate(f, [c.t * d, c.t * d + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return k < 1 ? <div key={c.t} style={{ position: 'absolute', left: c.x + c.w * k, top: c.y, width: c.w * (1 - k), height: c.h, background: c.cor }} /> : null;
        })}
        {tela.destaques?.map((h, i) => {
          const op = interpolate(t, [h.a, h.a + 0.05, h.b - 0.05, h.b], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return op > 0 ? <div key={i} style={{ position: 'absolute', left: h.x - 6, top: h.y - 6, width: h.w + 12, height: h.h + 12, borderRadius: 16, border: `3px solid ${C.laranja}`, boxShadow: '0 0 0 3000px rgba(2,6,15,.62)', opacity: op }} /> : null;
        })}
        {tela.cursor && <Seta pontos={tela.cursor} t={t} f={f} d={d} s={s} />}
      </div>
      {tela.inserto && (() => {
        const k = mola(f, fps, tela.inserto.t * d, { damping: 16 });
        const h = (v ? 900 : 840) * u, l = (h * 960) / 1272;
        return <Img src={src(tela.inserto.img)} style={{ position: 'absolute', right: (v ? (width - l) / 2 : 90 * u), top: (v ? 520 : 110) * u, width: l, height: h, borderRadius: 24 * u, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 120 * u}px)`, boxShadow: `0 ${30 * u}px ${50 * u}px -${10 * u}px rgba(0,0,0,.8)` }} />;
      })()}
      <Selos />
      {tela.balao && <Balao {...tela.balao} d={d} />}
    </Fundo>
  );
};

// Fundo real da area de mensagens da tela de IA (amostrado do print)
const COR_IA = '#101828';

const TELAS: Record<string, Tela> = {
  painel: {
    img: '01-dashboard', movel: '30-mobile-dashboard',
    cam: [{ t: 0, x: 1000, y: 590, w: 2060 }, { t: 0.2, x: 1140, y: 480, w: 1800 }, { t: 0.62, x: 1140, y: 480, w: 1800 }, { t: 0.82, x: 1140, y: 780, w: 1700 }, { t: 1, x: 1140, y: 800, w: 1660 }],
    destaques: [{ a: 0.2, b: 0.44, x: 322, y: 310, w: 1645, h: 92 }, { a: 0.44, b: 0.68, x: 322, y: 424, w: 1645, h: 97 }, { a: 0.76, b: 1, x: 322, y: 1116, w: 1645, h: 134 }],
    balao: { t: 0.3, txt: 'Seu dia em um só lugar' },
  },
  funil: {
    img: '03-funil', troca: { t: 0.5, img: '04-funil-filtro-termometro-quente' }, movel: '31-mobile-funil',
    cam: [{ t: 0, x: 1000, y: 590, w: 2060 }, { t: 0.28, x: 1000, y: 590, w: 2000 }, { t: 0.46, x: 1420, y: 320, w: 1150 }, { t: 0.62, x: 1420, y: 320, w: 1150 }, { t: 0.82, x: 1300, y: 560, w: 1600 }, { t: 1, x: 1300, y: 580, w: 1560 }],
    cursor: [{ t: 0.22, x: 900, y: 700 }, { t: 0.47, x: 1745, y: 150, clique: true }, { t: 1, x: 1745, y: 150 }],
    destaques: [{ a: 0.5, b: 0.74, x: 1668, y: 104, w: 145, h: 85 }],
    balao: { t: 0.6, txt: 'Só as mais quentes', lado: 'esq' },
  },
  termometro: {
    img: '06-empresa-ficha-termometro',
    vw: 640, vx: 1717,
    cam: [{ t: 0, x: 1000, y: 590, w: 2060 }, { t: 0.22, x: 1400, y: 860, w: 1250 }, { t: 0.46, x: 1400, y: 860, w: 1250 }, { t: 0.6, x: 1440, y: 985, w: 1180 }, { t: 1, x: 1440, y: 985, w: 1180 }],
    destaques: [{ a: 0.22, b: 0.48, x: 1490, y: 590, w: 455, h: 100 }, { a: 0.5, b: 1, x: 1490, y: 705, w: 455, h: 510 }],
    balao: { t: 0.42, txt: 'Cada passo vira pontos', lado: 'esq' },
  },
  ia: {
    img: '07-empresa-escrever-com-ia', vw: 1120, vx: 880,
    cam: [{ t: 0, x: 870, y: 400, w: 1500 }, { t: 0.3, x: 870, y: 400, w: 1400 }, { t: 0.5, x: 870, y: 700, w: 1400 }, { t: 1, x: 870, y: 860, w: 1300 }],
    cursor: [{ t: 0.08, x: 900, y: 320 }, { t: 0.26, x: 470, y: 455, clique: true }, { t: 1, x: 470, y: 455 }],
    capas: [
      { t: 0.3, x: 345, y: 488, w: 1068, h: 240, cor: COR_IA },
      { t: 0.46, x: 345, y: 728, w: 1068, h: 262, cor: COR_IA },
      { t: 0.62, x: 345, y: 990, w: 1068, h: 260, cor: COR_IA },
    ],
    destaques: [{ a: 0.76, b: 1, x: 351, y: 1000, w: 1053, h: 220 }],
    balao: { t: 0.76, txt: 'Você escolhe a sua', lado: 'dir', alto: 560 },
  },
  tarefas: {
    img: '08-tarefas', troca: { t: 0.52, img: '11-cadencias' }, movel: '32-mobile-tarefas',
    cam: [{ t: 0, x: 1000, y: 590, w: 2060 }, { t: 0.14, x: 1150, y: 640, w: 1800 }, { t: 0.48, x: 1150, y: 640, w: 1800 }, { t: 0.62, x: 1000, y: 800, w: 1640 }, { t: 1, x: 1020, y: 830, w: 1600 }],
    cursor: [{ t: 0.1, x: 1400, y: 300 }, { t: 0.32, x: 968, y: 525, clique: true }, { t: 0.5, x: 968, y: 525 }],
    destaques: [{ a: 0.62, b: 1, x: 352, y: 626, w: 1362, h: 540 }],
    balao: { t: 0.68, txt: 'Um passo para cada canal', lado: 'esq' },
  },
  radar: {
    img: '09-radar', vw: 880, vx: 735,
    cam: [{ t: 0, x: 1000, y: 590, w: 2060 }, { t: 0.22, x: 780, y: 450, w: 1250 }, { t: 0.58, x: 780, y: 450, w: 1250 }, { t: 0.72, x: 800, y: 480, w: 1500 }, { t: 1, x: 800, y: 480, w: 1460 }],
    destaques: [{ a: 0.2, b: 0.62, x: 346, y: 381, w: 767, h: 78 }],
    cursor: [{ t: 0.3, x: 800, y: 300 }, { t: 0.52, x: 625, y: 560 }, { t: 1, x: 625, y: 560 }],
    inserto: { t: 0.64, img: '40-extensao-popup' },
    balao: { t: 0.68, txt: 'Só em leitura', lado: 'esq' },
  },
  assistente: {
    img: '14-assistente-ia', vw: 640, vx: 1690,
    cam: [{ t: 0, x: 1000, y: 590, w: 2060 }, { t: 0.2, x: 1500, y: 650, w: 1100 }, { t: 1, x: 1500, y: 900, w: 1100 }],
    destaques: [{ a: 0.2, b: 1, x: 1412, y: 328, w: 553, h: 888 }],
    balao: { t: 0.4, txt: 'Pergunte em português', lado: 'esq' },
  },
};

const Relatorios: React.FC<Cena> = ({ d }) => {
  const f = useCurrentFrame();
  const zoom = 1 + (f / d) * 0.07;
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const itens = [['rel-simples-topo', 'Simplificado', 'Para CEOs'], ['rel-medio-topo', 'Médio', 'Para gestores'], ['rel-detalhado-topo', 'Detalhado', 'Para quem acompanha de perto']];
  const larg = (v ? 620 : 510) * u, alt = (larg * 1.18);
  return (
    <Fundo>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, display: 'flex', flexDirection: v ? 'column' : 'row', alignItems: 'center', justifyContent: v ? 'flex-start' : 'center', gap: (v ? 16 : 34) * u, paddingTop: (v ? 100 : 60) * u }}>
        {itens.map(([img, nome, pub], i) => {
          const k = mola(f, fps, 15 + i * 14, { damping: 15 });
          return (
            <div key={img} style={{ width: larg, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 90 * u}px) rotate(${(1 - k) * (i - 1) * 5}deg)` }}>
              <div style={{ fontWeight: 800, fontSize: (v ? 32 : 34) * u, marginBottom: 8 * u, color: C.texto }}>{nome}<span style={{ fontWeight: 500, fontSize: (v ? 24 : 21) * u, color: C.suave, marginLeft: 12 * u }}>{pub}</span></div>
              <div style={{ height: v ? 420 * u : alt, overflow: 'hidden', borderRadius: 16 * u, border: `${2 * u}px solid ${C.borda}`, background: '#fff' }}>
                <Img src={src(img)} style={{ width: '100%', display: 'block' }} />
              </div>
            </div>
          );
        })}
      </div>
      <Selos />
    </Fundo>
  );
};

const Comando: React.FC<Cena> = ({ d, vf, vd }) => {
  const f = useCurrentFrame();
  const { u, v, width, height } = useU();
  const s = width / (v ? 1500 : 1900);
  const z = 1 + (f / d) * 0.04;
  const trechos: [string, number, string][] = [['A IA sugere.', 0.02, C.texto], ['Você decide.', 0.28, C.laranjaClaro], ['Nada é enviado sem você.', 0.55, C.suave]];
  return (
    <Fundo>
      <div style={{ position: 'absolute', left: width / 2 - (L * s * z) / 2, top: height / 2 - (A * s * z) / 2, width: L * s * z, height: A * s * z, opacity: 0.2 }}>
        <Img src={src('07-empresa-escrever-com-ia')} style={{ width: '100%', height: '100%' }} />
      </div>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 60 * u }}>
        {trechos.map(([txt, k, cor], i) => {
          const a = entra(f, vf + vd * k, 12);
          return <div key={txt} style={{ opacity: a, transform: `translateY(${(1 - a) * 26 * u}px)`, color: cor, fontWeight: i < 2 ? 800 : 600, fontSize: (i < 2 ? (v ? 118 : 116) : (v ? 54 : 56)) * u, letterSpacing: '-.03em', lineHeight: 1.14, marginTop: i === 2 ? 22 * u : 0 }}>{txt}</div>;
        })}
      </AbsoluteFill>
      <Selos />
    </Fundo>
  );
};

const Final: React.FC<Cena> = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, v } = useU();
  const k = mola(f, fps, 10);
  return (
    <Fundo>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 50 * u }}>
        <div style={{ transform: `scale(${k}) translateY(${Math.sin(f / 18) * 5 * u}px)` }}><Radi largura={(v ? 380 : 270) * u} estado="feliz" f={f} /></div>
        <div style={{ opacity: entra(f, 18), fontWeight: 800, fontSize: (v ? 94 : 92) * u, letterSpacing: '-.03em', lineHeight: 1.1, marginTop: 12 * u }}>Seja um <span style={{ color: C.laranjaClaro }}>cliente fundador</span></div>
        <div style={{ opacity: entra(f, 28), fontWeight: 500, fontSize: (v ? 40 : 38) * u, color: C.suave, marginTop: 18 * u }}>Transforme leads em relacionamentos que vendem.</div>
        <div style={{ opacity: entra(f, 38), transform: `scale(${0.92 + 0.08 * entra(f, 38)})`, fontWeight: 800, fontSize: (v ? 50 : 44) * u, color: C.fundo, background: C.laranja, borderRadius: 18 * u, padding: `${14 * u}px ${34 * u}px`, marginTop: 34 * u }}>jrcrm.com.br</div>
      </AbsoluteFill>
    </Fundo>
  );
};

const tela = (t: Tela): React.FC<Cena> => (p) => <CenaTela {...p} tela={t} />;
export const CENAS: Record<string, React.FC<Cena>> = {
  ...Object.fromEntries(Object.entries(TELAS).map(([id, t]) => [id, tela(t)])),
  relatorios: Relatorios,
  comando: Comando,
  final: Final,
};
