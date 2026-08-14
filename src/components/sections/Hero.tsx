import LetterGlitch from "@/components/fx/LetterGlitch";
import ScrambleText from "@/components/fx/ScrambleText";
import { ButtonPrimary } from "@/components/ui";
import { hero, site, whatsappHref } from "@/content/site";

export default function Hero() {
  return (
    <header className="relative flex min-h-[92svh] flex-col overflow-hidden bg-ink px-6 py-8 sm:px-8">
      <LetterGlitch />
      <div className="grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-(--container-haus) flex-1 flex-col">
        <nav className="flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.08em] uppercase">
            {site.brand}
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
            {site.tagline}
          </span>
        </nav>

        <div className="mt-auto pt-20">
          <h1 className="font-display text-[clamp(2.9rem,11vw,7.2rem)] leading-[0.84] uppercase">
            <ScrambleText as="div" text={hero.line1} duration={700} />
            <ScrambleText
              as="div"
              text={hero.line2}
              duration={900}
              delay={220}
              className="text-accent"
            />
          </h1>

          <p className="mt-5 font-mono text-[11px] tracking-[0.14em] opacity-50">
            {hero.meta}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonPrimary href="#orcamento">Pedir orçamento</ButtonPrimary>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.1em] uppercase opacity-50 transition-opacity hover:opacity-100"
            >
              ou chame no WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
