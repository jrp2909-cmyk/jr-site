import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const C = {
  fundo: '#090e1a', sup: '#101828', sup2: '#162036', borda: '#2b3b5c', texto: '#e8ecf4', suave: '#a3aec4',
  laranja: '#f97316', laranjaClaro: '#fb923c', azul: '#1d3a8a', verde: '#4ade80',
  gelado: '#38bdf8', morno: '#fbbf24', aquecendo: '#fb923c', quente: '#ef4444', brasa: '#e11d48',
};
export const FONTE = "'Geist Variable', 'Segoe UI', sans-serif";
export const MONO = "'Geist Mono Variable', Consolas, monospace";
export const GRAD_TERMO = `linear-gradient(90deg, ${C.gelado} 0%, ${C.morno} 35%, ${C.aquecendo} 60%, ${C.quente} 80%, ${C.brasa} 100%)`;

export const FAIXAS = [
  { nome: 'Gelado', min: 0, cor: C.gelado }, { nome: 'Morno', min: 20, cor: C.morno }, { nome: 'Aquecendo', min: 40, cor: C.aquecendo },
  { nome: 'Quente', min: 60, cor: C.quente }, { nome: 'Em brasa', min: 85, cor: C.brasa },
];
export const faixaDe = (n: number) => [...FAIXAS].reverse().find((f) => n >= f.min)!;

// Props que toda cena recebe: duracao, quadro em que a voz comeca e duracao da voz (em quadros)
export type Cena = { d: number; vf: number; vd: number };
// momento proporcional da fala (0..1) -> quadro
export const em = (p: Cena, k: number) => Math.round(p.vf + p.vd * k);

export const useU = () => {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width, height) / 1080, v: height >= width, width, height };
};

export const suave = Easing.bezier(0.2, 0.7, 0.2, 1);
export const entra = (f: number, ini: number, dur = 18) => interpolate(f, [ini, ini + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: suave });
export const mola = (f: number, fps: number, ini: number, cfg: { damping?: number; mass?: number; stiffness?: number } = {}) =>
  spring({ frame: f - ini, fps, config: { damping: 14, mass: 0.8, stiffness: 140, ...cfg } });

// Fundo da marca: grade em movimento lento + brilhos; `calor` (0..1) esquenta a cor do brilho
// Fundos pre-renderizados (fundos.mjs) misturados por opacidade: leve de desenhar, quadro a quadro.
export const Fundo: React.FC<{ calor?: number; children?: React.ReactNode }> = ({ calor = 0, children }) => {
  const f = useCurrentFrame();
  const pulso = 0.06 * Math.exp(-((f % 15) / 5)); // respira na batida (120 BPM)
  const img = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } as const;
  return (
    <AbsoluteFill style={{ background: C.fundo, overflow: 'hidden', fontFamily: FONTE, color: C.texto }}>
      <Img src={staticFile('img/fundo-frio.jpg')} style={img} />
      <Img src={staticFile('img/fundo-quente.jpg')} style={{ ...img, opacity: Math.min(1, calor + pulso) }} />
      {children}
    </AbsoluteFill>
  );
};

// Painel no estilo do produto
export const Painel: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; destaque?: boolean }> = ({ style, children, destaque }) => {
  const { u } = useU();
  return (
    <div style={{
      background: `linear-gradient(180deg, #111a2d, #0c1424)`, border: `${2 * u}px solid ${destaque ? C.laranja : C.borda}`, borderRadius: 24 * u,
      // sombras com desfoque moderado: desfoque grande e muito caro de desenhar sem GPU
      boxShadow: destaque ? `0 ${16 * u}px ${32 * u}px -${8 * u}px rgba(249,115,22,.45)` : `0 ${18 * u}px ${30 * u}px -${12 * u}px rgba(0,0,0,.7)`, ...style,
    }}>{children}</div>
  );
};

export const Rotulo: React.FC<{ children: React.ReactNode; cor?: string; style?: React.CSSProperties }> = ({ children, cor = C.laranjaClaro, style }) => {
  const { u } = useU();
  return <div style={{ fontFamily: MONO, fontSize: 22 * u, letterSpacing: '.14em', textTransform: 'uppercase', color: cor, ...style }}>{children}</div>;
};

export const Pilula: React.FC<{ cor: string; children: React.ReactNode; tam?: number }> = ({ cor, children, tam = 26 }) => {
  const { u } = useU();
  return <span style={{ fontFamily: MONO, fontSize: tam * u, padding: `${6 * u}px ${16 * u}px`, borderRadius: 999, background: `${cor}2e`, color: cor, fontWeight: 600, whiteSpace: 'nowrap' }}>{children}</span>;
};

// Texto que aparece por mascara (sobe de baixo)
export const Sobe: React.FC<{ ini: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({ ini, children, style, dur = 16 }) => {
  const f = useCurrentFrame();
  const k = entra(f, ini, dur);
  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.12em', ...style }}>
      <div style={{ transform: `translateY(${(1 - k) * 110}%)`, opacity: k > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

// Digitacao de texto
export const digitado = (texto: string, f: number, ini: number, cps = 60, fps = 30) => texto.slice(0, Math.max(0, Math.floor(((f - ini) / fps) * cps)));

export const NotaFicticia: React.FC = () => {
  const { u } = useU();
  return <div style={{ position: 'absolute', right: 36 * u, top: 30 * u, fontSize: 20 * u, color: 'rgba(232,236,244,.55)' }}>Dados fictícios de demonstração</div>;
};
