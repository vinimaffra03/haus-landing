"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import type { ScanResult } from "@/lib/scan/types.ts";
import { garantia, origemDaCampanha, scanChecks, whatsappScanHref } from "@/content/site";

type Estado = "parado" | "rodando" | "pronto" | "erro";

const ROTULO = { critica: "CRÍTICO", alta: "ATENÇÃO", media: "AJUSTE" } as const;
const COR = {
  critica: "text-accent",
  alta: "text-dim",
  media: "text-line-2",
} as const;

/** Segundos por check no indicador de progresso. */
const RITMO = 3;

export default function ScanForm() {
  const [estado, setEstado] = useState<Estado>("parado");
  const [resultado, setResultado] = useState<ScanResult | null>(null);
  const [erro, setErro] = useState("");
  const [segundos, setSegundos] = useState(0);
  /*
    Origem da campanha (UTM). Lida no submit, não em efeito nem na renderização.

    Na renderização daria divergência de hidratação — a /scan é estática e o
    servidor não tem query string. Em efeito, o lint do React Compiler barra o
    setState. E não precisa ser antes: o botão de WhatsApp só existe depois do
    resultado, então ler no submit sempre chega a tempo.
  */
  const [origem, setOrigem] = useState("");

  /*
    O H1 promete 30s e a rota tem maxDuration de 60. Sem isto, o visitante
    encara um botão desabilitado por até um minuto sem sinal de vida — e a
    aba fecha antes do resultado, que é o único momento em que a página vende.
  */
  useEffect(() => {
    if (estado !== "rodando") return;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [estado]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = new FormData(e.currentTarget).get("url")?.toString().trim() ?? "";
    if (!url) return;

    const org = origemDaCampanha(window.location.search);

    setSegundos(0);
    setEstado("rodando");
    setErro("");
    setOrigem(org);
    // Usa `org`, não `origem`: o estado só vale a partir da próxima renderização.
    track("scan_iniciado", org ? { origem: org } : undefined);

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

  /*
    Derivado, não estado — o passo é função do tempo decorrido.

    O marcador só destaca o que está sendo olhado AGORA; nada recebe "concluído".
    O ritmo é estimado, não medido, e afirmar conclusão que não foi verificada
    seria mentira barata numa página que vende honestidade técnica.
  */
  const passoAtivo = Math.min(Math.floor(segundos / RITMO), scanChecks.length - 1);

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
          {estado === "rodando" ? `Verificando… ${segundos}s` : "Verificar grátis"}
        </button>
      </form>

      {estado === "rodando" && (
        <ul
          aria-live="polite"
          aria-label="Progresso da verificação"
          className="border-line-2 mt-6 border font-mono text-[12.5px]"
        >
          {scanChecks.map((c, i) => {
            const ativo = i === passoAtivo;
            return (
              <li
                key={c}
                className={`border-line flex items-baseline gap-3 px-4 py-2.5 ${
                  i > 0 ? "border-t" : ""
                } ${ativo ? "text-accent" : i < passoAtivo ? "opacity-55" : "opacity-25"}`}
              >
                <span aria-hidden="true">{ativo ? "›" : "·"}</span>
                <span>{c}</span>
              </li>
            );
          })}
        </ul>
      )}

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
              O botão abaixo já abre o WhatsApp com esse resultado escrito — você não
              precisa explicar nada. A gente responde no mesmo dia dizendo o que
              corrigir primeiro e quanto custa.
            </p>

            {/*
              O resultado vai DENTRO da mensagem. Antes disto o botão mandava o
              texto genérico e o achado morria na aba fechada.
              🚨 Só `title` e `severity` — nunca `evidence`. Ver whatsappScanHref.
            */}
            <a
              href={whatsappScanHref(resultado.url, resultado.findings, origem)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("whatsapp_pos_scan", {
                  achados: resultado.findings.length,
                  ...(origem ? { origem } : {}),
                })
              }
              className="bg-ink text-accent font-display mt-5 inline-block px-7 py-3.5 text-[15px] tracking-[0.14em] uppercase"
            >
              Falar no WhatsApp
            </a>

            <p className="mt-5 border-t border-black/20 pt-4 text-[12px] leading-relaxed opacity-70">
              <strong>{garantia.titulo}.</strong> {garantia.corpo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
