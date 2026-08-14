import Reveal from "@/components/fx/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { findings } from "@/content/site";

/*
  A assinatura da marca. É o único bloco que prova competência antes de
  pedir qualquer contato — por isso vem antes do preço.
*/

const TONE: Record<string, string> = {
  CRÍTICO: "text-accent",
  ALTO: "text-dim",
  MÉDIO: "text-line-2",
};

export default function Achados() {
  return (
    <Section>
      <div className="grid-bg" aria-hidden="true" />

      <Eyebrow>o que a gente procura</Eyebrow>

      <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed opacity-60">
        Nove verificações, ordenadas pela frequência com que aparecem em apps
        gerados por IA. Você recebe cada uma com a localização exata e a correção.
      </p>

      <ul className="mt-10 font-mono text-[13px]">
        {findings.map((f, i) => (
          <Reveal key={f.id} delay={i * 45}>
            <li className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <span className="opacity-85">
                <span className="opacity-40">[{f.id}]</span> {f.text}
              </span>
              <span className={`shrink-0 text-[11px] tracking-[0.1em] ${TONE[f.severity]}`}>
                {f.severity}
              </span>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
