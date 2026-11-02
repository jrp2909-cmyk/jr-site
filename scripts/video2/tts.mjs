// Gera a narracao com a voz neural da Microsoft (Edge), uma faixa por cena.
// Envia apenas o texto do roteiro (publico) ao servico de voz do Edge; nao usa chave.
// Uso: node tts.mjs [voz]   (padrao: pt-BR-AntonioNeural; alternativa: pt-BR-FranciscaNeural)
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { cenas } from './cenas.mjs';

const voz = process.argv[2] ?? 'pt-BR-AntonioNeural';
const saida = join(import.meta.dirname, 'saida');
mkdirSync(saida, { recursive: true });

for (const c of cenas) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voz, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const tmp = join(saida, `tmp-${c.id}`);
  mkdirSync(tmp, { recursive: true });
  const { audioFilePath } = await tts.toFile(tmp, c.fala);
  copyFileSync(audioFilePath, join(saida, `voz-${c.id}.mp3`));
  tts.close?.();
  console.log('ok', c.id);
}
