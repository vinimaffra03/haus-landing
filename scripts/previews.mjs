/*
  Gera as imagens de preview dos projetos do portfólio.

  Roda sob demanda, não no build: baixa o screenshot de cada site, converte
  para WebP e grava em public/trabalhos/. Os arquivos ficam versionados —
  a landing NÃO depende de serviço externo em runtime.

  Uso:  node scripts/previews.mjs [slug]
        sem argumento, refaz todos.
*/

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "trabalhos");

const PROJETOS = {
  rickfretes: "https://rickfretes.vercel.app",
  quattromed: "https://quattro-med.vercel.app",
  alphaplanner: "https://alphaplanner.vercel.app",
  worknow: "https://worknow-delta.vercel.app",
  smokeside: "https://smokesideco.vercel.app",
  houdimedia: "https://houdimedia.vercel.app",
};

/*
  Largura fixa, ALTURA LIVRE.

  Antes eram todas 900x563 com fit:cover — ratio 1.60 idêntico nas seis, o que
  faz o masonry virar um grid comum. O efeito de masonry só existe com alturas
  diferentes, e sites diferentes têm páginas de comprimento diferente: capturando
  a proporção natural, a variação sai de graça.
*/
const LARGURA = 900;
/** Altura do viewport na captura — a página inteira é capturada mesmo assim. */
const VIEWPORT_ALTURA = 700;

/*
  A altura do card sai de uma FRAÇÃO da página real, não de um teto fixo.

  Cortar tudo em 1400px fazia as seis ficarem idênticas de novo, porque toda
  página é mais longa que isso. Usando 15% do comprimento real, sites longos
  geram cards altos e sites curtos geram cards baixos — que é exatamente a
  variação que o masonry precisa, e ela vem do site de verdade.

  Medido em 19/08/2026, a 900px de largura: smokeside 4.223px · rickfretes
  6.024 · alphaplanner 7.166 · quattromed 8.082 · worknow 8.637 · houdimedia
  9.410. A fração de 15% espalha isso entre ~630 e ~1400.
*/
const FRACAO = 0.15;
const ALTURA_MAX = 1400;
const ALTURA_MIN = 520;

function endpoint(url) {
  const q = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    "viewport.width": String(LARGURA),
    "viewport.height": String(VIEWPORT_ALTURA),
    fullPage: "true",
    waitUntil: "networkidle0",
  });
  return `https://api.microlink.io/?${q}`;
}

async function baixar(slug, url) {
  const res = await fetch(endpoint(url), { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const bruto = Buffer.from(await res.arrayBuffer());
  if (bruto.length < 20_000) {
    throw new Error(`retorno de ${(bruto.length / 1024).toFixed(0)}KB — provavelmente em branco`);
  }

  // metadata() descreve o arquivo ORIGINAL, não um resize pendente — por isso
  // a escala precisa ser calculada à mão antes de decidir a altura do corte.
  const meta = await sharp(bruto).metadata();
  const larguraOriginal = meta.width ?? LARGURA;
  const alturaOriginal = meta.height ?? ALTURA_MIN;

  const alturaNaEscala = alturaOriginal * (LARGURA / larguraOriginal);
  const altura = Math.round(
    Math.max(ALTURA_MIN, Math.min(ALTURA_MAX, alturaNaEscala * FRACAO)),
  );

  const webp = await sharp(bruto)
    .resize(LARGURA, altura, { fit: "cover", position: "top" })
    .webp({ quality: 78 })
    .toBuffer();

  await writeFile(path.join(OUT, `${slug}.webp`), webp);
  return { origem: bruto.length, final: webp.length, largura: LARGURA, altura };
}

const alvos = process.argv[2]
  ? { [process.argv[2]]: PROJETOS[process.argv[2]] }
  : PROJETOS;

await mkdir(OUT, { recursive: true });

let falhas = 0;
for (const [slug, url] of Object.entries(alvos)) {
  if (!url) {
    console.error(`slug desconhecido: ${slug}`);
    falhas++;
    continue;
  }
  try {
    const { origem, final, largura, altura } = await baixar(slug, url);
    const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
    console.log(
      `ok    ${slug.padEnd(14)} ${kb(origem).padStart(7)} -> ${kb(final).padStart(6)}  ${largura}x${altura}`,
    );
  } catch (err) {
    console.error(`FALHA ${slug.padEnd(14)} ${err.message}`);
    falhas++;
  }
}

process.exit(falhas > 0 ? 1 : 0);
