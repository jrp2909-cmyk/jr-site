import React from 'react';
import { AbsoluteFill, Composition, interpolate, useCurrentFrame } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { Assistente, Comando, Final, Funil, IA, Intro, Problema, Radar, Termometro } from './cenas';
import { C, Cena, FONTE, useU } from './comum';
import tempos from './tempos.json';

const CENAS: Record<string, React.FC<Cena>> = { intro: Intro, problema: Problema, termometro: Termometro, funil: Funil, ia: IA, radar: Radar, assistente: Assistente, comando: Comando, final: Final };
// transicoes variadas (cada uma dura uma batida)
const TRANS = [
  fade(), slide({ direction: 'from-right' }), wipe({ direction: 'from-top-left' }), slide({ direction: 'from-bottom' }),
  wipe({ direction: 'from-right' }), slide({ direction: 'from-left' }), fade(), wipe({ direction: 'from-bottom-right' }),
];

const SEM_LEGENDA = new Set(['intro', 'comando', 'final']);
// Legenda queimada no estilo da marca: frases distribuidas ao longo da fala de cada cena
const Legendas: React.FC = () => {
  const f = useCurrentFrame();
  const { u, v } = useU();
  let atual: string | null = null, k = 0;
  for (const c of tempos.cenas) {
    if (SEM_LEGENDA.has(c.id)) continue; // o texto ja esta na tela
    const frases = c.legenda.split(/(?<=[.?!:])\s+/);
    const total = frases.reduce((s, x) => s + x.length, 0);
    let t = c.vozEm;
    for (const fr of frases) {
      const d = (fr.length / total) * c.fala * tempos.fps;
      if (f >= t && f < t + d + 6) { atual = fr; k = t; }
      t += d;
    }
  }
  if (!atual) return null;
  const a = interpolate(f - k, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (v ? 260 : 64) * u, pointerEvents: 'none' }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)`, maxWidth: (v ? 940 : 1500) * u, fontFamily: FONTE, fontSize: (v ? 40 : 38) * u, fontWeight: 600, color: C.texto, background: 'rgba(9,14,26,.86)', borderLeft: `${6 * u}px solid ${C.laranja}`, borderRadius: 14 * u, padding: `${12 * u}px ${26 * u}px`, textAlign: 'center', lineHeight: 1.3 }}>{atual}</div>
    </AbsoluteFill>
  );
};

const Video: React.FC<{ legendas?: boolean }> = ({ legendas = true }) => (
  <AbsoluteFill style={{ background: C.fundo }}>
    <TransitionSeries>
      {tempos.cenas.map((c, i) => {
        const Comp = CENAS[c.id];
        const props = { d: c.quadros, vf: c.vozEm - c.inicio, vd: Math.round(c.fala * tempos.fps) };
        return (
          <React.Fragment key={c.id}>
            <TransitionSeries.Sequence durationInFrames={c.quadros}><Comp {...props} /></TransitionSeries.Sequence>
            {i < tempos.cenas.length - 1 && <TransitionSeries.Transition presentation={TRANS[i % TRANS.length] as any} timing={linearTiming({ durationInFrames: tempos.transicao })} />}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
    {legendas && <Legendas />}
  </AbsoluteFill>
);

// Teaser de 15 s para redes sociais: abertura, termometro, IA e final, sem narracao
const TEASER: [string, number][] = [['intro', 90], ['termometro', 150], ['ia', 135], ['final', 105]];
const Teaser: React.FC = () => (
  <AbsoluteFill style={{ background: C.fundo }}>
    <TransitionSeries>
      {TEASER.map(([id, d], i) => {
        const Comp = CENAS[id];
        return (
          <React.Fragment key={id}>
            <TransitionSeries.Sequence durationInFrames={d}><Comp d={d} vf={8} vd={d - 30} /></TransitionSeries.Sequence>
            {i < TEASER.length - 1 && <TransitionSeries.Transition presentation={TRANS[i * 2] as any} timing={linearTiming({ durationInFrames: 15 })} />}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  </AbsoluteFill>
);
const TEASER_TOTAL = TEASER.reduce((s, [, d]) => s + d, 0) - 15 * (TEASER.length - 1);

export const Root: React.FC = () => (
  <>
    <Composition id="Demo" component={Video} durationInFrames={tempos.total} fps={tempos.fps} width={1920} height={1080} />
    <Composition id="Vertical" component={Video} durationInFrames={tempos.total} fps={tempos.fps} width={1080} height={1920} />
    <Composition id="Teaser" component={Teaser} durationInFrames={TEASER_TOTAL} fps={tempos.fps} width={1920} height={1080} />
  </>
);
