import { UA } from "../fetch-page.ts";
import type { Finding, ScanContext } from "../types.ts";

/*
  Arquivos internos servidos publicamente: .env, .git e source map.

  ── POR QUE ESTE ARQUIVO É QUASE TODO VALIDAÇÃO ────────────────────────────
  A primeira versão desta sonda testou só o status HTTP e "achou" .env,
  .env.local, .env.production E .git/config num dos projetos do portfólio.
  Os quatro eram falsos: SPA na Vercel tem rewrite catch-all e devolve
  index.html com HTTP 200 para QUALQUER caminho. Até o .map "existia".

  Um scanner que acusa quatro críticos inexistentes no site de um cliente é
  pior que scanner nenhum — a primeira pessoa técnica que conferir queima a
  haus. inteira. Por isso status 200 aqui não prova nada: cada achado precisa
  passar por um validador de FORMA antes de virar linha no relatório.

  ── SOBRE LER O CORPO ──────────────────────────────────────────────────────
  Validar forma exige baixar o corpo, e isso é deliberado: é a leitura mínima
  necessária para não acusar errado. O que NÃO acontece é o conteúdo sair
  daqui. `evidence` carrega caminho, status, content-type e tamanho — nunca
  nome de variável, nunca valor, nunca trecho de código.

  Mesma invariante de checks/supabase.ts: prova-se por existência e formato,
  nunca por conteúdo. Ver tests/scan-exposure.test.ts.
*/

/** Caminhos sondados. Curto de propósito — cada um custa uma requisição. */
const CAMINHOS = [
  { path: "/.env", label: ".env" },
  { path: "/.env.local", label: ".env.local" },
  { path: "/.env.production", label: ".env.production" },
  { path: "/.git/config", label: ".git/config" },
  { path: "/.git/HEAD", label: ".git/HEAD" },
] as const;

/** Sonda rápida: se o site demora, o achado não vale segurar o scan. */
const PROBE_TIMEOUT_MS = 8_000;
/** Arquivo de config é pequeno; acima disso é quase certo ser outra coisa. */
const MAX_PROBE_BYTES = 512 * 1024;
/** Quantos bundles tentam source map. */
const MAX_MAPS = 3;

type Resposta = { status: number; tipo: string; corpo: string; bytes: number };

async function buscar(url: string): Promise<Resposta | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const corpo = (await res.text()).slice(0, MAX_PROBE_BYTES);
    return {
      status: res.status,
      tipo: (res.headers.get("content-type") ?? "").toLowerCase(),
      corpo,
      bytes: corpo.length,
    };
  } catch {
    return null;
  }
}

/*
  A porta de entrada de todo validador. Se voltou HTML, é a página do site —
  seja rewrite de SPA, seja página 404 personalizada respondendo 200.
*/
function ehHtml(r: Resposta): boolean {
  if (r.tipo.includes("text/html")) return true;
  return /^\s*(<!doctype html|<html[\s>])/i.test(r.corpo);
}

/** Pelo menos duas linhas no formato CHAVE=valor. Uma só é coincidência. */
function pareceEnv(corpo: string): boolean {
  const linhas = corpo
    .split(/\r?\n/)
    .filter((l) => /^\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=/.test(l));
  return linhas.length >= 2;
}

function pareceGitConfig(corpo: string): boolean {
  return /\[core\]/i.test(corpo) && /repositoryformatversion\s*=/i.test(corpo);
}

function pareceGitHead(corpo: string): boolean {
  return /^ref:\s+refs\/(heads|tags)\//.test(corpo.trim());
}

function validador(label: string): (corpo: string) => boolean {
  if (label === ".git/config") return pareceGitConfig;
  if (label === ".git/HEAD") return pareceGitHead;
  return pareceEnv;
}

/** Source map válido é JSON v3 com lista de fontes. */
function lerSourceMap(corpo: string): { fontes: number } | null {
  try {
    const j: unknown = JSON.parse(corpo);
    if (typeof j !== "object" || j === null) return null;
    const o = j as { version?: unknown; sources?: unknown };
    if (o.version !== 3 || !Array.isArray(o.sources)) return null;
    return { fontes: o.sources.length };
  } catch {
    return null;
  }
}

