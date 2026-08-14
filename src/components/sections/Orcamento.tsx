"use client";

import { useState } from "react";
import { ButtonPrimary, Display, Eyebrow } from "@/components/ui";
import { site, whatsappHref } from "@/content/site";

type State = "idle" | "sending" | "ok" | "error";

export default function Orcamento() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setState("error");
        setMessage(
          data.error ??
            "Não conseguimos registrar seu pedido. Chame no WhatsApp que a gente responde na hora.",
        );
        return;
      }

      setState("ok");
    } catch {
      setState("error");
      setMessage(
        "Falha de conexão. Chame no WhatsApp que a gente responde na hora.",
      );
    }
  }

  if (state === "ok") {
    return (
      <section
        id="orcamento"
        className="relative overflow-hidden bg-accent px-6 py-24 text-ink sm:px-8"
      >
        <div className="mx-auto max-w-(--container-haus)">
          <Display className="max-w-[18ch] text-[clamp(2rem,6vw,3.4rem)]">
            Recebemos.
          </Display>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed">
            A gente responde em até 24h úteis com o próximo passo. Se for
            urgente, chame no WhatsApp — normalmente respondemos em minutos.
          </p>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-block border border-ink px-6 py-3 font-mono text-xs tracking-[0.1em] uppercase transition-colors hover:bg-ink hover:text-accent"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </section>
    );
  }

  return (
    <section
      id="orcamento"
      className="relative overflow-hidden bg-accent px-6 py-24 text-ink sm:px-8"
    >
      <div className="mx-auto max-w-(--container-haus)">
        <Eyebrow className="text-ink opacity-60">orçamento</Eyebrow>

        <Display className="mt-4 max-w-[16ch] text-[clamp(2.2rem,7vw,4rem)]">
          Manda o link do seu app.
        </Display>

        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed opacity-80">
          Resposta em até 24h úteis com escopo e preço. Não precisa saber
          explicar o que está errado.
        </p>

        <form onSubmit={onSubmit} className="mt-10 grid max-w-2xl gap-5">
          {/* Armadilha para bot — humano nunca preenche. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] size-0"
          />

          <Field label="Seu nome" name="nome" required />
          <Field label="E-mail ou WhatsApp" name="contato" required />
          <Field
            label="Link do app ou repositório"
            name="link"
            placeholder="https://"
          />

          <label className="grid gap-2">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase opacity-60">
              O que está acontecendo
            </span>
            <textarea
              name="descricao"
              rows={4}
              required
              className="resize-y border border-ink/25 bg-transparent px-4 py-3 font-mono text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
              placeholder="Ex: o login parou de funcionar depois do deploy"
            />
          </label>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <ButtonPrimary
              type="submit"
              disabled={state === "sending"}
              className="!bg-ink !text-accent"
            >
              {state === "sending" ? "Enviando…" : "Pedir orçamento"}
            </ButtonPrimary>

            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.1em] uppercase opacity-60 transition-opacity hover:opacity-100"
            >
              ou chame no WhatsApp →
            </a>
          </div>

          {state === "error" && (
            <p
              role="alert"
              className="border border-ink/30 bg-ink/5 px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {message}
            </p>
          )}
        </form>

        <p className="mt-14 font-mono text-[10px] tracking-[0.18em] uppercase opacity-55">
          {site.brand} · {site.tagline} · {site.city}
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[10px] tracking-[0.16em] uppercase opacity-60">
        {label}
      </span>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        className="border border-ink/25 bg-transparent px-4 py-3 font-mono text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
      />
    </label>
  );
}
