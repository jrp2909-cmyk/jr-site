// Gera public/og.jpg (1200x630): logo + print do painel (dados ficticios) sobre o fundo da marca.
import sharp from 'sharp';
import { resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const W = 1200, H = 630;

const painel = await sharp(`${raiz}/src/assets/desktop/01-dashboard.png`)
  .resize({ width: 760 })
  .extract({ left: 0, top: 0, width: 760, height: 475 })
  .png()
  .toBuffer();

const moldura = await sharp(painel)
  .composite([{
    input: Buffer.from(`<svg width="760" height="475"><rect x="1" y="1" width="758" height="473" rx="14" fill="none" stroke="#2b3b5c" stroke-width="2"/></svg>`),
  }])
  .png()
  .toBuffer();

const logo = await sharp(`${raiz}/src/assets/brand/logo.png`).resize({ width: 380 }).png().toBuffer();

const fundo = Buffer.from(`<svg width="${W}" height="${H}"><defs>
  <radialGradient id="g" cx="75%" cy="60%" r="55%"><stop offset="0" stop-color="#f97316" stop-opacity=".28"/><stop offset="1" stop-color="#090e1a" stop-opacity="0"/></radialGradient>
</defs><rect width="100%" height="100%" fill="#090e1a"/><rect width="100%" height="100%" fill="url(#g)"/></svg>`);

await sharp(fundo)
  .composite([
    { input: logo, left: 50, top: 90, blend: 'lighten' },
    { input: moldura, left: 430, top: 120 },
    { input: Buffer.from(`<svg width="380" height="110"><text x="0" y="40" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#e8ecf4">Transforme conexões</text><text x="0" y="82" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#f97316">em reuniões.</text></svg>`), left: 50, top: 440 },
  ])
  .jpeg({ quality: 86 })
  .toFile(`${raiz}/public/og.jpg`);
console.log('og.jpg ok');
