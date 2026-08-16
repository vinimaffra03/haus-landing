import { rule } from "../rules.ts";
import type { Finding, ScanContext } from "../types.ts";

/*
  Bibliotecas vulneráveis nos arquivos SERVIDOS — sem acesso ao package.json.

  É a abordagem do retire.js: identificar a lib e a versão pelo banner que
  ela mesma imprime no bundle, e comparar com faixas vulneráveis conhecidas.

  Limitação honesta e declarada no relatório: bundle minificado costuma
  apagar o banner de versão, então a ausência de achado aqui NÃO significa
  ausência de biblioteca vulnerável. A checagem completa exige o lockfile —
  e isso é a auditoria paga (porta 2), não o scan grátis.
*/

type VulnLib = {
  name: string;
  /** Captura a versão no grupo 1. */
  re: RegExp;
  /** Faixas vulneráveis, comparadas por semver simples. */
  vulnerableBelow: string;
  cve: string;
};

const KNOWN: VulnLib[] = [
  {
    name: "jQuery",
    re: /jQuery\s+v?(\d+\.\d+\.\d+)/i,
    vulnerableBelow: "3.5.0",
    cve: "CVE-2020-11022 / CVE-2020-11023 (XSS)",
  },
  {
    name: "Lodash",
    re: /lodash[@\s/-]v?(\d+\.\d+\.\d+)/i,
    vulnerableBelow: "4.17.21",
    cve: "CVE-2021-23337 (command injection)",
  },
  {
    name: "Axios",
    re: /axios[@\s/-]v?(\d+\.\d+\.\d+)/i,
    vulnerableBelow: "1.8.2",
    cve: "CVE-2025-27152 (SSRF)",
  },
  {
    name: "Moment.js",
    re: /moment\.js[@\s/-]?v?(\d+\.\d+\.\d+)/i,
    vulnerableBelow: "2.29.4",
    cve: "CVE-2022-31129 (ReDoS)",
  },
  {
    name: "Next.js",
    re: /"next"\s*:\s*"?v?(\d+\.\d+\.\d+)/i,
    vulnerableBelow: "14.2.25",
    cve: "CVE-2025-29927 (bypass de middleware)",
  },
];

/** Comparação semver simples — suficiente para "x.y.z" puro. */
function isBelow(version: string, threshold: string): boolean {
  const a = version.split(".").map(Number);
  const b = threshold.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
}

export function checkDeps(ctx: ScanContext): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<string>();
  const r = rule("07");

  for (const bundle of ctx.bundles) {
    for (const lib of KNOWN) {
      const m = lib.re.exec(bundle.content);
      lib.re.lastIndex = 0;
      if (!m) continue;

      const version = m[1];
      if (!isBelow(version, lib.vulnerableBelow)) continue;

      const key = `${lib.name}@${version}`;
      if (seen.has(key)) continue;
      seen.add(key);

      findings.push({
        rule: r.code,
        severity: r.severity,
        title: `${lib.name} ${version} tem falha conhecida`,
        evidence: `${lib.name} ${version} detectada no código servido. Corrigido a partir da ${lib.vulnerableBelow}. ${lib.cve}`,
        where: bundle.url,
        fix: r.fix,
      });
    }
  }

  return findings;
}
