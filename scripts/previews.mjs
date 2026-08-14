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

/** 16:10 — mesma proporção do card em Trabalhos.tsx. */
const LARGURA = 900;
const ALTURA = 563;

function endpoint(url) {
  const q = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    "viewport.width": String(LARGURA),
    "viewport.height": String(ALTURA),
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

  const webp = await sharp(bruto)
    .resize(LARGURA, ALTURA, { fit: "cover", position: "top" })
    .webp({ quality: 78 })
    .toBuffer();

  await writeFile(path.join(OUT, `${slug}.webp`), webp);
  return { origem: bruto.length, final: webp.length };
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
    const { origem, final } = await baixar(slug, url);
    const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
    console.log(`ok    ${slug.padEnd(14)} ${kb(origem).padStart(7)} -> ${kb(final).padStart(6)}`);
  } catch (err) {
    console.error(`FALHA ${slug.padEnd(14)} ${err.message}`);
    falhas++;
  }
}

process.exit(falhas > 0 ? 1 : 0);
