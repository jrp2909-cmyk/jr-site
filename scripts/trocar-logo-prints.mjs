// Troca SO a logo antiga da barra lateral pelos prints do sistema (o jr-crm ainda usa a logo antiga).
// O resto da tela fica igual. Os originais ficam em scripts/prints-originais/.
// Uso: node scripts/trocar-logo-prints.mjs
import sharp from 'sharp';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const pasta = join(raiz, 'src/assets/desktop');
const originais = join(raiz, 'scripts/prints-originais');
mkdirSync(originais, { recursive: true });

// Area da logo antiga nos prints de 2880x1800 (o texto "Just Relationship - CRM" abaixo dela continua)
const AREA = { left: 30, top: 32, width: 240, height: 105 };
const FUNDO_LATERAL = { r: 16, g: 24, b: 40, alpha: 1 }; // cor da barra lateral do sistema

const icone = await sharp(join(raiz, 'src/assets/marca/jr-icon-dark.png')).resize({ height: 98 }).png().toBuffer();
const { width: larg } = await sharp(icone).metadata();
const remendo = await sharp({ create: { width: AREA.width, height: AREA.height, channels: 4, background: FUNDO_LATERAL } })
  .composite([{ input: icone, left: Math.round(116 - larg / 2), top: 4 }])
  .png().toBuffer();

let n = 0;
for (const arq of readdirSync(pasta).filter((f) => /^\d\d-.*\.png$/.test(f) && !f.startsWith('40-'))) {
  const original = join(originais, arq);
  if (!existsSync(original)) copyFileSync(join(pasta, arq), original);
  await sharp(original).composite([{ input: remendo, left: AREA.left, top: AREA.top }]).png({ compressionLevel: 9 }).toFile(join(pasta, arq));
  n++;
}
console.log(`logo trocada em ${n} prints`);
