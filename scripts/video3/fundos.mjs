// Pre-renderiza o fundo do video com a identidade do kit: gradiente azul-marinho e arcos de radar.
// Assim cada quadro nao precisa desenhar o gradiente de novo, o que deixa o render bem mais leve.
import sharp from 'sharp';
import { join } from 'node:path';

const L = 1920;
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}">
<defs><radialGradient id="g" cx="60%" cy="42%" r="70%"><stop offset="0" stop-color="#0B1B45"/><stop offset="1" stop-color="#02060F"/></radialGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<g fill="none" stroke="#7F9FE6">
<circle cx="1500" cy="520" r="280" stroke-opacity=".2"/><circle cx="1500" cy="520" r="540" stroke-opacity=".14"/>
<circle cx="1500" cy="520" r="820" stroke-opacity=".09"/><circle cx="1500" cy="520" r="1120" stroke-opacity=".05"/>
</g></svg>`);

await sharp(svg).jpeg({ quality: 92 }).toFile(join(import.meta.dirname, 'public', 'img', 'fundo.jpg'));
console.log('fundo ok');
