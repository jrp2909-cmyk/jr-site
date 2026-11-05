// 1) Gera a voz de cada cena (Edge TTS, voz neural; so o texto do roteiro sai da maquina)
// 2) Corta o silencio das pontas, mede a duracao e arredonda cada cena para batidas inteiras
// 3) Grava src/tempos.json (usado pelo Remotion) e copia os prints para public/img
// Uso: node preparar.mjs [voz]   (padrao pt-BR-AntonioNeural)
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { BATIDA, FPS, roteiro, TRANSICAO } from './roteiro.mjs';

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
  // o nome do arquivo inclui o texto: mudou a fala, gera a voz de novo
  const marca = createHash('sha1').update(voz + c.fala).digest('hex').slice(0, 8);
  const mp3 = join(saida, `voz-${c.id}-${marca}.mp3`);
  if (!existsSync(mp3)) {
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
  // a fala entra quando a transicao termina e acaba antes da seguinte (+0,6 s de folga);
  // a cena e arredondada para batidas inteiras, assim todo corte cai na batida da trilha
  const minimo = { final: 5, comando: 5, relatorios: 5.5, assistente: 5.5 }[c.id] ?? 0;
  const quadros = Math.ceil(Math.max(minimo * FPS, (fala + 0.6) * FPS + 2 * TRANSICAO) / BATIDA) * BATIDA;
  cenas.push({ id: c.id, legenda: c.legenda, fala, quadros });
  console.log(c.id, fala.toFixed(2) + 's ->', (quadros / FPS).toFixed(2) + 's');
}

// inicio de cada cena no miolo do video (as transicoes sobrepoem as cenas)
let t = 0;
for (const c of cenas) {
  c.inicio = t;
  c.vozEm = t + TRANSICAO; // quadro em que a voz comeca
  t += c.quadros - TRANSICAO;
}
const total = t + TRANSICAO;
writeFileSync(join(aqui, 'src', 'tempos.json'), JSON.stringify({ fps: FPS, transicao: TRANSICAO, batida: BATIDA, total, cenas }, null, 2));
console.log('miolo', (total / FPS).toFixed(1) + 's');

const imgs = [
  'desktop/01-dashboard.png', 'desktop/03-funil.png', 'desktop/04-funil-filtro-termometro-quente.png', 'desktop/06-empresa-ficha-termometro.png',
  'desktop/07-empresa-escrever-com-ia.png', 'desktop/08-tarefas.png', 'desktop/09-radar.png', 'desktop/11-cadencias.png', 'desktop/14-assistente-ia.png',
  'desktop/40-extensao-popup.png', 'desktop/rel-simples-topo.png', 'desktop/rel-medio-topo.png', 'desktop/rel-detalhado-topo.png',
  'mobile/30-mobile-dashboard.png', 'mobile/31-mobile-funil.png', 'mobile/32-mobile-tarefas.png', 'mobile/33-mobile-empresa.png',
  'marca/jr-marca-dagua-icone-branco-30.png',
];
for (const i of imgs) copyFileSync(join(site, 'src/assets', i), join(pub, 'img', basename(i)));
console.log('prints copiados');
