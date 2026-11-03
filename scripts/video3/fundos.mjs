// Pre-renderiza os fundos do video (grade + brilhos + vinheta) em duas versoes: fria (azul) e quente (laranja).
// No video eles so se misturam por opacidade, o que deixa cada quadro muito mais leve de desenhar.
import sharp from 'sharp';
import { join } from 'node:path';

const L = 1920;
const svg = (c1, a1, a2) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}">
<defs>
  <pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#94a3b8" stroke-opacity=".07" stroke-width="1"/></pattern>
  <radialGradient id="m" cx="50%" cy="45%" r="60%"><stop offset=".25" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="mk"><rect width="100%" height="100%" fill="url(#m)"/></mask>
  <radialGradient id="g1" cx="18%" cy="8%" r="50%"><stop offset="0" stop-color="${c1}" stop-opacity="${a1}"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="88%" cy="95%" r="50%"><stop offset="0" stop-color="#f97316" stop-opacity="${a2}"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></radialGradient>
  <radialGradient id="v" cx="50%" cy="50%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
</defs>
<rect width="100%" height="100%" fill="#090e1a"/>
<rect width="100%" height="100%" fill="url(#p)" mask="url(#mk)"/>
<rect width="100%" height="100%" fill="url(#g1)"/>
<rect width="100%" height="100%" fill="url(#g2)"/>
<rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);

const pub = join(import.meta.dirname, 'public', 'img');
await sharp(svg('#1d3a8a', 0.4, 0.16)).jpeg({ quality: 92 }).toFile(join(pub, 'fundo-frio.jpg'));
await sharp(svg('#f97316', 0.42, 0.34)).jpeg({ quality: 92 }).toFile(join(pub, 'fundo-quente.jpg'));
console.log('fundos ok');
