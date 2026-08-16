import { checkDeps } from "./checks/deps.ts";
import { checkHeaders } from "./checks/headers.ts";
import { checkSecrets } from "./checks/secrets.ts";
import { checkSupabase } from "./checks/supabase.ts";
import {
  extractInlineScripts,
  extractScriptUrls,
  fetchBundles,
  fetchPage,
  normalizeUrl,
} from "./fetch-page.ts";
import { SEVERITY_ORDER, type Finding, type ScanContext, type ScanResult } from "./types.ts";

/*
  Orquestração do scan da porta 1 — só a URL, sem acesso ao código-fonte.

  Escopo deliberado: nenhuma ferramenta com licença restritiva entra aqui.
  A licença das regras do Semgrep proíbe uso "as a service", e este módulo
  é o que vai virar rota pública — então ele fica limitado a detecção
  própria. Semgrep só na auditoria paga, que é trabalho de consultoria.

  Tudo aqui é passivo: nenhuma requisição é mais intrusiva do que abrir o
  site no navegador. Ver checks/supabase.ts para o cuidado jurídico do
  único check que fala com a API do cliente.
*/

export async function scan(rawUrl: string): Promise<ScanResult> {
  const started = Date.now();
  const url = normalizeUrl(rawUrl);
  const checked: string[] = [];
  const warnings: string[] = [];

  const page = await fetchPage(url);

  const scriptUrls = extractScriptUrls(page.html, page.finalUrl);
  const { bundles, warnings: bundleWarnings } = await fetchBundles(scriptUrls);
  warnings.push(...bundleWarnings);

  // O JS inline entra como um "bundle" para o detector de segredos varrer.
  const inline = extractInlineScripts(page.html);
  if (inline.trim()) bundles.push({ url: `${page.finalUrl} (script inline)`, content: inline });

  const ctx: ScanContext = {
    url: page.finalUrl,
    html: page.html,
    headers: page.headers,
    bundles,
    warnings,
  };

  const findings: Finding[] = [];

  findings.push(...checkHeaders(ctx));
  checked.push("cabeçalhos de segurança");

  // Precisa vir antes do check de Supabase: é ele que descobre a anon key
  // e a URL do projeto, que o outro consome.
  findings.push(...checkSecrets(ctx));
  checked.push(`segredos em ${bundles.length} arquivo(s) servido(s)`);

  findings.push(...checkDeps(ctx));
  checked.push("bibliotecas com falha conhecida");

  if (ctx.supabase) {
    findings.push(...(await checkSupabase(ctx)));
    checked.push("exposição de tabelas do Supabase");
  }

  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return {
    url: page.finalUrl,
    startedAt: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    findings,
    checked,
    warnings: ctx.warnings,
  };
}

export type { Finding, ScanResult } from "./types.ts";
export { RULES } from "./rules.ts";
