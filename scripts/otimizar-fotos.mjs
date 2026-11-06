// Reduz as fotos .webp que passam de 300 KB (peso ideal para o celular), sem mudar o nome nem a proporção.
// Uso:  npm run fotos            (pasta src/assets/produtos)
//       node scripts/otimizar-fotos.mjs <pasta> [pasta-dos-originais]
// O original de cada foto reduzida é copiado para design/fotos-originais/ (fora do Git) antes de ser substituído.
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pasta = path.resolve(process.argv[2] ?? path.join(raiz, "src/assets/produtos"));
const originais = path.resolve(process.argv[3] ?? path.join(raiz, "design/fotos-originais"));

const LIMITE = 300 * 1024; // só mexe em foto acima disto
const META = 220 * 1024; // peso que a ferramenta tenta atingir
const LARGURA_MAX = 1100; // suficiente para a foto grande do detalhe, também em tela de celular de alta resolução
const QUALIDADES = [82, 76, 70, 64, 58];
const FATORES = [1, 0.85, 0.7]; // se a qualidade sozinha não bastar, diminui também a largura
const kb = (n) => `${Math.round(n / 1024)} KB`;

async function reduzir(buffer) {
  const { width = LARGURA_MAX } = await sharp(buffer).metadata();
  let melhor = null;
  for (const fator of FATORES) {
    const largura = Math.min(width, Math.round(LARGURA_MAX * fator));
    for (const qualidade of QUALIDADES) {
      const saida = await sharp(buffer).rotate().resize({ width: largura, withoutEnlargement: true }).webp({ quality: qualidade, effort: 5 }).toBuffer();
      if (!melhor || saida.length < melhor.length) melhor = saida;
      if (saida.length <= META) return saida;
    }
  }
  return melhor;
}

const arquivos = (await readdir(pasta)).filter((f) => f.toLowerCase().endsWith(".webp"));
let mexidas = 0;
for (const nome of arquivos.sort()) {
  const caminho = path.join(pasta, nome);
  const antes = (await stat(caminho)).size;
  if (antes <= LIMITE) continue;
  const buffer = await readFile(caminho);
  const novo = await reduzir(buffer);
  if (novo.length >= antes) { console.log(`= ${nome}: já está no menor tamanho possível (${kb(antes)})`); continue; }
  await mkdir(originais, { recursive: true });
  try { await copyFile(caminho, path.join(originais, nome), 1 /* COPYFILE_EXCL: não sobrescreve um original já guardado */); } catch { /* já existe */ }
  await writeFile(caminho, novo);
  const m = await sharp(novo).metadata();
  console.log(`✓ ${nome}: ${kb(antes)} → ${kb(novo.length)} (${m.width}×${m.height})`);
  mexidas++;
}
console.log(mexidas ? `\n${mexidas} foto(s) reduzida(s). Originais guardados em ${path.relative(raiz, originais)}.` : `Nenhuma foto acima de ${kb(LIMITE)}: nada a fazer.`);
