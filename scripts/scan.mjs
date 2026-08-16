/*
  CLI do scanner da porta 1.

    node scripts/scan.mjs <url> [--json]

  Roda a mesma função que a rota /scan vai usar — sem duplicação.
*/

import { scan } from "../src/lib/scan/index.ts";

const COR = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  critica: "\x1b[31m",
  alta: "\x1b[33m",
  media: "\x1b[90m",
};

const ROTULO = {
  critica: "CRÍTICO",
  alta: "ALTO",
  media: "MÉDIO",
};

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
const asJson = args.includes("--json");

if (!url) {
  console.error("uso: node scripts/scan.mjs <url> [--json]");
  process.exit(2);
}

try {
  const result = await scan(url);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.findings.length > 0 ? 1 : 0);
  }

  const seg = (result.durationMs / 1000).toFixed(1);

  console.log(`\n${COR.bold}haus. — scan de superfície${COR.reset}`);
  console.log(`${COR.dim}${result.url} · ${seg}s${COR.reset}\n`);

  if (result.findings.length === 0) {
    console.log("Nenhum achado na verificação externa.\n");
    console.log(
      `${COR.dim}Isso NÃO significa que o app está seguro: 5 dos 9 itens do\n` +
        `checklist só ficam visíveis com acesso ao código-fonte.${COR.reset}\n`,
    );
  } else {
    for (const f of result.findings) {
      const cor = COR[f.severity];
      console.log(`${cor}${COR.bold}[${ROTULO[f.severity]}]${COR.reset} ${COR.bold}${f.title}${COR.reset}`);
      console.log(`  ${f.evidence}`);
      if (f.where) console.log(`  ${COR.dim}${f.where}${COR.reset}`);
      console.log(`  ${COR.dim}→ ${f.fix}${COR.reset}\n`);
    }

    const criticos = result.findings.filter((f) => f.severity === "critica").length;
    console.log(
      `${COR.bold}${result.findings.length} achado(s)${COR.reset}` +
        (criticos ? `, ${COR.critica}${criticos} crítico(s)${COR.reset}` : "") +
        "\n",
    );
  }

  console.log(`${COR.dim}verificado: ${result.checked.join(" · ")}${COR.reset}`);

  if (result.warnings.length) {
    console.log(`${COR.dim}avisos:${COR.reset}`);
    for (const w of result.warnings.slice(0, 5)) console.log(`${COR.dim}  ${w}${COR.reset}`);
  }
  console.log();

  process.exit(result.findings.length > 0 ? 1 : 0);
} catch (err) {
  console.error(`\nfalhou: ${err.message}\n`);
  process.exit(2);
}
