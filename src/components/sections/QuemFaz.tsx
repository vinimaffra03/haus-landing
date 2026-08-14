import { Eyebrow, Section } from "@/components/ui";
import { people } from "@/content/site";

export default function QuemFaz() {
  return (
    <Section invert>
      <Eyebrow className="opacity-45">quem faz</Eyebrow>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        {people.map((p) => (
          <div key={p.name}>
            {/* Substituir por foto real assim que tiverem — rosto converte mais que inicial. */}
            <div
              className={`flex size-14 items-center justify-center font-mono text-[15px] ${
                p.accent ? "bg-accent text-ink" : "bg-slate text-paper"
              }`}
            >
              {p.initials}
            </div>
            <h3 className="mt-4 font-display text-xl tracking-[0.04em] uppercase">
              {p.name}
            </h3>
            <p className="mt-1.5 font-mono text-[11px] leading-relaxed opacity-50">
              {p.role}
              <br />
              {p.stack}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-[50ch] font-mono text-xs leading-relaxed opacity-50">
        SOMOS DOIS. VOCÊ FALA DIRETO COM QUEM ESCREVE O CÓDIGO — NÃO COM
        ATENDIMENTO.
      </p>
    </Section>
  );
}
