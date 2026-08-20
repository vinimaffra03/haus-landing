import assert from "node:assert/strict";
import test from "node:test";

import { origemDaCampanha, whatsappScanHref } from "../src/content/site.ts";
import type { Finding } from "../src/lib/scan/types.ts";

/*
  A mensagem pós-scan carrega o resultado para dentro do WhatsApp. Isso resolve
  o vazamento do funil, mas cria uma superfície nova: uma query string.

  Query string vai parar em log de servidor, histórico de navegador e prévia de
  link. É o pior lugar possível para qualquer coisa parecida com credencial —
  e `evidence` carrega justamente chave truncada e nome de tabela.

  O teste que mais importa é o primeiro. Ele é o par do último teste de
  scan-supabase.test.ts: lá se garante que nenhuma linha de banco entra no
  relatório, aqui se garante que nada do relatório sai pela URL além do rótulo
  de regra que nós mesmos escrevemos.
*/

function finding(over: Partial<Finding> = {}): Finding {
  return {
    rule: "02",
    severity: "critica",
    title: "Chave de acesso exposta no código do navegador",
    evidence: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…SEGREDO",
    where: "https://exemplo.com/_next/static/chunks/main.js",
    fix: "Mova a chave para o servidor.",
    ...over,
  } as Finding;
}

test("evidence NUNCA entra na mensagem do WhatsApp", () => {
  const href = whatsappScanHref("https://exemplo.com", [
    finding(),
    finding({ rule: "01", evidence: "tabela `usuarios` legível — 4.812 registros" }),
  ]);

  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  assert.ok(!texto.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"), "vazou chave");
  assert.ok(!texto.includes("SEGREDO"), "vazou trecho de segredo");
  assert.ok(!texto.includes("4.812"), "vazou contagem de registros");
  assert.ok(!texto.includes("usuarios"), "vazou nome de tabela");
  assert.ok(!texto.includes("_next/static"), "vazou caminho de bundle");
});

test("a mensagem leva a URL e os títulos dos achados", () => {
  const href = whatsappScanHref("https://meuapp.com.br", [finding()]);
  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  assert.ok(texto.includes("https://meuapp.com.br"));
  assert.ok(texto.includes("Chave de acesso exposta no código do navegador"));
  assert.ok(texto.includes("1 ponto(s)"));
  assert.ok(texto.includes("1 crítico(s)"));
});

test("conta só os críticos como críticos", () => {
  const href = whatsappScanHref("https://x.com", [
    finding({ severity: "critica" }),
    finding({ severity: "media", title: "Proteções de navegador ausentes" }),
  ]);
  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  assert.ok(texto.includes("2 ponto(s)"));
  assert.ok(texto.includes("1 crítico(s)"));
});

test("trunca lista longa em vez de estourar a URL", () => {
  const muitos = Array.from({ length: 9 }, (_, i) =>
    finding({ title: `Achado numero ${i}`, severity: "media" }),
  );
  const href = whatsappScanHref("https://x.com", muitos);
  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  assert.ok(texto.includes("9 ponto(s)"));
  assert.ok(texto.includes("e mais 3"), "deveria resumir o excedente");
  assert.ok(!texto.includes("Achado numero 8"), "não deveria listar além do teto");
  assert.ok(href.length < 2000, `URL longa demais: ${href.length}`);
});

test("scan sem achado ainda gera mensagem útil", () => {
  const href = whatsappScanHref("https://limpo.com", []);
  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  assert.ok(texto.includes("https://limpo.com"));
  assert.ok(texto.includes("não apareceu nada por fora"));
  // Mesmo sem achado a conversa precisa ter um próximo passo, ou a CTA morre.
  assert.ok(texto.includes("acesso ao código"));
});

/* ------------------------- origem da campanha -------------------------- */

/*
  A UTM vem da barra de endereço, ou seja, de quem montou o link — não da haus.
  Sem sanitização, qualquer pessoa distribui um link para a /scan com texto
  arbitrário embutido, e esse texto aparece dentro de uma mensagem de WhatsApp
  que o visitante lê como se a haus. tivesse escrito.
*/

test("monta a etiqueta a partir de source e content", () => {
  assert.equal(origemDaCampanha("?utm_source=tiktok&utm_content=video-03"), "tiktok/video-03");
  assert.equal(origemDaCampanha("?utm_source=instagram"), "instagram");
  assert.equal(origemDaCampanha(""), "");
  assert.equal(origemDaCampanha("?outra=coisa"), "");
});

test("remove qualquer caractere fora do alfabeto permitido", () => {
  const sujo = "?utm_source=" + encodeURIComponent("tik tok!@#$%^&*()[]{}<>/\\\"'`\n");
  const limpo = origemDaCampanha(sujo);

  assert.equal(limpo, "tiktok");
  assert.ok(!/[^a-zA-Z0-9._/-]/.test(limpo), "sobrou caractere não permitido");
});

test("limita o tamanho para não inflar a mensagem", () => {
  const gigante = "?utm_content=" + "a".repeat(500);
  assert.equal(origemDaCampanha(gigante).length, 24);
});

test("texto injetado pela UTM não escapa da etiqueta na mensagem", () => {
  const origem = origemDaCampanha(
    "?utm_source=" + encodeURIComponent("URGENTE: mande sua senha para o pix 123"),
  );
  const href = whatsappScanHref("https://x.com", [], origem);
  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  /*
    A defesa não é remover as letras — é impedir que elas formem uma frase.
    Sem espaço e com 24 caracteres, o que sobra é um token corrido dentro de
    colchetes, que lê como etiqueta técnica e não como instrução da haus.
  */
  assert.ok(!texto.includes("mande sua senha"), "frase legível sobreviveu");
  assert.ok(!texto.includes("URGENTE:"), "pontuação sobreviveu");

  const etiqueta = /\[([^\]]*)\]/.exec(texto)?.[1] ?? "";
  assert.equal(etiqueta, "URGENTEmandesuasenhapara");
  assert.ok(!/\s/.test(etiqueta), "espaço permitiria montar frase dentro da etiqueta");
  assert.ok(etiqueta.length <= 24);
});

test("sem críticos, a mensagem não inventa crítico", () => {
  const href = whatsappScanHref("https://x.com", [finding({ severity: "media" })]);
  const texto = decodeURIComponent(new URL(href).searchParams.get("text") ?? "");

  assert.ok(!texto.includes("crítico"));
});
