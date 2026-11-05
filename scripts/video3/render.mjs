// Renderiza o video do JR! (precisa de `node preparar.mjs` antes).
// Monta: animacao do kit (abertura rapida) + telas reais (Remotion) + animacao do kit (finalizacao).
// Saidas: public/media/jr-demo.mp4, poster.webp e legendas.vtt no site; em saida/redes/, vertical (9:16) e teaser.
// Uso: node render.mjs [--teste] [--so-demo | --so-redes | --so-teaser | --so-montar]
//   --teste: so tira quadros de amostra para conferir as cenas, em saida/amostras/
//   --so-montar: refaz so a montagem e o audio, reaproveitando o render das telas
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp'; // vem do node_modules do site
import { KIT } from './roteiro.mjs';

const aqui = import.meta.dirname;
const site = resolve(aqui, '..', '..');
const ffmpeg = createRequire(join(site, 'package.json'))('ffmpeg-static');
const saida = join(aqui, 'saida');
const redes = join(saida, 'redes');
mkdirSync(redes, { recursive: true });
const tempos = JSON.parse(readFileSync(join(aqui, 'src', 'tempos.json'), 'utf8'));
const MIOLO = tempos.total / tempos.fps;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const arg = (a) => process.argv.includes(a);

const ff = (args) => execFileSync(ffmpeg, ['-hide_banner', '-y', ...args], { cwd: saida, stdio: ['ignore', 'ignore', 'pipe'] });
// Empacota uma vez e renderiza a partir do pacote. concurrency 2: nesta maquina (4 nucleos, pouca RAM)
// mais abas em paralelo travam tudo; ~1 s por quadro em 1080p.
const CLI = join(aqui, 'node_modules/@remotion/cli/remotion-cli.js');
const BUNDLE = join(saida, 'bundle');
if (!arg('--so-montar')) {
  execFileSync(process.execPath, [join(aqui, 'fundos.mjs')], { stdio: 'inherit' });
  execFileSync(process.execPath, [CLI, 'bundle', 'src/index.ts', '--out-dir', BUNDLE], { cwd: aqui, stdio: 'inherit' });
}
const remotion = (comp, arq) => {
  console.log('render', comp, new Date().toLocaleTimeString());
  execFileSync(process.execPath, [CLI, 'render', BUNDLE, comp, arq, '--muted', '--crf=16', `--browser-executable=${CHROME}`, '--concurrency=2'], { cwd: aqui, stdio: 'inherit' });
};

if (arg('--teste')) {
  const pasta = join(saida, 'amostras');
  mkdirSync(pasta, { recursive: true });
  const fracoes = [0.3, 0.6, 0.92];
  // --cenas=a,b limita as amostras a essas cenas
  const so = (process.argv.find((x) => x.startsWith('--cenas=')) ?? '').slice(8).split(',').filter(Boolean);
  for (const comp of ['Demo', 'Vertical']) {
    for (const c of tempos.cenas.filter((x) => !so.length || so.includes(x.id))) {
      for (const [i, k] of fracoes.entries()) {
        const q = Math.round(c.inicio + c.quadros * k);
        execFileSync(process.execPath, [CLI, 'still', BUNDLE, comp, join(pasta, `${comp}-${c.id}-${i}.png`), `--frame=${q}`, `--browser-executable=${CHROME}`, '--log=error'], { cwd: aqui, stdio: 'inherit' });
      }
    }
  }
  console.log('amostras em', pasta);
  process.exit(0);
}

const KITARQ = {
  h: join(site, 'JR-kit-de-marca/jr-lancamento-horizontal-1920x1080.mp4'),
  v: join(site, 'JR-kit-de-marca/jr-lancamento-vertical-1080x1920.mp4'),
};
const { abertura: AB, fim: FIM, emenda: EM } = KIT;
const DUR_AB = (AB.ate - AB.de) / AB.velocidade;
const DUR_FIM = FIM.ate - FIM.de;
const ALT = (o) => (o === 'h' ? 'scale=1920:1080' : 'scale=1080:1920');

