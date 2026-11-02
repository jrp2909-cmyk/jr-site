// Ajusta cada trecho de voz a sua janela, mistura com a trilha e grava o video final com audio.
// Uso: node mixar.mjs <video-entrada.mp4> <video-saida.mp4>
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');
const dir = join(import.meta.dirname, 'saida');
const [entrada, saida] = process.argv.slice(2);
const trechos = JSON.parse(readFileSync(join(import.meta.dirname, 'narracao.json'), 'utf8'));

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-y', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const duracao = (f) => {
  try { run(['-i', f]); } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(e.stderr);
    return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
};

const entradas = ['-i', entrada, '-i', join(dir, 'musica.wav')];
const filtros = [];
const rotulos = [];
trechos.forEach((t, i) => {
  const bruto = join(dir, `seg-${i}.wav`);
  const aparado = join(dir, `ap-${i}.wav`);
  run(['-i', bruto, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', aparado]);
  const d = duracao(aparado);
  const janela = t.fim - t.inicio;
  const tempo = Math.min(1.3, Math.max(1, d / janela));
  const fim = t.inicio + d / tempo;
  console.log(`trecho ${i}: ${d.toFixed(2)}s em janela ${janela.toFixed(2)}s -> tempo x${tempo.toFixed(2)} (termina ${fim.toFixed(1)}s)${fim > t.fim + 0.3 ? '  ATENCAO: passa da janela' : ''}`);
  entradas.push('-i', aparado);
  const ms = Math.round(t.inicio * 1000);
  filtros.push(`[${i + 2}:a]atempo=${tempo.toFixed(3)},highpass=f=70,adelay=${ms}|${ms},volume=1.5[v${i}]`);
  rotulos.push(`[v${i}]`);
});

const total = duracao(entrada);
filtros.push(`${rotulos.join('')}amix=inputs=${rotulos.length}:normalize=0,aformat=channel_layouts=stereo[voz]`);
filtros.push(`[1:a]volume=0.5,atrim=0:${total},aformat=channel_layouts=stereo[mus]`);
// a musica baixa quando a voz fala (ducking)
filtros.push('[voz]asplit=2[voz1][voz2]');
filtros.push('[mus][voz2]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=500[musd]');
filtros.push(`[voz1][musd]amix=inputs=2:normalize=0,alimiter=limit=0.95,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5[a]`);

run([...entradas, '-filter_complex', filtros.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', saida]);
console.log('video com audio:', saida);