export async function checkExposure(ctx: ScanContext): Promise<Finding[]> {
  const base = new URL(ctx.url);
  const findings: Finding[] = [];

  // ---- Arquivos internos ----
  const sondas = await Promise.all(
    CAMINHOS.map(async ({ path, label }) => {
      const alvo = new URL(path, base.origin).toString();
      const r = await buscar(alvo);
      if (!r || ehHtml(r)) return null;
      if (!validador(label)(r.corpo)) return null;
      return { label, alvo, r };
    }),
  );

  const achadosArquivo = sondas.filter((s): s is NonNullable<typeof s> => s !== null);

  // .git/config e .git/HEAD são o mesmo problema — não reporta duas vezes.
  const git = achadosArquivo.filter((a) => a.label.startsWith(".git/"));
  const envs = achadosArquivo.filter((a) => !a.label.startsWith(".git/"));

  for (const { label, alvo, r } of envs) {
    findings.push({
      rule: "02",
      severity: "critica",
      title: `Arquivo ${label} acessível publicamente`,
      // Só metadado. Nenhuma variável, nenhum valor.
      evidence: `${label} responde HTTP ${r.status} como ${r.tipo || "tipo não declarado"} (${r.bytes} bytes) e tem formato de arquivo de ambiente. É onde ficam senhas de banco e chaves de API.`,
      where: alvo,
      fix: "Tire o arquivo de dentro da pasta publicada e trate TODAS as chaves que estavam nele como comprometidas — gere novas e revogue as antigas. Em Vite/Next o .env nunca deve ficar em public/ nem na raiz servida; confira também o .gitignore.",
    });
  }

  if (git.length > 0) {
    findings.push({
      rule: "02",
      severity: "critica",
      title: "Pasta .git acessível publicamente",
      evidence: `${git.map((g) => g.label).join(" e ")} responde${git.length > 1 ? "m" : ""} HTTP 200 com formato de repositório Git. Isso permite baixar o histórico do projeto, inclusive chaves que foram removidas depois.`,
      where: git[0].alvo,
      fix: "Bloqueie o acesso a /.git no servidor ou remova a pasta do diretório publicado. Depois revise o histórico atrás de credencial commitada — se houver, revogue: apagar do histórico não basta, alguém pode já ter baixado.",
    });
  }

  // ---- Source maps ----
  const candidatos = new Set<string>();

  for (const b of ctx.bundles) {
    if (b.url.includes("(script inline)")) continue;
    const m = /\/\/[#@]\s*sourceMappingURL=([^\s*]+)/.exec(b.content);
    if (m && !m[1].startsWith("data:")) {
      try {
        candidatos.add(new URL(m[1], b.url).toString());
      } catch {
        /* referência malformada */
      }
    } else if (candidatos.size < MAX_MAPS) {
      // Sem o comentário o .map ainda pode estar lá — vale um palpite barato.
      candidatos.add(`${b.url.split("?")[0]}.map`);
    }
    if (candidatos.size >= MAX_MAPS) break;
  }

  const maps = await Promise.all(
    [...candidatos].slice(0, MAX_MAPS).map(async (url) => {
      const r = await buscar(url);
      if (!r || ehHtml(r)) return null;
      const info = lerSourceMap(r.corpo);
      return info ? { url, fontes: info.fontes } : null;
    }),
  );

  const mapsOk = maps.filter((m): m is NonNullable<typeof m> => m !== null);

  if (mapsOk.length > 0) {
    const total = mapsOk.reduce((s, m) => s + m.fontes, 0);
    findings.push({
      /*
        Vai como 09 (separação teste/produção) e não como 02: source map não é
        segredo, é artefato de desenvolvimento que vazou para produção. Severidade
        elevada de média para alta porque o que vaza é o código-fonte inteiro.
      */
      rule: "09",
      severity: "alta",
      title: "Código-fonte original exposto por source map",
      // Contagem de arquivos, não os nomes nem o código.
      evidence: `${mapsOk.length} source map público, referenciando ${total} arquivo(s) do seu código original. Qualquer visitante consegue reconstruir o código-fonte do seu site, com comentários e endereços internos.`,
      where: mapsOk[0].url,
      fix: "Desligue a geração de source map em produção: no Vite, `build.sourcemap: false`; no Next.js, `productionBrowserSourceMaps: false` (que já é o padrão). Se você usa monitoramento de erro, envie o mapa para a ferramenta em vez de publicá-lo.",
    });
  }

  return findings;
}
