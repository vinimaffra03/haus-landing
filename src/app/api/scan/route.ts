import { NextResponse } from "next/server";
import { scan } from "@/lib/scan/index.ts";

/*
  Scan grátis, público. É a isca do funil — sem cadastro, sem cartão.

  Limitações deliberadas de escopo, porque é rota aberta:
  - Só análise passiva. Nenhuma requisição mais intrusiva que abrir o site.
  - Nenhuma ferramenta de licença restritiva (ver src/lib/scan/index.ts).
  - Rate limit em memória por IP. Não é à prova de bala num deploy com
    várias instâncias, mas segura abuso casual e custa zero.
*/

export const runtime = "nodejs";
export const maxDuration = 60;

const JANELA_MS = 60_000;
const MAX_POR_JANELA = 5;
const acessos = new Map<string, number[]>();

function limitado(ip: string): boolean {
  const agora = Date.now();
  const recentes = (acessos.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);

  if (recentes.length >= MAX_POR_JANELA) return true;

  recentes.push(agora);
  acessos.set(ip, recentes);

  // Limpeza preguiçosa para o Map não crescer sem limite.
  if (acessos.size > 5_000) {
    for (const [k, v] of acessos) {
      if (v.every((t) => agora - t > JANELA_MS)) acessos.delete(k);
    }
  }

  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";

  if (limitado(ip)) {
    return NextResponse.json(
      { ok: false, error: "Muitos scans seguidos. Espere um minuto." },
      { status: 429 },
    );
  }

  let url: string;
  try {
    const body = (await request.json()) as { url?: string };
    url = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "Cole o endereço do seu site." },
      { status: 400 },
    );
  }

  try {
    const result = await scan(url);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const msg = (err as Error).message ?? "";

    // Mensagem útil em vez de stack trace: o visitante é leigo.
    const amigavel = /Invalid URL/i.test(msg)
      ? "Esse endereço não parece válido. Tente algo como meusite.com.br"
      : /timeout|abort/i.test(msg)
        ? "O site demorou demais para responder. Ele está no ar?"
        : "Não conseguimos acessar esse endereço. Confira se está correto e no ar.";

    return NextResponse.json({ ok: false, error: amigavel }, { status: 422 });
  }
}
