// Trilha sintetizada (sem direitos autorais), 120 BPM, para o video do JR!.
// Harmonia elegante (Fmaj7 - G6 - Em7 - Am7), baixo, batida leve e um "whoosh" + impacto em cada corte de cena.
// Uso: node musica.mjs <duracao-s> <saida.wav> [cortes-em-segundos separados por virgula]
import { writeFileSync } from 'node:fs';

const SR = 44100;
const DUR = Number(process.argv[2] ?? 64);
const SAIDA = process.argv[3] ?? 'musica.wav';
const CORTES = (process.argv[4] ?? '').split(',').filter(Boolean).map(Number);
const N = Math.floor(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const BPM = 120, BEAT = 60 / BPM;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

const prog = [
  { raiz: 41, acorde: [57, 60, 64, 65] }, // Fmaj7
  { raiz: 43, acorde: [55, 59, 62, 64] }, // G6
  { raiz: 40, acorde: [55, 59, 62, 64] }, // Em7
  { raiz: 45, acorde: [57, 60, 64, 67] }, // Am7
];

const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * Math.cos((pan + 1) * Math.PI / 4);
  R[i] += v * Math.sin((pan + 1) * Math.PI / 4);
};
let semente = 7;
const rnd = () => { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 2147483648 - 1; };

function pluck(f, t0, amp, pan, dec = 6) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(0.9 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.min(1, t / 0.003) * Math.exp(-t * dec);
    const s = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 10) + 0.1 * Math.sin(6 * Math.PI * f * t);
    add(i0 + k, s * e * amp, pan);
  }
}
function pad(freqs, t0, dur, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.min(1, t / 0.4) * Math.min(1, (dur - t) / 0.4);
    let s = 0;
    freqs.forEach((f, j) => { s += Math.sin(2 * Math.PI * f * t + j) + 0.5 * Math.sin(2 * Math.PI * f * 1.004 * t) + 0.5 * Math.sin(2 * Math.PI * f * 0.996 * t); });
    add(i0 + k, (s * e * amp) / freqs.length, Math.sin(t * 0.7) * 0.3);
  }
}
function baixo(f, t0, dur, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.min(1, t / 0.008) * Math.exp(-t * 2.2) * Math.min(1, (dur - t) / 0.03);
    add(i0 + k, (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t)) * e * amp, 0);
  }
}
function bumbo(t0, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(0.3 * SR);
  let fase = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR, f = 45 + 100 * Math.exp(-t * 28);
    fase += (2 * Math.PI * f) / SR;
    add(i0 + k, Math.sin(fase) * Math.exp(-t * 11) * amp, 0);
  }
}
function chimbal(t0, amp, pan, dur = 0.05) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  let ant = 0;
  for (let k = 0; k < len; k++) { const n = rnd(), hp = n - ant; ant = n; add(i0 + k, hp * Math.exp(-(k / SR) * (5 / dur)) * amp, pan); }
}
function palma(t0, amp) {
  for (const d of [0, 0.012, 0.024]) chimbal(t0 + d, amp * 0.8, 0, 0.12);
}
// whoosh: ruido filtrado que cresce ate o corte
function whoosh(tCorte, amp) {
  const dur = 0.6, i0 = Math.floor((tCorte - dur) * SR), len = Math.floor((dur + 0.25) * SR);
  let lp = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR, x = t / dur;
    const env = x < 1 ? x ** 2.2 : Math.exp(-(t - dur) * 18);
    const a = 0.02 + 0.25 * Math.min(1, x);
    lp += a * (rnd() - lp);
    add(i0 + k, lp * env * amp, Math.sin(x * 3) * 0.6);
  }
}
function impacto(t0, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(0.9 * SR);
  for (let k = 0; k < len; k++) { const t = k / SR; add(i0 + k, Math.sin(2 * Math.PI * (38 + 30 * Math.exp(-t * 8)) * t) * Math.exp(-t * 4.5) * amp, 0); }
}

const compassos = Math.ceil(DUR / (BEAT * 4));
for (let c = 0; c < compassos; c++) {
  const t = c * BEAT * 4, a = prog[c % 4];
  const ent = c < 2 ? 0.5 : 1;
  pad(a.acorde.map((m) => hz(m - 12)), t, BEAT * 4 + 0.2, 0.22);
  baixo(hz(a.raiz - 12), t, BEAT * 1.5, 0.42 * (c < 1 ? 0.4 : 1));
  baixo(hz(a.raiz - 12), t + BEAT * 2.5, BEAT * 1.2, 0.32 * (c < 1 ? 0.4 : 1));
  for (let b = 0; b < 4; b++) {
    const tb = t + b * BEAT;
    if (c >= 1) bumbo(tb, b % 2 === 0 ? 0.42 : 0.3);
    if (c >= 2 && (b === 1 || b === 3)) palma(tb, 0.06);
    chimbal(tb + BEAT / 2, 0.05 * ent, 0.35);
    if (c >= 2) chimbal(tb + BEAT * 0.75, 0.025, -0.35);
  }
  // arpejo em colcheias, com variacao a cada 2 compassos
  const padrao = c % 2 ? [0, 2, 1, 3, 2, 1, 3, 2] : [0, 1, 2, 3, 2, 1, 2, 3];
  padrao.forEach((idx, j) => pluck(hz(a.acorde[idx] + 12), t + j * (BEAT / 2), 0.12 * ent, j % 2 ? 0.5 : -0.5));
  if (c % 4 === 3) pluck(hz(a.acorde[3] + 24), t + BEAT * 3.5, 0.08, 0.2, 2.5);
}
for (const tc of CORTES) { whoosh(tc, 0.5); impacto(tc, 0.35); }

let pico = 0;
for (let i = 0; i < N; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = (0.8 / pico) * Math.min(1, t / 1.0) * Math.min(1, (DUR - t) / 2.5);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
writeFileSync(SAIDA, out);
console.log('musica ok', SAIDA);
