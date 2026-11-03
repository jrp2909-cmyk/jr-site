// Renderiza o video do JR! (precisa de `node preparar.mjs` antes).
// Saidas: public/media/jr-demo.mp4 (+ poster.webp e legendas.vtt) no site e, em saida/redes/,
// a versao vertical (9:16) e o teaser de 15 s para redes sociais.
// Uso: node render.mjs [--so-demo | --so-redes | --emendar-intro]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp'; // vem do node_modules do site

const aqui = import.meta.dirname;
const site = resolve(aqui, '..', '..');
const ffmpeg = createRequire(join(site, 'package.json'))('ffmpeg-static');
const saida = join(aqui, 'saida');
const redes = join(saida, 'redes');
mkdirSync(redes, { recursive: true });
const tempos = JSON.parse(readFileSync(join(aqui, 'src', 'tempos.json'), 'utf8'));
const TOTAL = tempos.total / tempos.fps;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const ff = (args) => execFileSync(ffmpeg, ['-hide_banner', '-y', ...args], { cwd: saida, stdio: ['ignore', 'ignore', 'pipe'] });
// Empacota uma vez e renderiza a partir do pacote. concurrency 2: nesta maquina (4 nucleos, pouca RAM)
// mais abas em paralelo travam tudo; ~1 s por quadro em 1080p.
const CLI = join(aqui, 'node_modules/@remotion/cli/remotion-cli.js');
const BUNDLE = join(saida, 'bundle');
execFileSync(process.execPath, [join(aqui, 'fundos.mjs')], { stdio: 'inherit' });
execFileSync(process.execPath, [CLI, 'bundle', 'src/index.ts', '--out-dir', BUNDLE], { cwd: aqui, stdio: 'inherit' });
const remotion = (comp, arq) => {
  console.log('render', comp, new Date().toLocaleTimeString());
  execFileSync(process.execPath, [CLI, 'render', BUNDLE, comp, arq, '--muted', '--crf=16', `--browser-executable=${CHROME}`, '--concurrency=2'], { cwd: aqui, stdio: 'inherit' });
};

// 1) trilha com efeitos nos cortes
const cortes = tempos.cenas.slice(1).map((c) => ((c.inicio + tempos.transicao / 2) / tempos.fps).toFixed(3));
execFileSync(process.execPath, [join(aqui, 'musica.mjs'), TOTAL.toFixed(2), join(saida, 'musica.wav'), cortes.join(',')], { stdio: 'inherit' });

// 2) mixagem: vozes no tempo certo + musica com ducking + loudness de -14 LUFS
const ent = ['-i', 'musica.wav'];
const fil = [];
tempos.cenas.forEach((c, i) => {
  ent.push('-i', `fala-${c.id}.wav`);
  const ms = Math.round((c.vozEm / tempos.fps) * 1000);
  fil.push(`[${i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=90,acompressor=threshold=0.1:ratio=3:attack=5:release=120,volume=1.6,adelay=${ms}|${ms}[v${i}]`);
});
fil.push(`${tempos.cenas.map((_, i) => `[v${i}]`).join('')}amix=inputs=${tempos.cenas.length}:normalize=0,apad=whole_dur=${TOTAL.toFixed(2)}[voz]`);
fil.push('[voz]asplit=2[voz1][voz2]');
fil.push(`[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.5[mus]`);
fil.push('[mus][voz2]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[musd]');
fil.push(`[voz1][musd]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:${TOTAL.toFixed(2)}[a]`);
ff([...ent, '-filter_complex', fil.join(';'), '-map', '[a]', '-ar', '48000', 'audio.wav']);

// 3) render das composicoes e montagem final (H.264, 2 passagens, ~5 MB para 1 min)
const montar = (video, destino, kbps) => {
  ff(['-i', video, '-i', 'audio.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '1', '-passlogfile', 'x264', '-an', '-f', 'mp4', 'NUL']);
  ff(['-i', video, '-i', 'audio.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '2', '-passlogfile', 'x264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', destino]);
  console.log('ok', destino, (statSync(destino).size / 1e6).toFixed(1) + ' MB');
};
const destino = join(site, 'public/media/jr-demo.mp4');
if (process.argv.includes('--emendar-intro')) {
  // refaz so a abertura (cena 1) e emenda no render ja pronto, sem repetir os 30 min do video inteiro
  const fim = tempos.cenas[0].quadros;
  execFileSync(process.execPath, [CLI, 'render', BUNDLE, 'Demo', join(saida, 'intro-bruto.mp4'), '--muted', '--crf=16', `--frames=0-${fim - 1}`, `--browser-executable=${CHROME}`, '--concurrency=2'], { cwd: aqui, stdio: 'inherit' });
  ff(['-i', 'intro-bruto.mp4', '-i', 'demo-bruto.mp4', '-filter_complex', `[1:v]trim=start_frame=${fim},setpts=PTS-STARTPTS[b];[0:v][b]concat=n=2:v=1[v]`, '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', 'demo-emendado.mp4']);
  montar(join(saida, 'demo-emendado.mp4'), destino, 560);
} else if (!process.argv.includes('--so-redes')) {
  remotion('Demo', join(saida, 'demo-bruto.mp4'));
  montar(join(saida, 'demo-bruto.mp4'), destino, 560);
}

// 4) poster (abertura com a logo) e legendas WebVTT
// o poster sai da versao de alta qualidade (antes da compressao final), para ficar nitido
const bruto = existsSync(join(saida, 'demo-emendado.mp4')) && process.argv.includes('--emendar-intro') ? 'demo-emendado.mp4' : existsSync(join(saida, 'intro-bruto.mp4')) && process.argv.includes('--so-redes') ? 'intro-bruto.mp4' : 'demo-bruto.mp4';
ff(['-ss', '3.6', '-i', bruto, '-frames:v', '1', 'poster.png']);
await sharp(join(saida, 'poster.png')).webp({ quality: 82 }).toFile(join(site, 'public/media/poster.webp'));
const ts = (s) => { const m = Math.floor(s / 60), x = (s % 60).toFixed(3).padStart(6, '0'); return `00:${String(m).padStart(2, '0')}:${x}`; };
const vtt = ['WEBVTT', ''];
for (const c of tempos.cenas) {
  const ini = c.vozEm / tempos.fps;
  vtt.push(`${ts(ini)} --> ${ts(ini + c.fala)}`, c.legenda, '');
}
writeFileSync(join(site, 'public/media/legendas.vtt'), vtt.join('\n'), 'utf8');

if (!process.argv.includes('--so-demo') && !process.argv.includes('--emendar-intro')) {
  remotion('Vertical', join(saida, 'vertical-bruto.mp4'));
  montar(join(saida, 'vertical-bruto.mp4'), join(redes, 'jr-vertical-9x16.mp4'), 900);
  // teaser: so musica (sem narracao), 15 s
  remotion('Teaser', join(saida, 'teaser-bruto.mp4'));
  execFileSync(process.execPath, [join(aqui, 'musica.mjs'), '15', join(saida, 'musica-teaser.wav'), '2.75,7.25,11.25'], { stdio: 'inherit' });
  ff(['-i', 'teaser-bruto.mp4', '-i', 'musica-teaser.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-14:TP=-1.5', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', join(redes, 'jr-teaser-15s.mp4')]);
  console.log('ok teaser');
}
console.log('pronto');
