// Gera as imagens de compartilhamento (1200x630) com a identidade do kit, usando o Chrome para desenhar:
//  - public/og.jpg: logo + print do painel (pagina inicial e paginas sem imagem propria)
//  - public/og/<tipo>-<slug>.jpg: uma por funcionalidade, publico e artigo, com o titulo da pagina
// Uso: node scripts/og.mjs   (rodar de novo ao criar paginas ou mudar titulos)
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const raiz = resolve(import.meta.dirname, '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = (p) => pathToFileURL(join(raiz, p)).href;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tmp = mkdtempSync(join(tmpdir(), 'og-'));

const moldura = (corpo) => `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Manrope; src: url('${url('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2')}'); font-weight: 200 800; }
* { margin: 0; box-sizing: border-box; } html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; font-family: Manrope, sans-serif; color: #F2F5FC; background: radial-gradient(90% 110% at 62% 50%, #0B1B45, #02060F); }
.arcos { position: absolute; inset: 0; } .barra { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: linear-gradient(90deg, #E24A00, #FF7A1A, #FFB45E); }
</style><svg class="arcos" viewBox="0 0 1200 630" fill="none" stroke="#7F9FE6"><circle cx="1020" cy="470" r="170" stroke-opacity=".24"/><circle cx="1020" cy="470" r="330" stroke-opacity=".16"/><circle cx="1020" cy="470" r="510" stroke-opacity=".1"/><circle cx="1020" cy="470" r="720" stroke-opacity=".06"/></svg>${corpo}<div class="barra"></div>`;

const fotografar = async (html, destino) => {
  const arq = join(tmp, 'pagina.html'), png = join(tmp, 'saida.png');
  writeFileSync(arq, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${join(tmp, 'perfil')}`, '--allow-file-access-from-files', '--window-size=1200,630', '--virtual-time-budget=1500', `--screenshot=${png}`, pathToFileURL(arq).href], { stdio: 'ignore' });
  await sharp(png).jpeg({ quality: 88 }).toFile(destino);
};

// Pagina inicial
await fotografar(moldura(`
  <img src="${url('src/assets/marca/jr-icon-dark.png')}" style="position:absolute;left:64px;top:70px;height:190px">
  <div style="position:absolute;left:64px;top:290px;width:470px;font-size:47px;font-weight:800;line-height:1.1;letter-spacing:-1.4px">Transforme leads em <span style="color:#FF9A3D">relacionamentos</span> que vendem.</div>
  <div style="position:absolute;left:64px;top:510px;width:470px;font-size:22px;color:#CEDAF5;font-weight:500">Social selling com IA para times comerciais.</div>
  <img src="${url('src/assets/desktop/01-dashboard.png')}" style="position:absolute;left:570px;top:96px;width:760px;border-radius:16px;border:2px solid #1E3160;box-shadow:0 30px 70px rgba(0,0,0,.6)">`), join(raiz, 'public/og.jpg'));

// Quebra o titulo em linhas de ate ~26 caracteres
const frontmatter = (arq) => {
  const fm = readFileSync(arq, 'utf8').split(/^---$/m)[1];
  const campo = (k) => (fm.match(new RegExp(`^${k}: '?(.*?)'?$`, 'm')) ?? [])[1]?.replace(/''/g, "'");
  return { titulo: campo('titulo'), eyebrow: campo('nome') ?? campo('categoria') };
};

mkdirSync(join(raiz, 'public/og'), { recursive: true });
const grupos = [['funcionalidades', 'Funcionalidade'], ['para', 'Para quem'], ['blog', 'Conteúdo']];
let n = 0;
for (const [pasta, rotulo] of grupos) {
  const dir = join(raiz, 'src/content', pasta);
  for (const arq of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { titulo, eyebrow } = frontmatter(join(dir, arq));
    const tam = titulo.length > 62 ? 54 : 64;
    await fotografar(moldura(`
      <div style="position:absolute;left:70px;top:66px;font-size:21px;font-weight:700;letter-spacing:3.5px;color:#FF9A3D;text-transform:uppercase">${esc(rotulo + ' · ' + (eyebrow ?? ''))}</div>
      <div style="position:absolute;left:70px;top:118px;width:1000px;font-size:${tam}px;font-weight:800;line-height:1.12;letter-spacing:-1.6px">${esc(titulo)}</div>
      <div style="position:absolute;left:70px;bottom:50px;font-size:24px;color:#CEDAF5;font-weight:500">www.jrcrm.com.br</div>
      <img src="${url('src/assets/marca/jr-icon-dark.png')}" style="position:absolute;right:62px;bottom:44px;height:136px">`), join(raiz, `public/og/${pasta}-${arq.replace('.md', '')}.jpg`));
    n++;
  }
}
rmSync(tmp, { recursive: true, force: true });
console.log(`og.jpg + ${n} imagens em public/og/`);
