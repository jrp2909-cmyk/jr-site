// Gera uma trilha ambiente suave (pad + notas de sino esparsas), 100% sintetizada: sem direitos autorais.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SR = 44100;
const DUR = 60;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// Progressao calma: Am9 - Fmaj7 - Cmaj7 - G6 (notas MIDI)
const acordes = [
  [45, 52, 60, 64, 67],
  [41, 48, 57, 60, 64],
  [48, 55, 59, 64, 67],
  [43, 50, 59, 62, 64],
];
const PASSO = 7.5;

function nota(freq, t0, dur, amp, pan, att, rel, harm) {
  const i0 = Math.floor(t0 * SR);
  const len = Math.floor((dur + rel) * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let k = 0; k < len; k++) {
    const i = i0 + k;
    if (i < 0 || i >= N) continue;
    const t = k / SR;
    let env = Math.min(1, t / att);
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / rel);
    let s = 0;
    for (const d of [-0.12, 0, 0.12]) {
      const f = freq * Math.pow(2, d / 12 / 10);
      s += Math.sin(2 * Math.PI * f * t) + harm * Math.sin(2 * Math.PI * f * 2 * t);
    }
    s *= amp * env / 3;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

function sino(freq, t0, amp, pan) {
  const len = Math.floor(3.2 * SR);
  const i0 = Math.floor(t0 * SR);
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let k = 0; k < len; k++) {
    const i = i0 + k;
    if (i >= N) break;
    const t = k / SR;
    const env = Math.min(1, t / 0.01) * Math.exp(-t * 1.6);
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(2 * Math.PI * freq * 2.01 * t)) * amp * env;
    L[i] += s * gl;
    R[i] += s * gr;
  }
}

for (let c = 0; c * PASSO < DUR + PASSO; c++) {
  const ac = acordes[c % acordes.length];
  ac.forEach((m, j) => {
    const pan = (j - 2) * 0.28;
    nota(hz(m), c * PASSO - 0.5, PASSO + 0.5, j === 0 ? 0.55 : 0.32, pan, 2.2, 2.6, 0.18);
  });
  // sino esparso, uma oitava acima do acorde
  const alvo = [ac[3] + 12, ac[2] + 12, ac[4] + 12];
  alvo.forEach((m, j) => sino(hz(m), c * PASSO + 1.2 + j * 2.1, 0.07, (j - 1) * 0.5));
}

// leve reverb simples (ecos filtrados) para suavizar
function eco(buf, atraso, ganho) {
  const d = Math.floor(atraso * SR);
  for (let i = N - 1; i >= d; i--) buf[i] += buf[i - d] * ganho;
}
for (const b of [L, R]) { eco(b, 0.19, 0.28); eco(b, 0.37, 0.18); eco(b, 0.61, 0.12); }

let pico = 0;
for (let i = 0; i < N; i++) pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 2.5) * Math.min(1, (DUR - t) / 3);
  const g = (0.6 / pico) * fade;
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
const destino = process.argv[2] ?? join(import.meta.dirname, 'saida', 'musica.wav');
writeFileSync(destino, out);
console.log('musica ok', destino);
