// Trilha alegre e moderna (tom maior, 112 BPM), 100% sintetizada: sem direitos autorais.
// Uso: node musica.mjs <duracao-em-segundos> [saida.wav]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SR = 44100;
const DUR = Number(process.argv[2] ?? 70);
const N = Math.floor(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
const BPM = 112, BEAT = 60 / BPM, S16 = BEAT / 4;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// C - G - Am - F (energica e luminosa)
const prog = [
  { raiz: 36, tri: [60, 64, 67, 72] },
  { raiz: 31, tri: [59, 62, 67, 71] },
  { raiz: 33, tri: [60, 64, 69, 72] },
  { raiz: 29, tri: [60, 65, 69, 72] },
];

const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * Math.cos((pan + 1) * Math.PI / 4);
  R[i] += v * Math.sin((pan + 1) * Math.PI / 4);
};

function pluck(f, t0, amp, pan, dec = 7) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(0.6 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.min(1, t / 0.004) * Math.exp(-t * dec);
    const s = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) + 0.12 * Math.sin(6 * Math.PI * f * t);
    add(i0 + k, s * e * amp, pan);
  }
}
function pad(freqs, t0, dur, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const e = Math.min(1, t / 0.25) * Math.min(1, (dur - t) / 0.25);
    let s = 0;
    freqs.forEach((f, j) => { s += Math.sin(2 * Math.PI * f * t + j) + 0.4 * Math.sin(2 * Math.PI * f * 1.003 * t); });
    add(i0 + k, s * e * amp / freqs.length, 0);
  }
}
function bass(f, t0, dur, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR, e = Math.min(1, t / 0.01) * Math.exp(-t * 3.5);
    add(i0 + k, (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * e * amp, 0);
  }
}
function kick(t0, amp) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(0.22 * SR);
  let fase = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR, f = 48 + 90 * Math.exp(-t * 30);
    fase += 2 * Math.PI * f / SR;
    add(i0 + k, Math.sin(fase) * Math.exp(-t * 16) * amp, 0);
  }
}
let ruido = 1;
const rnd = () => { ruido = (ruido * 1664525 + 1013904223) >>> 0; return ruido / 2147483648 - 1; };
function chiado(t0, dur, amp, pan) {
  const i0 = Math.floor(t0 * SR), len = Math.floor(dur * SR);
  let ant = 0;
  for (let k = 0; k < len; k++) {
    const n = rnd(), hp = n - ant; ant = n;
    add(i0 + k, hp * Math.exp(-(k / SR) * (6 / dur)) * amp, pan);
  }
}

const compassos = Math.ceil(DUR / (BEAT * 4));
for (let c = 0; c < compassos; c++) {
  const t = c * BEAT * 4, a = prog[c % 4];
  const intro = c < 2 ? 0.55 : 1; // entrada mais suave
  pad(a.tri.map((m) => hz(m - 12)), t, BEAT * 4 + 0.1, 0.20);
  for (let b = 0; b < 4; b++) {
    const tb = t + b * BEAT;
    if (c >= 1) kick(tb, 0.34);
    chiado(tb + BEAT / 2, 0.06, 0.07 * intro, 0.4);
    if (b === 1 || b === 3) chiado(tb, 0.11, 0.05 * intro, -0.2);
  }
  bass(hz(a.raiz + 12), t, BEAT * 1.4, 0.33);
  bass(hz(a.raiz + 12), t + BEAT * 2.5, BEAT * 0.9, 0.28);
  bass(hz(a.raiz + 19), t + BEAT * 3.5, BEAT * 0.5, 0.18);
  const padrao = [0, 1, 2, 3, 2, 1, 2, 3];
  padrao.forEach((idx, j) => {
    const nota = a.tri[idx] + 12;
    pluck(hz(nota), t + j * (BEAT / 2), 0.17 * intro, (j % 2 ? 0.45 : -0.45));
  });
  // brilho: nota alta no 2o e 4o compasso do ciclo
  if (c % 2 === 1) pluck(hz(a.tri[3] + 24), t + BEAT * 3, 0.10, 0.2, 3);
}

let pico = 0;
for (let i = 0; i < N; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = (0.7 / pico) * Math.min(1, t / 1.5) * Math.min(1, (DUR - t) / 3);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
writeFileSync(process.argv[3] ?? join(import.meta.dirname, 'saida', 'musica.wav'), out);
console.log('musica ok');
