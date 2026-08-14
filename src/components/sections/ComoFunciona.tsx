import Reveal from "@/components/fx/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { steps } from "@/content/site";

export default function ComoFunciona() {
  return (
    <Section invert>
      <Eyebrow className="opacity-45">como funciona</Eyebrow>

      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 90}>
            <div className="font-mono text-xs text-accent">{s.n}</div>
            <h3 className="mt-3 font-display text-2xl tracking-[0.03em] uppercase">
              {s.title}
            </h3>
            <p className="mt-2.5 max-w-[34ch] text-[13.5px] leading-relaxed opacity-65">
              {s.body}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
