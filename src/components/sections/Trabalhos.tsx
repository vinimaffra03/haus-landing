import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import { Eyebrow, Section } from "@/components/ui";
import { trabalhos } from "@/content/site";

/*
  Preview estático em vez de vídeo: next/image serve AVIF/WebP responsivo e
  carrega sob demanda. Seis vídeos em autoplay custariam megabytes e o LCP
  no celular — de onde vem a conversão.

  As imagens são geradas por `node scripts/previews.mjs` e ficam versionadas.
  Nenhuma dependência de serviço externo em runtime.
*/

export default function Trabalhos() {
  return (
    <Section id="trabalhos">
      <Eyebrow>o que a gente já construiu</Eyebrow>

      <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed opacity-60">
        Seis projetos no ar. Cada preview é o site rodando de verdade — clique
        para abrir e conferir.
      </p>

      <div className="mt-10 grid gap-x-5 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
        {trabalhos.map((t, i) => (
          <Reveal key={t.slug} delay={i * 70}>
            <article>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="border-line-2 bg-ink-2 relative aspect-16/10 overflow-hidden border">
                  <Image
                    src={`/trabalhos/${t.slug}.webp`}
                    alt={`Página inicial do site ${t.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  {/* Autoria: qual dos dois tocou o projeto. */}
                  <span className="bg-ink text-dim absolute top-0 right-0 z-10 px-2 py-1 font-mono text-[10px] tracking-[0.12em]">
                    {t.author}
                  </span>

                  {/* Aparece no hover — a área toda é clicável. */}
                  <span className="bg-accent text-ink absolute bottom-0 left-0 z-10 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    ver no ar ↗
                  </span>
                </div>

                <div className="mt-3.5 flex items-baseline justify-between gap-4">
                  <h3 className="font-display group-hover:text-accent text-xl tracking-[0.03em] uppercase transition-colors">
                    {t.title}
                  </h3>
                  <span className="text-dim shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase">
                    {t.kind}
                  </span>
                </div>
              </a>

              <p className="mt-2 max-w-[38ch] text-[13px] leading-relaxed opacity-70">
                {t.summary}
              </p>
              <p className="text-dim mt-2 font-mono text-[10.5px]">{t.stack}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
