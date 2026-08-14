import { Eyebrow, Section } from "@/components/ui";
import { faq } from "@/content/site";

export default function Faq() {
  return (
    <Section invert>
      <Eyebrow className="opacity-45">perguntas</Eyebrow>

      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        {faq.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-display text-lg tracking-[0.02em] uppercase [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="shrink-0 font-mono text-accent transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed opacity-70">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