// Junta abertura + miolo + fim com fusao curta; devolve o tempo em que o miolo comeca
const emendar = (miolo, durMiolo, o, destino) => {
  const k = KITARQ[o];
  const t1 = DUR_AB - EM, t2 = t1 + durMiolo - EM;
  const filtro = [
    `[0:v]trim=${AB.de}:${AB.ate},setpts=(PTS-STARTPTS)/${AB.velocidade},fps=30,${ALT(o)},format=yuv420p,setsar=1[a]`,
    `[1:v]fps=30,${ALT(o)},format=yuv420p,setsar=1,settb=AVTB[m]`,
    `[2:v]trim=${FIM.de}:${FIM.ate},setpts=PTS-STARTPTS,fps=30,${ALT(o)},format=yuv420p,setsar=1,settb=AVTB[z]`,
    `[a]settb=AVTB[a2]`,
    `[a2][m]xfade=transition=fade:duration=${EM}:offset=${t1.toFixed(3)}[x]`,
    `[x][z]xfade=transition=fade:duration=${EM}:offset=${t2.toFixed(3)}[v]`,
  ].join(';');
  ff(['-i', k, '-i', miolo, '-i', k, '-filter_complex', filtro, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', destino]);
  return { t1, total: t2 + DUR_FIM };
};

// Audio: trechos do kit nas pontas; no meio, vozes + trilha com ducking; tudo em -14 LUFS
const mixar = (o, t1, total, destinoAudio) => {
  const k = KITARQ[o];
  const fimEm = t1 + MIOLO - EM;
  const musica = join(saida, 'musica.wav');
  const cortes = tempos.cenas.slice(1).map((c) => ((c.inicio + tempos.transicao / 2) / tempos.fps).toFixed(3));
  execFileSync(process.execPath, [join(aqui, 'musica.mjs'), MIOLO.toFixed(2), musica, cortes.join(',')], { stdio: 'inherit' });
  const ent = ['-i', k, '-i', k, '-i', 'musica.wav'];
  const fil = [];
  const ms = (s) => Math.round(s * 1000);
  fil.push(`[0:a]atrim=${AB.de}:${AB.ate},asetpts=PTS-STARTPTS,atempo=${AB.velocidade},aformat=sample_rates=48000:channel_layouts=stereo,afade=t=out:st=${(DUR_AB - EM).toFixed(2)}:d=${EM},apad=whole_dur=${total.toFixed(2)}[kit1]`);
  fil.push(`[1:a]atrim=${FIM.de}:${FIM.ate},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:st=0:d=${EM},adelay=${ms(fimEm)}|${ms(fimEm)},apad=whole_dur=${total.toFixed(2)}[kit2]`);
  fil.push(`[2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.5,afade=t=in:st=0:d=0.6,afade=t=out:st=${(MIOLO - 0.8).toFixed(2)}:d=0.8,adelay=${ms(t1)}|${ms(t1)},apad=whole_dur=${total.toFixed(2)}[mus]`);
  tempos.cenas.forEach((c, i) => {
    ent.push('-i', `fala-${c.id}.wav`);
    const q = ms(t1 + c.vozEm / tempos.fps);
    fil.push(`[${i + 3}:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=90,acompressor=threshold=0.1:ratio=3:attack=5:release=120,volume=1.6,adelay=${q}|${q}[v${i}]`);
  });
  fil.push(`${tempos.cenas.map((_, i) => `[v${i}]`).join('')}amix=inputs=${tempos.cenas.length}:normalize=0,apad=whole_dur=${total.toFixed(2)}[voz]`);
  fil.push('[voz]asplit=2[voz1][voz2]');
  fil.push('[mus][voz2]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[musd]');
  fil.push(`[voz1][musd][kit1][kit2]amix=inputs=4:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:${total.toFixed(2)}[a]`);
  ff([...ent, '-filter_complex', fil.join(';'), '-map', '[a]', '-ar', '48000', destinoAudio]);
};

// Compressao final (H.264, 2 passagens)
const montar = (video, audio, destino, kbps) => {
  ff(['-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '1', '-passlogfile', 'x264', '-an', '-f', 'mp4', 'NUL']);
  ff(['-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '2', '-passlogfile', 'x264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', destino]);
  console.log('ok', destino, (statSync(destino).size / 1e6).toFixed(1) + ' MB');
};

const fazer = (comp, o, bruto, destino, kbps) => {
  if (!arg('--so-montar') || !existsSync(join(saida, bruto))) remotion(comp, join(saida, bruto));
  const { t1, total } = emendar(bruto, MIOLO, o, `completo-${o}.mp4`);
  mixar(o, t1, total, `audio-${o}.wav`);
  montar(join(saida, `completo-${o}.mp4`), join(saida, `audio-${o}.wav`), destino, kbps);
  return { t1, total };
};

const teaser = arg('--so-teaser');
if (!teaser && !arg('--so-redes')) {
  const { t1, total } = fazer('Demo', 'h', 'demo-bruto.mp4', join(site, 'public/media/jr-demo.mp4'), 680);
  // capa: o painel real, depois da entrada da cena; o quadro sai do bruto, para ficar nitido
  ff(['-ss', '0.2', '-i', 'demo-bruto.mp4', '-frames:v', '1', 'poster.png']);
  await sharp(join(saida, 'poster.png')).webp({ quality: 82 }).toFile(join(site, 'public/media/poster.webp'));
  const ts = (s) => { const m = Math.floor(s / 60), x = (s % 60).toFixed(3).padStart(6, '0'); return `00:${String(m).padStart(2, '0')}:${x}`; };
  const vtt = ['WEBVTT', ''];
  for (const c of tempos.cenas) {
    const ini = t1 + c.vozEm / tempos.fps;
    vtt.push(`${ts(ini)} --> ${ts(ini + c.fala)}`, c.legenda, '');
  }
  writeFileSync(join(site, 'public/media/legendas.vtt'), vtt.join('\n'), 'utf8');
  console.log('duracao', total.toFixed(1) + 's');
}

if (!arg('--so-demo')) {
  if (!teaser) fazer('Vertical', 'v', 'vertical-bruto.mp4', join(redes, 'jr-vertical-9x16.mp4'), 1000);
  // Teaser: abertura do kit + 3 telas + logo final, so com musica (cerca de 15 s)
  const bruto = join(saida, 'teaser-bruto.mp4');
  if (!arg('--so-montar') || !existsSync(bruto)) remotion('Teaser', bruto);
  const durT = (105 + 120 + 75 - 30) / 30;
  const k = KITARQ.h;
  const t1 = DUR_AB - EM, t2 = t1 + durT - EM, fimCurto = 3;
  ff(['-i', k, '-i', bruto, '-i', k, '-filter_complex', [
    `[0:v]trim=${AB.de}:${AB.ate},setpts=(PTS-STARTPTS)/${AB.velocidade},fps=30,format=yuv420p,setsar=1,settb=AVTB[a]`,
    '[1:v]fps=30,format=yuv420p,setsar=1,settb=AVTB[m]',
    `[2:v]trim=5:${5 + fimCurto},setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1,settb=AVTB[z]`,
    `[a][m]xfade=transition=fade:duration=${EM}:offset=${t1.toFixed(3)}[x]`,
    `[x][z]xfade=transition=fade:duration=${EM}:offset=${t2.toFixed(3)}[v]`,
  ].join(';'), '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', 'teaser-completo.mp4']);
  const totalT = t2 + fimCurto;
  execFileSync(process.execPath, [join(aqui, 'musica.mjs'), totalT.toFixed(2), join(saida, 'musica-teaser.wav'), [t1 + 0.2, t1 + 3.3, t2 + 0.2].map((x) => x.toFixed(2)).join(',')], { stdio: 'inherit' });
  ff(['-i', 'teaser-completo.mp4', '-i', 'musica-teaser.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-14:TP=-1.5', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', join(redes, 'jr-teaser-15s.mp4')]);
  console.log('ok teaser');
}
console.log('pronto');
