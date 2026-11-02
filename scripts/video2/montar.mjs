// Monta o video de demonstracao: cenas com zoom/pan, legendas, trechos do video original, voz e trilha.
// Pre-requisitos: node tts.mjs  (gera as vozes). Uso: node montar.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { cenas } from './cenas.mjs';

const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');
const raiz = resolve(import.meta.dirname, '..', '..');
const work = join(import.meta.dirname, 'saida');
mkdirSync(work, { recursive: true });
const KIT_VIDEO = 'C:/Users/usuario/jr-site-kit/video/jr-demo.mp4';
const FONTE_B = 'C\\:/Windows/Fonts/segoeuib.ttf';
const FONTE = 'C\\:/Windows/Fonts/segoeui.ttf';
const W = 3840, H = 2160, FPS = 30;
const VELOCIDADE = 1.15;

const ff = (args) => {
  try { return execFileSync(ffmpeg, ['-hide_banner', '-y', ...args], { cwd: work, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { console.error(String(e.stderr).split('\n').slice(-25).join('\n')); throw e; }
};
const duracao = (f) => {
  try { execFileSync(ffmpeg, ['-i', f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(e.stderr);
    return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
};
const txt = (nome, s) => { writeFileSync(join(work, nome), s, 'utf8'); return nome; };
const p = (rel) => join(raiz, rel);

// ---------- tempos ----------
let t = 0;
for (const c of cenas) {
  // corta o silencio das pontas e acelera um pouco a voz
  ff(['-i', `voz-${c.id}.mp3`, '-af', `silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=${VELOCIDADE}`, `fala-${c.id}.wav`]);
  c.fala_dur = duracao(join(work, `fala-${c.id}.wav`));
  c.dur = Math.max(c.min, c.fala_dur + 0.8);
  c.inicio = t;
  t += c.dur;
}
const TOTAL = t;
console.log('duracao total', TOTAL.toFixed(1));

// ---------- imagens ----------
const fundo = () => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
<radialGradient id="a" cx="85%" cy="105%" r="65%"><stop offset="0" stop-color="#f97316" stop-opacity=".30"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></radialGradient>
<radialGradient id="b" cx="10%" cy="-5%" r="60%"><stop offset="0" stop-color="#1d3a8a" stop-opacity=".55"/><stop offset="1" stop-color="#1d3a8a" stop-opacity="0"/></radialGradient>
</defs><rect width="100%" height="100%" fill="#090e1a"/><rect width="100%" height="100%" fill="url(#b)"/><rect width="100%" height="100%" fill="url(#a)"/></svg>`);

const arredondar = async (buf, w, h, raio) => {
  const img = await sharp(buf).resize(w, h, { fit: 'fill' }).png().toBuffer();
  return sharp(img).composite([{ input: Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${raio}" fill="#fff"/></svg>`), blend: 'dest-in' }]).png().toBuffer();
};
const sombra = (w, h, raio) => Buffer.from(`<svg width="${w + 200}" height="${h + 200}"><defs><filter id="f"><feGaussianBlur stdDeviation="40"/></filter></defs><rect x="100" y="120" width="${w}" height="${h}" rx="${raio}" fill="#000" opacity=".65" filter="url(#f)"/></svg>`);

async function coloca(base, arquivo, x, y, w, h, raio = 36, borda = true) {
  const img = await arredondar(p(arquivo), w, h, raio);
  const camadas = [{ input: sombra(w, h, raio), left: x - 100, top: y - 100 }, { input: img, left: x, top: y }];
  if (borda) camadas.push({ input: Buffer.from(`<svg width="${w}" height="${h}"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${raio}" fill="none" stroke="#2b3b5c" stroke-width="4"/></svg>`), left: x, top: y });
  return sharp(base).composite(camadas).png().toBuffer();
}

async function canvasDe(c, i = 0) {
  const nome = `canvas-${c.id}-${i}.png`;
  let base = await sharp(fundo()).png().toBuffer();
  if (c.tipo === 'telas') {
    base = await sharp(p(c.visuais[i].img)).resize(W, H, { fit: 'cover', position: 'top' }).png().toBuffer();
  } else if (c.tipo === 'logo') {
    const lw = c.logoPequeno ? 1250 : 1700;
    const lh = Math.round(lw * 390 / 720);
    const logo = await sharp(p('src/assets/brand/logo.png')).resize(lw, lh).png().toBuffer();
    base = await sharp(base).composite([{ input: logo, left: Math.round((W - lw) / 2), top: c.logoPequeno ? 260 : 330, blend: 'lighten' }]).png().toBuffer();
  } else if (c.tipo === 'termometro') {
    base = await coloca(base, 'src/assets/recortes/termometro-topo.png', 260, 110, 1370, 1480, 40);
    base = await coloca(base, 'src/assets/desktop/06-empresa-ficha-termometro.png', 1900, 150, 1750, 1094, 36);
    base = await coloca(base, 'src/assets/recortes/termometro-filtro-faixas.png', 1900, 1330, 1750, 243, 28);
  } else if (c.tipo === 'relatorios') {
    const arq = ['rel-simples-topo', 'rel-medio-topo', 'rel-detalhado-topo'];
    for (let k = 0; k < 3; k++) base = await coloca(base, `src/assets/desktop/${arq[k]}.png`, 24 + k * (1184 + 108), 110, 1184, 1480, 28, false);
  } else if (c.tipo === 'celulares') {
    const arq = ['30-mobile-dashboard', '31-mobile-funil', '32-mobile-tarefas'];
    for (let k = 0; k < 3; k++) {
      const w = 721, h = 1560, x = Math.round(W / 2 - 360 + (k - 1) * 1000), y = k === 1 ? 70 : 150;
      base = await sharp(base).composite([{ input: Buffer.from(`<svg width="${w + 40}" height="${h + 40}"><rect x="2" y="2" width="${w + 36}" height="${h + 36}" rx="84" fill="#05080f" stroke="#2b3b5c" stroke-width="5"/></svg>`), left: x - 20, top: y - 20 }]).png().toBuffer();
      base = await coloca(base, `src/assets/mobile/${arq[k]}.png`, x, y, w, h, 66, false);
    }
  } else if (c.tipo === 'comando') {
    base = await coloca(base, 'src/assets/desktop/40-extensao-popup.png', 2300, 160, 1120, 1484, 44);
  }
  await sharp(base).png().toFile(join(work, nome));
  return nome;
}

// ---------- filtros ----------
const zoompan = (k, dv, z0, z1, f0, f1) => {
  const N = Math.max(1, Math.round(dv * FPS));
  const pr = `min(on/${N},1)`, E = `(${pr}*${pr}*(3-2*${pr}))`;
  const fx = `(${f0[0]}+(${f1[0]}-${f0[0]})*${E})`, fy = `(${f0[1]}+(${f1[1]}-${f0[1]})*${E})`;
  return `[${k}:v]zoompan=z='${z0}+(${z1}-${z0})*${E}':x='max(0,min(iw-iw/zoom,${fx}*iw-iw/zoom/2))':y='max(0,min(ih-ih/zoom,${fy}*ih-ih/zoom/2))':d=1:s=1920x1080:fps=${FPS},setsar=1[v${k}]`;
};

function legendaFiltros(c) {
  if (!c.legenda) return [];
  const [titulo, sub] = c.legenda;
  const larg = Math.min(1740, Math.round(150 + Math.max(titulo.length * 35, (sub ?? '').length * 20) + 80));
  const topo = sub ? 800 : 880, alt = sub ? 240 : 160;
  const f = [
    `drawbox=x=0:y=${topo}:w=${larg}:h=${alt}:color=0x090e1a@0.82:t=fill:enable='gte(t,0.3)'`,
    `drawbox=x=90:y=${topo + 28}:w=8:h=${alt - 56}:color=0xf97316:t=fill:enable='gte(t,0.3)'`,
    `drawtext=fontfile='${FONTE_B}':textfile='${txt(`cap-${c.id}-t.txt`, titulo)}':fontsize=62:fontcolor=white:x=130:y=${topo + 36}:enable='gte(t,0.3)'`,
  ];
  if (sub) f.push(`drawtext=fontfile='${FONTE}':textfile='${txt(`cap-${c.id}-s.txt`, sub)}':fontsize=38:fontcolor=0xc9d1e3:x=130:y=${topo + 134}:enable='gte(t,0.3)'`);
  return f;
}

const notaFicticia = (c) => `drawtext=fontfile='${FONTE}':textfile='${txt('nota.txt', 'Imagens com dados fictícios de demonstração.')}':fontsize=24:fontcolor=white@0.7:x=w-text_w-40:y=h-46:enable='gte(t,0.3)'`;

function textoCentralizado(arquivo, rotulo, cor, y, T, tam = 88, fonte = FONTE_B) {
  const a = `if(lt(t,${T}),0,min(1,(t-${T})/0.35))`;
  return `drawtext=fontfile='${fonte}':textfile='${txt(arquivo, rotulo)}':fontsize=${tam}:fontcolor=0x${cor}:x=(w-text_w)/2:y='${y}+34*(1-min(1,max(0,(t-${T})/0.35)))':alpha='${a}'`;
}

// ---------- renderizar cenas ----------
const saidas = [];
for (const c of cenas) {
  const D = c.dur;
  const entradas = [];
  const filtros = [];
  let rotulo;
  if (c.tipo === 'clipe') {
    entradas.push('-ss', String(c.ss), '-t', String(D), '-i', KIT_VIDEO);
    filtros.push(`[0:v]fps=${FPS},scale=1920:1080,setsar=1,tpad=stop_mode=clone:stop_duration=8,trim=duration=${D},setpts=PTS-STARTPTS,drawbox=x=0:y=830:w=1920:h=250:color=0x090e1a:t=fill[vc]`);
    rotulo = 'vc';
  } else {
    const visuais = c.tipo === 'telas' ? c.visuais : [{ z: c.tipo === 'termometro' ? [1.0, 1.1] : c.tipo === 'relatorios' ? [1.5, 1.5] : c.tipo === 'celulares' ? [1.0, 1.14] : c.tipo === 'texto' ? [1.0, 1.05] : [1.0, 1.1], f: c.tipo === 'relatorios' ? [[0.2, 0.42], [0.8, 0.42]] : [[0.5, 0.5], [0.5, 0.5]] }];
    const dv = D / visuais.length;
    for (let i = 0; i < visuais.length; i++) {
      const arq = await canvasDe(c, i);
      entradas.push('-loop', '1', '-framerate', String(FPS), '-t', dv.toFixed(3), '-i', arq);
      const v = visuais[i];
      filtros.push(zoompan(i, dv, v.z[0], v.z[1], v.f[0], v.f[1]));
    }
    if (visuais.length > 1) {
      filtros.push(`${visuais.map((_, i) => `[v${i}]`).join('')}concat=n=${visuais.length}:v=1:a=0[vc]`);
      rotulo = 'vc';
    } else rotulo = 'v0';
  }

  const extras = [];
  if (c.tipo === 'texto') c.linhas.forEach(([s, cor], k) => extras.push(textoCentralizado(`lin-${c.id}-${k}.txt`, s, cor, 380 + k * 170, (0.4 + k * D * 0.27).toFixed(2))));
  if (c.tipo === 'comando') {
    extras.push(textoCentralizado('cmd-1.txt', 'A IA sugere.', 'ffffff', 300, 0.4, 130).replace('x=(w-text_w)/2', 'x=110'));
    extras.push(textoCentralizado('cmd-2.txt', 'Você decide.', 'f97316', 480, (0.4 + D * 0.3).toFixed(2), 130).replace('x=(w-text_w)/2', 'x=110'));
    extras.push(textoCentralizado('cmd-3.txt', 'Nada é enviado sem você.', 'c9d1e3', 700, (0.4 + D * 0.6).toFixed(2), 54, FONTE).replace('x=(w-text_w)/2', 'x=114'));
  }
  const ui = ['telas', 'clipe', 'termometro', 'relatorios', 'celulares'].includes(c.tipo);
  const cadeia = [...extras, ...legendaFiltros(c), ...(ui ? [notaFicticia(c)] : []),
    `fade=t=in:st=0:d=0.22`, `fade=t=out:st=${(D - 0.22).toFixed(2)}:d=0.22`, 'format=yuv420p'];
  filtros.push(`[${rotulo}]${cadeia.join(',')}[saida]`);

  const arqSaida = `cena-${c.id}.mp4`;
  ff([...entradas, '-filter_complex', filtros.join(';'), '-map', '[saida]', '-t', D.toFixed(3), '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', arqSaida]);
  saidas.push(arqSaida);
  console.log('cena', c.id, D.toFixed(1) + 's');
}

writeFileSync(join(work, 'lista.txt'), saidas.map((s) => `file '${s}'`).join('\n'));
ff(['-f', 'concat', '-safe', '0', '-i', 'lista.txt', '-c', 'copy', 'video-mudo.mp4']);

// ---------- audio ----------
execFileSync(process.execPath, [join(import.meta.dirname, 'musica.mjs'), TOTAL.toFixed(1), join(work, 'musica.wav')], { stdio: 'inherit' });
const ent = ['-i', 'video-mudo.mp4', '-i', 'musica.wav'];
const fa = [];
cenas.forEach((c, i) => {
  ent.push('-i', `fala-${c.id}.wav`);
  const ms = Math.round((c.inicio + 0.35) * 1000);
  fa.push(`[${i + 2}:a]aresample=44100,aformat=channel_layouts=stereo,highpass=f=80,volume=1.5,adelay=${ms}|${ms}[v${i}]`);
});
fa.push(`${cenas.map((_, i) => `[v${i}]`).join('')}amix=inputs=${cenas.length}:normalize=0[voz]`);
fa.push(`[1:a]volume=0.55,atrim=0:${TOTAL.toFixed(2)}[mus]`);
fa.push('[voz]asplit=2[voz1][voz2]');
fa.push('[mus][voz2]sidechaincompress=threshold=0.015:ratio=7:attack=30:release=450[musd]');
fa.push(`[voz1][musd]amix=inputs=2:normalize=0,alimiter=limit=0.95,afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5[a]`);
const destino = p('public/media/jr-demo.mp4');
ff([...ent, '-filter_complex', fa.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', destino]);

// ---------- legendas (WebVTT) e poster ----------
const ts = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = (s % 60).toFixed(3).padStart(6, '0'); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x}`; };
const vtt = ['WEBVTT', ''];
for (const c of cenas) {
  const ini = c.inicio + 0.35;
  vtt.push(`${ts(ini)} --> ${ts(ini + c.fala_dur)}`, c.fala.replaceAll('Júnior C R M', 'JR! (Júnior CRM)').replaceAll('C R M', 'CRM'), '');
}
writeFileSync(p('public/media/legendas.vtt'), vtt.join('\n'), 'utf8');
ff(['-ss', '2.6', '-i', destino, '-frames:v', '1', 'poster.png']);
await sharp(join(work, 'poster.png')).webp({ quality: 82 }).toFile(p('public/media/poster.webp'));
console.log('pronto:', destino, TOTAL.toFixed(1) + 's');



