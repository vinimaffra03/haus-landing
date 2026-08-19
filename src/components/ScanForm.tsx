"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import type { ScanResult } from "@/lib/scan/types.ts";
import { whatsappHref } from "@/content/site";

type Estado = "parado" | "rodando" | "pronto" | "erro";

const ROTULO = { critica: "CRÍTICO", alta: "ATENÇÃO", media: "AJUSTE" } as const;
const COR = {
  critica: "text-accent",
  alta: "text-dim",
  media: "text-line-2",
} as const;

export default function ScanForm() {
  const [estado, setEstado] = useState<Estado>("parado");
  const [resultado, setResultado] = useState<ScanResult | null>(null);
  const [erro, setErro] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = new FormData(e.currentTarget).get("url")?.toString().trim() ?? "";
    if (!url) return;

    setEstado("rodando");
    setErro("");
    track("scan_iniciado");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { ok: boolean; result?: ScanResult; error?: string };

      if (!data.ok || !data.result) {
        setErro(data.error ?? "Não conseguimos verificar esse endereço.");
        setEstado("erro");
        return;
      }

      setResultado(data.result);
      setEstado("pronto");
      track("scan_concluido", { achados: data.result.findings.length });
    } catch {
      setErro("Falha de conexão. Tente de novo.");
      setEstado("erro");
    }
  }

  const criticos = resultado?.findings.filter((f) => f.severity === "critica").length ?? 0;

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          placeholder="meusite.com.br"
          aria-label="Endereço do seu site"
          className="border-line-2 text-paper placeholder:text-dim focus:border-accent flex-1 border bg-transparent px-4 py-4 font-mono text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={estado === "rodando"}
          className="bg-accent text-ink font-display px-8 py-4 text-[15px] tracking-[0.14em] uppercase transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {estado === "rodando" ? "Verificando…" : "Verificar grátis"}
        </button>
      </form>

      {estado === "erro" && (
        <p role="alert" className="border-line-2 mt-4 border px-4 py-3 font-mono text-xs">
          {erro}
        </p>
      )}

      {estado === "pronto" && resultado && (
        <div className="border-line-2 mt-8 border">
          <div className="border-line-2 flex flex-wrap items-baseline justify-between gap-3 border-b px-5 py-4">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-60">
              {resultado.url}
            </span>
            <span className="font-mono text-[11px] opacity-40">
              {(resultado.durationMs / 1000).toFixed(1)}s
            </span>
          </div>

          {resultado.findings.length === 0 ? (
            <div className="px-5 py-6">
              <p className="font-display text-2xl uppercase">Nada exposto por fora</p>
              <p className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed opacity-65">
                A verificação externa não achou problema. Mas ela enxerga só o lado
                de fora: <strong className="text-paper">5 dos 9 pontos</strong> que
                verificamos só aparecem com acesso ao código.
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 py-5">
                <p className="font-display text-2xl uppercase">
                  {resultado.findings.length} ponto(s) de atenção
                  {criticos > 0 && <span className="text-accent"> · {criticos} crítico(s)</span>}
                </p>
              </div>

              <ul className="font-mono text-[12.5px]">
                {resultado.findings.map((f, i) => (
                  <li key={i} className="border-line border-t px-5 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="opacity-85">{f.title}</span>
                      <span className={`shrink-0 text-[10px] tracking-[0.12em] ${COR[f.severity]}`}>
                        {ROTULO[f.severity]}
                      </span>
                    </div>
                    <p className="mt-2 text-[11.5px] leading-relaxed opacity-50">{f.evidence}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* A CTA aparece depois do resultado — o visitante já viu o valor. */}
          <div className="bg-accent text-ink px-5 py-6">
            <p className="font-display text-xl uppercase">Quer que a gente resolva?</p>
            <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed opacity-80">
              Manda o resultado no WhatsApp que a gente te diz o que corrigir
              primeiro e quanto custa. Resposta no mesmo dia.
            </p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_pos_scan")}
              className="bg-ink text-accent font-display mt-5 inline-block px-7 py-3.5 text-[15px] tracking-[0.14em] uppercase"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
