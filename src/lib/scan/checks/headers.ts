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
  /** Nome curto que aparece no título do achado, em português. */
  label: string;
  /** Como explicar a ausência para alguém não-técnico. */
  risk: string;
  /** Correção específica deste cabeçalho — genérica demais não ajuda ninguém. */
  fix: string;
};

const REQUIRED: HeaderSpec[] = [
  {
    name: "content-security-policy",
    label: "controle de scripts",
    risk: "sem ele, um script injetado na sua página consegue rodar livremente e roubar dados de quem está navegando",
    fix: "Defina Content-Security-Policy no `headers()` do next.config (ou no vercel.json). Comece por `Content-Security-Policy-Report-Only` para não quebrar a página, confira o console e só então promova para valer.",
  },
  {
    name: "strict-transport-security",
    label: "conexão sempre criptografada",
    risk: "sem ele, o navegador pode ser induzido a acessar seu site sem criptografia numa rede pública",
    fix: "Envie `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Deixe `preload` de fora até ter certeza — entrar na lista de preload é praticamente irreversível.",
  },
  {
    name: "x-frame-options",
    label: "proteção contra site embutido",
    risk: "sem ele, outro site pode embutir o seu numa moldura invisível e capturar os cliques dos seus usuários",
    fix: "Envie `X-Frame-Options: DENY` e, na CSP, `frame-ancestors 'none'`. Se o seu site precisa ser embutido em algum lugar específico, troque `none` pelo endereço permitido.",
  },
  {
    name: "x-content-type-options",
    label: "tipo de arquivo confiável",
    risk: "sem ele, o navegador pode interpretar um arquivo enviado por um usuário como se fosse código",
    fix: "Envie `X-Content-Type-Options: nosniff`. É uma linha, não tem efeito colateral e vale para o site inteiro.",
  },
  {
    name: "referrer-policy",
    label: "privacidade de navegação",
    risk: "sem ele, endereços internos do seu site vazam para terceiros quando alguém clica num link de saída",
    fix: "Envie `Referrer-Policy: strict-origin-when-cross-origin`. Endereços com identificador de usuário ou token deixam de vazar para fora.",
  },
];

/*
  Um achado POR cabeçalho, não um agregado.

  Antes os 5 viravam uma linha só — "4 cabeçalho(s) ausente(s)" — e o relatório
  terminava sempre em "1 achado(s)", independente do que o site tivesse. Além de
  esconder o tamanho do problema, isso empilhava quatro explicações diferentes
  dentro de uma única frase que ninguém lê até o fim.

  ⚠️ Cabeçalho ausente é o achado mais comum que existe: a Vercel serve só
  `strict-transport-security`, então todo Next.js sem `headers()` no config tem
  exatamente os outros quatro faltando. Continua MÉDIO por isso — é higiene
  real, mas não é o que diferencia um site do outro.
*/
export function checkHeaders(ctx: ScanContext): Finding[] {
  const r = rule("06");

  return REQUIRED.filter((h) => !ctx.headers.has(h.name)).map((h) => ({
    rule: r.code,
    severity: r.severity,
    title: `Proteção de navegador ausente: ${h.label}`,
    evidence: `O cabeçalho ${h.name} não é enviado pelo seu site — ${h.risk}.`,
    where: ctx.url,
    fix: h.fix,
  }));
}
