import assert from "node:assert/strict";
import test from "node:test";

import { checkDeps } from "../src/lib/scan/checks/deps.ts";
import { checkHeaders } from "../src/lib/scan/checks/headers.ts";
import { checkSecrets } from "../src/lib/scan/checks/secrets.ts";
import { extractInlineScripts, extractScriptUrls, normalizeUrl } from "../src/lib/scan/fetch-page.ts";
import type { ScanContext } from "../src/lib/scan/types.ts";

/** Monta um JWT válido com o claim role pedido. */
function jwt(role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: "supabase", ref: "abcdefghijklmnopqrst", role, iat: 1, exp: 9 }),
  ).toString("base64url");
  return `${header}.${payload}.c2lnbmF0dXJlXzEyMzQ1Njc4OTA`;
}

function ctx(partial: Partial<ScanContext> = {}): ScanContext {
  return {
    url: "https://exemplo.com",
    html: "",
    headers: new Headers(),
    bundles: [],
    warnings: [],
    ...partial,
  };
}

/* ------------------------- o detector, item nº2 ------------------------- */

test("service_role no bundle é achado crítico", () => {
  const found = checkSecrets(
    ctx({ bundles: [{ url: "https://x.com/a.js", content: `const k="${jwt("service_role")}"` }] }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "02");
  assert.equal(found[0].severity, "critica");
  assert.match(found[0].title, /service_role/);
});

test("anon key NÃO é achado — ela é pública por design", () => {
  const found = checkSecrets(
    ctx({ bundles: [{ url: "https://x.com/a.js", content: `const k="${jwt("anon")}"` }] }),
  );

  assert.equal(found.length, 0, "reportar a anon key queima credibilidade");
});

test("a evidência trunca o segredo em vez de republicá-lo", () => {
  const token = jwt("service_role");
  const found = checkSecrets(ctx({ bundles: [{ url: "https://x.com/a.js", content: token }] }));

  assert.ok(!found[0].evidence.includes(token), "o token inteiro não pode ir para o relatório");
  assert.match(found[0].evidence, /…/);
});

test("anon key alimenta o contexto do check de Supabase", () => {
  const c = ctx({
    bundles: [
      {
        url: "https://x.com/a.js",
        content: `url:"https://abcdefghijklmnopqrst.supabase.co",key:"${jwt("anon")}"`,
      },
    ],
  });

  checkSecrets(c);

  assert.ok(c.supabase, "precisa descobrir o projeto para o próximo check");
  assert.equal(c.supabase?.projectUrl, "https://abcdefghijklmnopqrst.supabase.co");
});

test("detecta segredos de formato conhecido", () => {
  const found = checkSecrets(
    ctx({
      bundles: [
        {
          url: "https://x.com/a.js",
          content: `sk_live_51ABCdefGHIjklMNOpqrs AKIAIOSFODNN7EXAMPLE`,
        },
      ],
    }),
  );

  assert.equal(found.length, 2);
  assert.ok(found.some((f) => /Stripe/.test(f.title)));
  assert.ok(found.some((f) => /AWS/.test(f.title)));
});

test("bundle limpo não gera achado", () => {
  const found = checkSecrets(
    ctx({ bundles: [{ url: "https://x.com/a.js", content: "function soma(a,b){return a+b}" }] }),
  );
  assert.equal(found.length, 0);
});

test("não duplica o mesmo segredo achado em dois bundles", () => {
  const token = jwt("service_role");
  const found = checkSecrets(
    ctx({
      bundles: [
        { url: "https://x.com/a.js", content: token },
        { url: "https://x.com/b.js", content: token },
      ],
    }),
  );
  assert.equal(found.length, 1);
});

/* ----------------------------- cabeçalhos ------------------------------ */

test("cabeçalhos ausentes viram um achado agregado", () => {
  const found = checkHeaders(ctx({ headers: new Headers() }));

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "06");
  assert.match(found[0].evidence, /content-security-policy/);
});

test("cabeçalhos completos não geram achado", () => {
  const headers = new Headers({
    "content-security-policy": "default-src 'self'",
    "strict-transport-security": "max-age=63072000",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
  });

  assert.equal(checkHeaders(ctx({ headers })).length, 0);
});

/* ---------------------------- dependências ----------------------------- */

test("lib abaixo da versão corrigida é achado", () => {
  const found = checkDeps(
    ctx({ bundles: [{ url: "https://x.com/a.js", content: "/*! jQuery v3.4.1 */" }] }),
  );

  assert.equal(found.length, 1);
  assert.equal(found[0].rule, "07");
  assert.match(found[0].evidence, /CVE-2020-11022/);
});

test("lib já corrigida não é achado", () => {
  const found = checkDeps(
    ctx({ bundles: [{ url: "https://x.com/a.js", content: "/*! jQuery v3.7.1 */" }] }),
  );
  assert.equal(found.length, 0);
});

/* ------------------------------- coleta -------------------------------- */

test("normalizeUrl completa o protocolo", () => {
  assert.equal(normalizeUrl("exemplo.com"), "https://exemplo.com/");
  assert.equal(normalizeUrl("  https://a.com/b  "), "https://a.com/b");
});

test("normalizeUrl rejeita entrada inválida", () => {
  assert.throws(() => normalizeUrl("não é url"));
});

test("extrai src de script, resolvendo caminho relativo", () => {
  const html = `<script src="/_next/static/a.js"></script><script src="https://cdn.com/b.js"></script>`;
  const urls = extractScriptUrls(html, "https://exemplo.com/pagina");

  assert.ok(urls.includes("https://exemplo.com/_next/static/a.js"));
  assert.ok(urls.includes("https://cdn.com/b.js"));
});

test("extrai script inline e ignora os que têm src", () => {
  const html = `<script src="/a.js"></script><script>const K="segredo"</script>`;
  assert.match(extractInlineScripts(html), /segredo/);
});
