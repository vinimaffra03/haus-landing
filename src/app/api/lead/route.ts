import { NextResponse } from "next/server";

/*
  Recebe o formulário de orçamento.

  Grava no Supabase quando configurado. Se NÃO estiver configurado:
    - em desenvolvimento, registra no console e responde ok (dá pra testar)
    - em produção, responde 503 de propósito

  O 503 é deliberado: responder "recebemos" sem ter salvo nada faria vocês
  perderem lead sem nunca descobrir. Melhor a pessoa ser mandada ao WhatsApp.
*/

export const runtime = "nodejs";

type Lead = {
  nome?: string;
  contato?: string;
  link?: string;
  descricao?: string;
  website?: string; // honeypot
};

const MAX = 4000;

function clean(v: unknown, limit = 500) {
  return typeof v === "string" ? v.trim().slice(0, limit) : "";
}

export async function POST(request: Request) {
  let body: Lead;

  try {
    body = (await request.json()) as Lead;
  } catch {
    return NextResponse.json({ ok: false, error: "Payload inválido." }, { status: 400 });
  }

  // Bot preencheu o campo escondido — responde ok sem gravar nada.
  if (clean(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const lead = {
    nome: clean(body.nome, 160),
    contato: clean(body.contato, 200),
    link: clean(body.link, 500),
    descricao: clean(body.descricao, MAX),
  };

  if (!lead.nome || !lead.contato || !lead.descricao) {
    return NextResponse.json(
      { ok: false, error: "Preencha nome, contato e o que está acontecendo." },
      { status: 400 },
    );
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[lead] Supabase não configurado — lead não foi gravado:", lead);
      return NextResponse.json({ ok: true, stored: false });
    }

    console.error("[lead] SUPABASE_URL/SUPABASE_SERVICE_KEY ausentes em produção.");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Nosso formulário está fora do ar no momento. Chame no WhatsApp que a gente responde na hora.",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ ...lead, source: "landing" }),
    });

    if (!res.ok) {
      console.error("[lead] Supabase respondeu", res.status, await res.text());
      return NextResponse.json(
        {
          ok: false,
          error:
            "Não conseguimos registrar agora. Chame no WhatsApp que a gente responde na hora.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[lead] falha ao gravar:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Não conseguimos registrar agora. Chame no WhatsApp que a gente responde na hora.",
      },
      { status: 502 },
    );
  }
}
