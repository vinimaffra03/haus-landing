import { rule } from "../rules.ts";
import type { Finding, ScanContext } from "../types.ts";

/*
  Detecta RLS ausente SEM LER UMA ÚNICA LINHA DE DADO.

  Este arquivo é o mais sensível do scanner, e a razão é jurídica, não técnica.
  A Lei 14.155/2021 removeu do art. 154-A do Código Penal o requisito de
  "violação indevida de mecanismo de segurança". Na prática: acessar dado
  exposto pode configurar crime mesmo quando não há nada a quebrar — que é
  exatamente o cenário de uma tabela sem RLS.

  Como provamos exposição sem tocar em dado:

    1. GET /rest/v1/  → devolve o schema OpenAPI: nomes de tabela, não conteúdo
    2. GET /rest/v1/<tabela>?select=*&limit=0  com Prefer: count=exact
       → limit=0 garante ZERO linha no corpo
       → o header Content-Range devolve a CONTAGEM

  Resultado: "tabela `clientes` legível publicamente, 4.312 registros" —
  prova irrefutável, e nenhum dado pessoal saiu do servidor do cliente.

  INVARIANTE DESTE ARQUIVO: nenhuma função pode retornar, logar ou colocar
  em `evidence` qualquer conteúdo de linha. Se um dia alguém precisar de
  amostra de dado, isso é outro produto, com autorização escrita separada.
*/

const TIMEOUT_MS = 10_000;
/** Teto de tabelas sondadas — evita rajada contra o projeto do cliente. */
const MAX_TABLES = 20;

type TableProbe = {
  table: string;
  readable: boolean;
  /** Contagem via Content-Range. null quando o servidor não informou. */
  count: number | null;
};

/** Lê os nomes de tabela do schema OpenAPI que o PostgREST publica. */
async function listExposedTables(projectUrl: string, anonKey: string): Promise<string[]> {
  const res = await fetch(`${projectUrl}/rest/v1/`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) return [];

  const spec = (await res.json()) as {
    definitions?: Record<string, unknown>;
    paths?: Record<string, unknown>;
  };

  if (spec.definitions) return Object.keys(spec.definitions);

  if (spec.paths) {
    return Object.keys(spec.paths)
      .filter((p) => p.startsWith("/") && p.length > 1 && !p.startsWith("/rpc/"))
      .map((p) => p.slice(1));
  }

  return [];
}

/**
 * Confirma legibilidade e obtém a contagem.
 * `limit=0` é o que garante que nenhuma linha volte no corpo.
 */
async function probeTable(projectUrl: string, anonKey: string, table: string): Promise<TableProbe> {
  const url = `${projectUrl}/rest/v1/${encodeURIComponent(table)}?select=*&limit=0`;

  const res = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Prefer: "count=exact",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) return { table, readable: false, count: null };

  // Content-Range vem como "0-0/1234" ou "*/1234" — só o total nos interessa.
  const range = res.headers.get("content-range");
  const total = range?.split("/")[1];
  const count = total && total !== "*" ? Number(total) : null;

  return { table, readable: true, count: Number.isFinite(count) ? count : null };
}

export async function checkSupabase(ctx: ScanContext): Promise<Finding[]> {
  if (!ctx.supabase) return [];

  const { projectUrl, anonKey } = ctx.supabase;
  const findings: Finding[] = [];

  let tables: string[];
  try {
    tables = await listExposedTables(projectUrl, anonKey);
  } catch (err) {
    ctx.warnings.push(`não foi possível ler o schema do Supabase: ${(err as Error).message}`);
    return [];
  }

  if (tables.length === 0) return [];

  const probes = await Promise.allSettled(
    tables.slice(0, MAX_TABLES).map((t) => probeTable(projectUrl, anonKey, t)),
  );

  const readable = probes
    .filter((p): p is PromiseFulfilledResult<TableProbe> => p.status === "fulfilled")
    .map((p) => p.value)
    .filter((p) => p.readable);

  if (readable.length === 0) return [];

  const r = rule("01");

  for (const probe of readable) {
    const registros =
      probe.count === null
        ? "contagem não informada pelo servidor"
        : `${probe.count.toLocaleString("pt-BR")} registro(s)`;

    findings.push({
      rule: r.code,
      severity: r.severity,
      title: `Tabela "${probe.table}" legível publicamente`,
      // Nome e contagem. Nenhum conteúdo de linha — ver comentário do topo.
      evidence: `Acessível com a chave pública do site, sem login: ${registros}. Verificado com limit=0, nenhuma linha foi lida.`,
      where: `${projectUrl}/rest/v1/${probe.table}`,
      fix: r.fix,
    });
  }

  return findings;
}
