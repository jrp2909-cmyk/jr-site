// Gera as imagens de compartilhamento (1200x630):
//  - public/og.jpg: logo + print do painel (pagina inicial e paginas sem imagem propria)
//  - public/og/<tipo>-<slug>.jpg: uma por funcionalidade, publico e artigo, com o titulo da pagina
// Uso: node scripts/og.mjs   (rodar de novo ao criar paginas ou mudar titulos)
import sharp from 'sharp';
import { resolve, join } from 'node:path';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';

const raiz = resolve(import.meta.dirname, '..');
const W = 1200, H = 630;
const FONTE = 'Segoe UI, Arial, sans-serif';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const fundo = Buffer.from(`<svg width="${W}" height="${H}"><defs>
  <radialGradient id="g" cx="80%" cy="70%" r="60%"><stop offset="0" stop-color="#f97316" stop-opacity=".30"/><stop offset="1" stop-color="#090e1a" stop-opacity="0"/></radialGradient>
  <radialGradient id="b" cx="5%" cy="0%" r="55%"><stop offset="0" stop-color="#1d3a8a" stop-opacity=".55"/><stop offset="1" stop-color="#1d3a8a" stop-opacity="0"/></radialGradient>
  <pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#94a3b8" stroke-opacity=".07"/></pattern>
</defs><rect width="100%" height="100%" fill="#090e1a"/><rect width="100%" height="100%" fill="url(#p)"/><rect width="100%" height="100%" fill="url(#b)"/><rect width="100%" height="100%" fill="url(#g)"/></svg>`);

const logo = await sharp(`${raiz}/src/assets/brand/logo.png`).resize({ width: 300 }).png().toBuffer();

// Pagina inicial
const painel = await sharp(`${raiz}/src/assets/desktop/01-dashboard.png`).resize({ width: 760 }).extract({ left: 0, top: 0, width: 760, height: 475 }).png().toBuffer();
const moldura = await sharp(painel).composite([{ input: Buffer.from(`<svg width="760" height="475"><rect x="1" y="1" width="758" height="473" rx="14" fill="none" stroke="#2b3b5c" stroke-width="2"/></svg>`) }]).png().toBuffer();
const logoHome = await sharp(`${raiz}/src/assets/brand/logo.png`).resize({ width: 380 }).png().toBuffer();
await sharp(fundo).composite([
  { input: logoHome, left: 50, top: 90, blend: 'lighten' },
  { input: moldura, left: 430, top: 120 },
  { input: Buffer.from(`<svg width="380" height="110"><text x="0" y="40" font-family="${FONTE}" font-size="30" font-weight="700" fill="#e8ecf4">Transforme conexões</text><text x="0" y="82" font-family="${FONTE}" font-size="30" font-weight="700" fill="#f97316">em reuniões.</text></svg>`), left: 50, top: 440 },
]).jpeg({ quality: 86 }).toFile(`${raiz}/public/og.jpg`);

// Quebra o titulo em linhas de ate ~26 caracteres
const linhas = (t, max = 26) => t.split(' ').reduce((acc, p) => {
  const ult = acc[acc.length - 1];
  if (ult && (ult + ' ' + p).length <= max) acc[acc.length - 1] = ult + ' ' + p; else acc.push(p);
  return acc;
}, []);

const frontmatter = (arq) => {
  const fm = readFileSync(arq, 'utf8').split(/^---$/m)[1];
  const campo = (k) => (fm.match(new RegExp(`^${k}: '?(.*?)'?$`, 'm')) ?? [])[1]?.replace(/''/g, "'");
  return { titulo: campo('titulo'), eyebrow: campo('nome') ?? campo('categoria') };
};

mkdirSync(`${raiz}/public/og`, { recursive: true });
const grupos = [['funcionalidades', 'Funcionalidade'], ['para', 'Para quem'], ['blog', 'Conteúdo']];
let n = 0;
for (const [pasta, rotulo] of grupos) {
  const dir = join(raiz, 'src/content', pasta);
  for (const arq of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const { titulo, eyebrow } = frontmatter(join(dir, arq));
    const ls = linhas(titulo).slice(0, 4);
    const tam = ls.length > 3 ? 54 : 62;
    const texto = ls.map((l, i) => `<text x="0" y="${i * (tam + 12) + tam}" font-family="${FONTE}" font-size="${tam}" font-weight="800" letter-spacing="-1.5" fill="#e8ecf4">${esc(l)}</text>`).join('');
    const svg = `<svg width="1100" height="440">
      <text x="0" y="26" font-family="Consolas, monospace" font-size="22" letter-spacing="4" fill="#fb923c">${esc((rotulo + ' · ' + (eyebrow ?? '')).toUpperCase())}</text>
      <g transform="translate(0 60)">${texto}</g></svg>`;
    await sharp(fundo).composite([
      { input: Buffer.from(svg), left: 70, top: 70 },
      // logo dentro de um cartao com a mesma cor de fundo da imagem (#030e22), para nao aparecer o retangulo
      { input: Buffer.from(`<svg width="332" height="196"><rect x="1" y="1" width="330" height="194" rx="22" fill="#030e22" stroke="#2b3b5c" stroke-width="2"/></svg>`), left: W - 332 - 50, top: H - 196 - 44 },
      { input: logo, left: W - 332 - 50 + 16, top: H - 196 - 44 + 16 },
      { input: Buffer.from(`<svg width="600" height="40"><text x="0" y="28" font-family="${FONTE}" font-size="24" fill="#a3aec4">www.jrcrm.com.br</text></svg>`), left: 70, top: H - 90 },
      { input: Buffer.from(`<svg width="${W}" height="8"><rect width="${W}" height="8" fill="#f97316"/></svg>`), left: 0, top: H - 8 },
    ]).jpeg({ quality: 86 }).toFile(`${raiz}/public/og/${pasta}-${arq.replace('.md', '')}.jpg`);
    n++;
  }
}
console.log(`og.jpg + ${n} imagens em public/og/`);
