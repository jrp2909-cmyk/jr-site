// 1) Gera a voz de cada cena (Edge TTS, voz neural; so o texto do roteiro sai da maquina)
// 2) Corta o silencio das pontas, mede a duracao e arredonda cada cena para batidas inteiras
// 3) Grava src/tempos.json (usado pelo Remotion) e copia os prints para public/img
// Uso: node preparar.mjs [voz]   (padrao pt-BR-AntonioNeural)
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { roteiro, FPS, BATIDA, TRANSICAO } from './roteiro.mjs';

const aqui = import.meta.dirname;
const site = resolve(aqui, '..', '..');
const ffmpeg = createRequire(join(site, 'package.json'))('ffmpeg-static');
const saida = join(aqui, 'saida');
const pub = join(aqui, 'public');
mkdirSync(saida, { recursive: true });
mkdirSync(join(pub, 'img'), { recursive: true });

const voz = process.argv[2] ?? 'pt-BR-AntonioNeural';
const duracao = (f) => {
  try { execFileSync(ffmpeg, ['-i', f], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(String(e.stderr));
    return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
};

const cenas = [];
for (const c of roteiro) {
  const mp3 = join(saida, `voz-${c.id}.mp3`);
  if (!existsSync(mp3) || process.argv.includes('--refazer')) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voz, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const tmp = join(saida, `tmp-${c.id}`);
    mkdirSync(tmp, { recursive: true });
    const { audioFilePath } = await tts.toFile(tmp, c.fala);
    copyFileSync(audioFilePath, mp3);
    tts.close?.();
  }
  const wav = join(saida, `fala-${c.id}.wav`);
  // tira o silencio das pontas e acelera levemente (fala mais viva)
  execFileSync(ffmpeg, ['-hide_banner', '-y', '-i', mp3, '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=1.08,aresample=48000', wav], { stdio: 'ignore' });
  const fala = duracao(wav);
  // a fala entra quando a transicao de entrada termina e acaba antes da transicao de saida (+0,6 s de folga);
  // a cena e arredondada para batidas inteiras, assim todo corte cai na batida da trilha
  const minimo = { intro: 4.5, final: 6.5, comando: 5 }[c.id] ?? 0;
  const quadros = Math.ceil((Math.max(minimo * FPS, (fala + 0.6) * FPS + 2 * TRANSICAO)) / BATIDA) * BATIDA;
  cenas.push({ id: c.id, legenda: c.legenda, fala, quadros });
  console.log(c.id, fala.toFixed(2) + 's ->', (quadros / FPS).toFixed(2) + 's');
}

// inicio de cada cena no video final (as transicoes sobrepoem as cenas)
let t = 0;
for (const [k, c] of cenas.entries()) {
  c.inicio = t;
  c.vozEm = t + (k === 0 ? 9 : TRANSICAO); // quadro em que a voz comeca
  t += c.quadros - TRANSICAO;
}
const total = t + TRANSICAO;
writeFileSync(join(aqui, 'src', 'tempos.json'), JSON.stringify({ fps: FPS, transicao: TRANSICAO, batida: BATIDA, total, cenas }, null, 2));
console.log('total', (total / FPS).toFixed(1) + 's');

const imgs = ['desktop/01-dashboard.png', 'desktop/03-funil.png', 'desktop/07-empresa-escrever-com-ia.png', 'desktop/09-radar.png', 'desktop/rel-simples-topo.png', 'desktop/rel-medio-topo.png', 'desktop/rel-detalhado-topo.png', 'desktop/14-assistente-ia.png', 'brand/logo.png'];
for (const i of imgs) copyFileSync(join(site, 'src/assets', i), join(pub, 'img', i.split('/')[1]));
console.log('prints copiados');
