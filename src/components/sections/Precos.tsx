import Reveal from "@/components/fx/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { garantia, precosNota, prices } from "@/content/site";

export default function Precos() {
  return (
    <Section id="precos">
      <div className="grid-bg opacity-50" aria-hidden="true" />

      <Eyebrow>preço · sem orçamento surpresa</Eyebrow>

      <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed opacity-60">
        Escopo e valor fechados antes de começar. Se algo sair do combinado, a
        gente orça à parte — e você aprova antes.
      </p>

      <ul className="mt-10 font-mono text-[13.5px]">
        {prices.map((p, i) => (
          <Reveal key={p.service} delay={i * 40}>
            <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3.5 last:border-b-0">
              <span className="opacity-85">
                {p.service}
                <span className="ml-2 text-[11px] opacity-40">· {p.term}</span>
              </span>
              <span
                className={`shrink-0 text-lg ${"lead" in p && p.lead ? "text-accent" : ""}`}
              >
                {"from" in p && p.from ? (
                  <span className="mr-1 text-[10px] tracking-wider opacity-50 uppercase">
                    a partir de
                  </span>
                ) : null}
                {p.price}
                {"suffix" in p && p.suffix ? (
                  <span className="text-[11px] opacity-50">{p.suffix}</span>
                ) : null}
              </span>
            </li>
          </Reveal>
        ))}
      </ul>

      <div className="border-line mt-8 border-t pt-6">
        <p className="max-w-[58ch] text-[13.5px] leading-relaxed opacity-55">
          {precosNota}
        </p>
        <p className="text-accent mt-4 max-w-[58ch] font-mono text-[12.5px] leading-relaxed">
          {garantia.titulo}.
        </p>
      </div>
    </Section>
  );
}
