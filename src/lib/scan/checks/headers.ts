import { rule } from "../rules.ts";
import type { Finding, ScanContext } from "../types.ts";

/*
  Cabeçalhos de segurança. Verificação passiva pura — a resposta já veio
  na requisição da página, nenhuma chamada extra é feita.

  Optei por checagem própria em vez do mdn-http-observatory: são ~20 linhas,
  sem dependência nova, e o texto do achado fica na nossa voz em vez de sair
  com cara de saída de ferramenta.
*/

type HeaderSpec = {
  name: string;
  /** Como explicar a ausência para alguém não-técnico. */
  risk: string;
};

const REQUIRED: HeaderSpec[] = [
  {
    name: "content-security-policy",
    risk: "sem ela, um script injetado na página consegue rodar livremente",
  },
  {
    name: "strict-transport-security",
    risk: "sem ela, o navegador pode ser induzido a acessar seu site sem criptografia",
  },
  {
    name: "x-frame-options",
    risk: "sem ela, outro site pode embutir o seu numa moldura invisível e capturar cliques",
  },
  {
    name: "x-content-type-options",
    risk: "sem ela, o navegador pode interpretar um arquivo enviado como se fosse código",
  },
  {
    name: "referrer-policy",
    risk: "sem ela, endereços internos do seu site vazam para terceiros na navegação",
  },
];

export function checkHeaders(ctx: ScanContext): Finding[] {
  const missing = REQUIRED.filter((h) => !ctx.headers.has(h.name));
  if (missing.length === 0) return [];

  const r = rule("06");

  return [
    {
      rule: r.code,
      severity: r.severity,
      title: `${missing.length} cabeçalho(s) de segurança ausente(s)`,
      evidence: missing.map((h) => `${h.name}: ausente — ${h.risk}`).join("; "),
      where: ctx.url,
      fix: r.fix,
    },
  ];
}
