import React from 'react';
import { AbsoluteFill, Composition, interpolate, useCurrentFrame } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { CENAS } from './cenas';
import { C, FONTE, useU } from './comum';
import tempos from './tempos.json';

// Transicoes discretas: o movimento principal vem da camera sobre as telas
const TRANS = [slide({ direction: 'from-right' }), fade(), slide({ direction: 'from-bottom' }), fade(), slide({ direction: 'from-left' }), fade(), slide({ direction: 'from-right' }), fade(), fade()];

const SEM_LEGENDA = new Set(['comando', 'final']); // o texto ja esta na tela
// Legenda queimada na identidade do kit: frases distribuidas ao longo da fala de cada cena
const Legendas: React.FC = () => {
  const f = useCurrentFrame();
  const { u, v } = useU();
  let atual: string | null = null, k = 0;
  for (const c of tempos.cenas) {
    if (SEM_LEGENDA.has(c.id)) continue;
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
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: (v ? 170 : 34) * u, pointerEvents: 'none' }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)`, maxWidth: (v ? 960 : 1240) * u, fontFamily: FONTE, fontSize: (v ? 42 : 34) * u, fontWeight: 700, color: C.texto, background: 'rgba(2,6,15,.9)', borderLeft: `${6 * u}px solid ${C.laranja}`, borderRadius: 14 * u, padding: `${11 * u}px ${24 * u}px`, textAlign: 'center', lineHeight: 1.28 }}>{atual}</div>
    </AbsoluteFill>
  );
};

const Video: React.FC = () => (
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
    <Legendas />
  </AbsoluteFill>
);

// Miolo do teaser: tres telas fortes, sem narracao. A animacao do kit entra em volta, no render.mjs.
const TEASER: [string, number][] = [['funil', 105], ['ia', 120], ['final', 75]];
const Teaser: React.FC = () => (
  <AbsoluteFill style={{ background: C.fundo }}>
    <TransitionSeries>
      {TEASER.map(([id, d], i) => {
        const Comp = CENAS[id];
        return (
          <React.Fragment key={id}>
            <TransitionSeries.Sequence durationInFrames={d}><Comp d={d} vf={8} vd={d - 30} /></TransitionSeries.Sequence>
            {i < TEASER.length - 1 && <TransitionSeries.Transition presentation={fade() as any} timing={linearTiming({ durationInFrames: 15 })} />}
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
