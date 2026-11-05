import '@fontsource-variable/manrope';
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useVideoConfig } from 'remotion';

// Cores do kit de marca
export const C = {
  fundo: '#02060F', sup: '#081126', sup2: '#0C1833', borda: '#1E3160', texto: '#F2F5FC', suave: '#CEDAF5',
  laranja: '#FF7A1A', laranjaClaro: '#FF9A3D', azul: '#4A78E0',
};
export const FONTE = "'Manrope Variable', 'Segoe UI', sans-serif";

// Props que toda cena recebe: duracao, quadro em que a voz comeca e duracao da voz (em quadros)
export type Cena = { d: number; vf: number; vd: number };

export const useU = () => {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width, height) / 1080, v: height >= width, width, height };
};

export const suave = Easing.bezier(0.2, 0.7, 0.2, 1);
export const entra = (f: number, ini: number, dur = 18) => interpolate(f, [ini, ini + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: suave });
export const mola = (f: number, fps: number, ini: number, cfg: { damping?: number; mass?: number; stiffness?: number } = {}) =>
  spring({ frame: f - ini, fps, config: { damping: 14, mass: 0.8, stiffness: 140, ...cfg } });

// Fundo da marca (imagem pre-renderizada por fundos.mjs)
export const Fundo: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.fundo, overflow: 'hidden', fontFamily: FONTE, color: C.texto }}>
    <Img src={staticFile('img/fundo.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    {children}
  </AbsoluteFill>
);

// Radi, mascote do kit. So os olhos e a boca mudam.
export const Radi: React.FC<{ largura: number; estado?: 'normal' | 'pensando' | 'feliz'; f: number; style?: React.CSSProperties }> = ({ largura, estado = 'normal', f, style }) => {
  const pisca = f % 140 > 134 ? 0.1 : 1;
  const pensa = estado === 'pensando' ? 'translate(5 -7)' : undefined;
  return (
    <svg viewBox="0 -12 300 336" width={largura} height={(largura * 336) / 300} style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A78E0" /><stop offset="1" stopColor="#0B2461" /></linearGradient>
        <radialGradient id="ro" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#FFC987" /><stop offset=".5" stopColor="#FF7414" /><stop offset="1" stopColor="#D84300" /></radialGradient>
      </defs>
      <path d="M90,208 L66,270 L146,218 Z" fill="url(#rg)" stroke="#AFC4F5" strokeWidth="2" strokeLinejoin="round" />
      <rect x="44" y="46" width="212" height="178" rx="64" fill="url(#rg)" stroke="#AFC4F5" strokeWidth="2.5" />
      <path d="M76,96 C104,66 176,58 230,84" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="38" cy="150" rx="12" ry="9" fill="#CFE0FF" /><ellipse cx="262" cy="150" rx="12" ry="9" fill="#CFE0FF" />
      <g transform={`translate(150 140) scale(1 ${pisca}) translate(-150 -140)`}>
        <ellipse cx="114" cy="140" rx="15" ry="19" fill="#fff" /><ellipse cx="186" cy="140" rx="15" ry="19" fill="#fff" />
        <g transform={pensa}>
          <circle cx="117" cy="144" r="8.5" fill="#0B1F4F" /><circle cx="183" cy="144" r="8.5" fill="#0B1F4F" />
          <circle cx="120" cy="140" r="3" fill="#fff" /><circle cx="186" cy="140" r="3" fill="#fff" />
        </g>
      </g>
      <circle cx="86" cy="176" r="9" fill="#FF9A3D" opacity=".6" /><circle cx="214" cy="176" r="9" fill="#FF9A3D" opacity=".6" />
      {estado === 'feliz'
        ? <path d="M124,172 Q150,208 176,172 Z" fill="#fff" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
        : estado === 'pensando'
          ? <path d="M138,183 Q152,178 164,183" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          : <path d="M130,176 Q150,196 170,176" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />}
      <circle cx="232" cy="58" r="30" fill="#A83300" transform="translate(3 4)" /><circle cx="232" cy="58" r="30" fill="url(#ro)" />
      <path d="M227.5,44 L229.5,64 L229.6,64.8 L230,65.5 L230.5,66 L231.2,66.4 L232,66.5 L232.8,66.4 L233.5,66 L234,65.5 L234.4,64.8 L234.5,64 L236.5,44 L236.3,42.6 L235.6,41.4 L234.6,40.4 L233.4,39.7 L232,39.5 L230.6,39.7 L229.4,40.4 L228.4,41.4 L227.7,42.6 Z" fill="#fff" />
      <circle cx="232" cy="75" r="4.4" fill="#fff" />
    </svg>
  );
};
