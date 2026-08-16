import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import { checkSupabase } from "../src/lib/scan/checks/supabase.ts";
import type { ScanContext } from "../src/lib/scan/types.ts";

/*
  O check de Supabase é o de maior valor e o mais sensível juridicamente.
  Não dá para verificá-lo contra alvo vivo de terceiro sem autorização, então
  aqui a lógica é provada com fetch mockado.

  O teste que mais importa é o último: garantir que NENHUMA linha de dado
  chegue ao relatório, mesmo que o servidor devolva linhas.
*/

const PROJETO = "https://abcdefghijklmnopqrst.supabase.co";
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function ctx(): ScanContext {
  return {
    url: "https://exemplo.com",
    html: "",
    headers: new Headers(),
    bundles: [],
    warnings: [],
    supabase: { projectUrl: PROJETO, anonKey: "chave-anon-de-teste" },
  };
}

/** Simula o PostgREST: schema no root, dados nas rotas de tabela. */
function mockSupabase(opts: {
  tabelas: string[];
  legiveis: string[];
  contagem?: number;
  /** Simula servidor devolvendo linha mesmo com limit=0 — não pode vazar. */
  corpoMalicioso?: unknown;
}) {
  const chamadas: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    chamadas.push(url);

    if (url.endsWith("/rest/v1/")) {
      return new Response(
        JSON.stringify({ definitions: Object.fromEntries(opts.tabelas.map((t) => [t, {}])) }),
        { status: 200 },
      );
    }

    const tabela = decodeURIComponent(url.split("/rest/v1/")[1]?.split("?")[0] ?? "");

    if (!opts.legiveis.includes(tabela)) {
      return new Response(JSON.stringify({ message: "permission denied" }), { status: 401 });
    }

    return new Response(JSON.stringify(opts.corpoMalicioso ?? []), {
      status: 200,
      headers: { "content-range": `*/${opts.contagem ?? 0}` },
    });
  }) as typeof fetch;

  return chamadas;
}

test("tabela legível pela anon key vira achado crítico", async () => {
  mockSupabase({ tabelas: ["clientes", "pedidos"], legiveis: ["clientes"], contagem: 4312 });

  const found = await checkSupabase(ctx());

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "01");
  assert.equal(found[0].severity, "critica");
  assert.match(found[0].title, /clientes/);
  assert.match(found[0].evidence, /4\.312/);
});

test("sempre usa limit=0 — é o que garante zero linha no corpo", async () => {
  const chamadas = mockSupabase({ tabelas: ["clientes"], legiveis: ["clientes"], contagem: 10 });

  await checkSupabase(ctx());

  const sondagem = chamadas.find((c) => c.includes("/rest/v1/clientes"));
  assert.ok(sondagem, "precisa sondar a tabela");
  assert.match(sondagem, /limit=0/, "sem limit=0 o servidor devolveria linhas");
});

test("tabela protegida não vira achado", async () => {
  mockSupabase({ tabelas: ["clientes", "segredos"], legiveis: [], contagem: 0 });

  const found = await checkSupabase(ctx());
  assert.equal(found.length, 0);
});

test("projeto sem Supabase detectado não faz requisição nenhuma", async () => {
  let chamou = false;
  globalThis.fetch = (async () => {
    chamou = true;
    return new Response("{}");
  }) as typeof fetch;

  const semSupabase = { ...ctx(), supabase: undefined };
  const found = await checkSupabase(semSupabase);

  assert.equal(found.length, 0);
  assert.equal(chamou, false);
});

test("projeto morto vira aviso, não quebra o scan", async () => {
  globalThis.fetch = (async () => {
    throw new Error("getaddrinfo ENOTFOUND");
  }) as typeof fetch;

  const c = ctx();
  const found = await checkSupabase(c);

  assert.equal(found.length, 0);
  assert.equal(c.warnings.length, 1);
  assert.match(c.warnings[0], /schema do Supabase/);
});

test("INVARIANTE: conteúdo de linha nunca chega ao relatório", async () => {
  // Servidor devolve dado pessoal mesmo tendo pedido limit=0.
  // Nada disso pode aparecer em title, evidence ou where.
  mockSupabase({
    tabelas: ["clientes"],
    legiveis: ["clientes"],
    contagem: 2,
    corpoMalicioso: [
      { id: 1, email: "vazou@exemplo.com", cpf: "12345678900" },
      { id: 2, email: "outro@exemplo.com", cpf: "09876543211" },
    ],
  });

  const found = await checkSupabase(ctx());
  const serializado = JSON.stringify(found);

  assert.ok(!serializado.includes("vazou@exemplo.com"), "e-mail não pode vazar para o relatório");
  assert.ok(!serializado.includes("12345678900"), "CPF não pode vazar para o relatório");
  assert.ok(!serializado.includes("cpf"), "nem nome de coluna sensível com valor");

  // Mas a prova de exposição precisa estar lá.
  assert.match(serializado, /clientes/);
  assert.match(serializado, /2 registro/);
});
