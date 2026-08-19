import { Display, Eyebrow } from "@/components/ui";
import { site, whatsappHref } from "@/content/site";

/*
  Fechamento da home.

  O formulário foi removido: sem Supabase configurado a rota /api/lead
  responde 503 em produção, e mandar tráfego para um formulário que perde
  o lead é pior que não ter formulário. O WhatsApp funciona hoje.

  A rota /api/lead continua no repo, testada — quando o Supabase estiver
  configurado, é só devolver o formulário aqui.
*/

export default function Orcamento() {
  return (
    <section
      id="orcamento"
      className="bg-accent text-ink relative overflow-hidden px-6 py-24 sm:px-8"
    >
      <div className="mx-auto max-w-(--container-haus)">
        <Eyebrow className="text-ink opacity-60">falar com a gente</Eyebrow>

        <Display className="mt-4 max-w-[16ch] text-[clamp(2.2rem,7vw,4rem)]">
          Manda o link do seu app.
        </Display>

        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed opacity-80">
          Resposta no mesmo dia, com escopo e preço fechados. Não precisa saber
          explicar o que está errado — esse é o nosso trabalho.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ink text-accent font-display inline-block px-7 py-3.5 text-[15px] tracking-[0.14em] uppercase transition-opacity hover:opacity-85"
          >
            Falar no WhatsApp
          </a>
          <a
            href="/scan"
            className="border-ink inline-block border px-6 py-3 font-mono text-xs tracking-[0.1em] uppercase transition-colors hover:bg-ink hover:text-accent"
          >
            ou verificar grátis primeiro
          </a>
        </div>

        <p className="mt-14 font-mono text-[10px] tracking-[0.18em] uppercase opacity-55">
          {site.brand} · {site.tagline} · {site.city} · {site.email}
        </p>
      </div>
    </section>
  );
}
