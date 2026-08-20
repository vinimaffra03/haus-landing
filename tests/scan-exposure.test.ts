import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import { checkExposure } from "../src/lib/scan/checks/exposure.ts";
import type { ScanContext } from "../src/lib/scan/types.ts";

/*
  Dois perigos opostos, e os dois quebram o negócio:

  1. FALSO POSITIVO. SPA na Vercel tem rewrite catch-all e devolve index.html
     com HTTP 200 para qualquer caminho. A primeira versão desta sonda "achou"
     .env, .env.local, .env.production e .git/config num projeto do portfólio —
     os quatro inexistentes. Acusar quatro críticos falsos no site de um cliente
     queima a haus. na primeira conferida.

  2. VAZAMENTO. Validar o formato exige baixar o corpo. Nada desse corpo pode
     sair em `evidence` — nem nome de variável, nem valor, nem código.

  O teste de vazamento é o par de scan-supabase.test.ts e de whatsapp.test.ts.
*/

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function ctx(bundles: { url: string; content: string }[] = []): ScanContext {
  return {
    url: "https://exemplo.com/",
    html: "",
    headers: new Headers(),
    bundles,
    warnings: [],
  };
}

function responder(mapa: Record<string, { corpo: string; tipo?: string }>) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const path = new URL(url).pathname;
    const achado = mapa[path];

    if (!achado) return new Response("not found", { status: 404 });

    return new Response(achado.corpo, {
      status: 200,
      headers: { "content-type": achado.tipo ?? "text/plain" },
    });
  }) as typeof fetch;
}

const ENV_REAL = [
  "DATABASE_URL=postgres://admin:SenhaSuperSecreta123@db.host:5432/app",
  "STRIPE_SECRET_KEY=sk_live_ZZZZexemploZZZZ",
  "SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiJ9.PAYLOAD.ASSINATURA",
].join("\n");

/* O que a Vercel devolve para QUALQUER caminho num SPA. */
const SPA_FALLBACK = '<!doctype html>\n<html lang="pt-BR">\n<head><title>App</title></head>\n</html>';

test("SPA que responde 200 em tudo NÃO gera achado", async () => {
  responder({
    "/.env": { corpo: SPA_FALLBACK, tipo: "text/html; charset=utf-8" },
    "/.env.local": { corpo: SPA_FALLBACK, tipo: "text/html; charset=utf-8" },
    "/.env.production": { corpo: SPA_FALLBACK, tipo: "text/html; charset=utf-8" },
    "/.git/config": { corpo: SPA_FALLBACK, tipo: "text/html; charset=utf-8" },
    "/.git/HEAD": { corpo: SPA_FALLBACK, tipo: "text/html; charset=utf-8" },
  });

  const findings = await checkExposure(ctx());
  assert.equal(findings.length, 0, "rewrite de SPA não pode virar achado");
});

test("HTML sem content-type declarado também não gera achado", async () => {
  responder({ "/.env": { corpo: SPA_FALLBACK, tipo: "application/octet-stream" } });

  const findings = await checkExposure(ctx());
  assert.equal(findings.length, 0, "detecção não pode depender só do content-type");
});

test(".env de verdade é achado crítico", async () => {
  responder({ "/.env": { corpo: ENV_REAL } });

  const findings = await checkExposure(ctx());
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, "critica");
  assert.match(findings[0].title, /\.env/);
});

test("o conteúdo do .env NUNCA aparece no achado", async () => {
  responder({ "/.env": { corpo: ENV_REAL } });

  const findings = await checkExposure(ctx());
  const texto = JSON.stringify(findings);

  assert.ok(!texto.includes("SenhaSuperSecreta123"), "vazou senha");
  assert.ok(!texto.includes("sk_live_ZZZZexemploZZZZ"), "vazou chave do Stripe");
  assert.ok(!texto.includes("DATABASE_URL"), "vazou nome de variável");
  assert.ok(!texto.includes("STRIPE_SECRET_KEY"), "vazou nome de variável");
  assert.ok(!texto.includes("postgres://"), "vazou string de conexão");
  assert.ok(!texto.includes("eyJhbGciOiJIUzI1NiJ9"), "vazou JWT");
});

test("arquivo que não tem forma de env não vira achado", async () => {
  // Uma linha com = não basta; texto qualquer não pode disparar.
  responder({ "/.env": { corpo: "bem vindo ao meu site\nobrigado = volte sempre" } });

  const findings = await checkExposure(ctx());
  assert.equal(findings.length, 0);
});

test(".git/config e .git/HEAD viram UM achado, não dois", async () => {
  responder({
    "/.git/config": {
      corpo: "[core]\n\trepositoryformatversion = 0\n\tbare = false\n",
    },
    "/.git/HEAD": { corpo: "ref: refs/heads/main\n" },
  });

  const findings = await checkExposure(ctx());
  assert.equal(findings.length, 1, "os dois são o mesmo problema");
  assert.match(findings[0].title, /\.git/);
  assert.equal(findings[0].severity, "critica");
});

test("source map público é achado alto e não vaza código", async () => {
  const mapa = JSON.stringify({
    version: 3,
    sources: ["src/App.tsx", "src/lib/segredo.ts"],
    sourcesContent: ["const CHAVE_INTERNA = 'nao-pode-vazar-jamais';"],
    mappings: "AAAA",
  });

  responder({ "/app.js.map": { corpo: mapa, tipo: "application/json" } });

  const findings = await checkExposure(
    ctx([{ url: "https://exemplo.com/app.js", content: "//# sourceMappingURL=app.js.map" }]),
  );

  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, "alta");

  const texto = JSON.stringify(findings);
  assert.ok(!texto.includes("nao-pode-vazar-jamais"), "vazou código-fonte");
  assert.ok(!texto.includes("segredo.ts"), "vazou nome de arquivo interno");
  // A contagem pode aparecer: é metadado, não conteúdo.
  assert.match(findings[0].evidence, /2 arquivo/);
});

test("JSON que não é source map não vira achado", async () => {
  responder({ "/app.js.map": { corpo: '{"algo":"outro"}', tipo: "application/json" } });

  const findings = await checkExposure(
    ctx([{ url: "https://exemplo.com/app.js", content: "//# sourceMappingURL=app.js.map" }]),
  );
  assert.equal(findings.length, 0);
});

test("site limpo não gera nenhum achado", async () => {
  responder({});
  const findings = await checkExposure(
    ctx([{ url: "https://exemplo.com/app.js", content: "console.log(1)" }]),
  );
  assert.equal(findings.length, 0);
});
