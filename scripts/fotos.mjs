/*
  Processa as fotos dos sócios para a seção "quem faz" e a assinatura da /scan.

  Entrada:  fotos/<slug>.jpg   (fora do git — é material bruto)
  Saída:    public/trabalhos/../equipe/<slug>.webp   (versionado)

  Uso:  node scripts/fotos.mjs [slug]
        sem argumento, refaz todas.

  ── Por que preto e branco ─────────────────────────────────────────────────
  Não é enfeite. Os dois originais são selfies em iluminação completamente
  diferente — um em elevador com luz rosa refletindo em aço escovado, outro em
  ambiente claro com parede quente. Lado a lado, coloridos, leem como desleixo.
  Em P&B com contraste levantado viram decisão, e passam a conversar com o
  preto/papel/laranja da marca em vez de brigar com ele.

  ── Por que 192px ──────────────────────────────────────────────────────────
  A foto do De Lazzari tem ~299px de largura no original. 192px é o maior
  quadrado que ela aguenta sem interpolar para cima, e cobre exibição a 96px
  numa tela 2x — que é o teto declarado em src/components/Avatar.tsx.
  Aumentar aqui sem foto nova só produz borrão.

  ── Recorte ────────────────────────────────────────────────────────────────
  `gravity: "north"` em vez de centro: nas duas fotos o rosto está no terço
  superior, e um corte central pelo meio decapitaria os dois.
*/

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGEM = path.join(process.cwd(), "fotos");
const DESTINO = path.join(process.cwd(), "public", "equipe");

const PESSOAS = {
  vinicius: "Vinicius Mafra",
  delazzari: "João De Lazzari",
};

const LADO = 192;

async function existe(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function processar(slug) {
  const nome = PESSOAS[slug];

  // Aceita jpg, jpeg ou png — ninguém deveria ter que renomear arquivo à mão.
  const candidatos = ["jpg", "jpeg", "png", "webp"].map((ext) =>
    path.join(ORIGEM, `${slug}.${ext}`),
  );

  let entrada = null;
  for (const c of candidatos) {
    if (await existe(c)) {
      entrada = c;
      break;
    }
  }

  if (!entrada) {
    console.error(`✗ ${slug} (${nome}): nada encontrado em fotos/${slug}.{jpg,jpeg,png,webp}`);
    return false;
  }

  const bruto = await readFile(entrada);
  const meta = await sharp(bruto).metadata();

  const saida = await sharp(bruto)
    .rotate() // respeita o EXIF do celular; sem isto a foto sai deitada
    .resize(LADO, LADO, { fit: "cover", position: "north" })
    .grayscale()
    .linear(1.12, -10) // contraste leve: separa o rosto do fundo sem estourar
    .webp({ quality: 82 })
    .toBuffer();

  await mkdir(DESTINO, { recursive: true });
  const destino = path.join(DESTINO, `${slug}.webp`);
  await writeFile(destino, saida);

  const kb = (saida.length / 1024).toFixed(1);
  const aviso = Math.min(meta.width ?? 0, meta.height ?? 0) < LADO ? "  ⚠️ original menor que 192px" : "";
  console.log(
    `✓ ${slug} (${nome}): ${meta.width}x${meta.height} → ${LADO}x${LADO} · ${kb} KB${aviso}`,
  );
  return true;
}

const alvo = process.argv[2];
const slugs = alvo ? [alvo] : Object.keys(PESSOAS);

if (alvo && !PESSOAS[alvo]) {
  console.error(`Slug desconhecido: ${alvo}. Use um de: ${Object.keys(PESSOAS).join(", ")}`);
  process.exit(1);
}

let ok = 0;
for (const s of slugs) {
  if (await processar(s)) ok += 1;
}

console.log(`\n${ok}/${slugs.length} processadas em public/equipe/`);

if (ok > 0) {
  console.log("Agora preencha `photo` em src/content/site.ts, ex: photo: \"/equipe/vinicius.webp\"");
}

if (ok < slugs.length) process.exit(1);
