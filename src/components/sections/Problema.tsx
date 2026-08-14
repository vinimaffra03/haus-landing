import CountUp from "@/components/fx/CountUp";
import Reveal from "@/components/fx/Reveal";
import { Display, Eyebrow, Section } from "@/components/ui";
import { stats, statsSource } from "@/content/site";

export default function Problema() {
  return (
    <Section invert>
      <Eyebrow className="opacity-45">o problema</Eyebrow>

      <Display className="mt-4 max-w-[16ch] text-[clamp(2rem,6vw,3.4rem)]">
        A IA constrói rápido.
        <br />E deixa buraco.
      </Display>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.value} delay={i * 90}>
            <div className="font-mono text-[2.75rem] leading-none tracking-[-0.04em] text-accent">
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
            <p className="mt-2.5 max-w-[26ch] text-[13px] leading-relaxed opacity-60">
              {s.label}
            </p>
          </Reveal>
        ))}
      </div>

      <a
        href={statsSource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-9 inline-block font-mono text-[10px] tracking-[0.14em] uppercase opacity-40 transition-opacity hover:opacity-70"
      >
        {statsSource.label}
      </a>
    </Section>
  );
}
