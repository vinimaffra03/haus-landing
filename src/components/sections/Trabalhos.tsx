import Masonry, { type MasonryItem } from "@/components/reactbits/Masonry";
import { Eyebrow, Section } from "@/components/ui";
import { trabalhos } from "@/content/site";

/*
  Trabalhos em masonry.

  As previews têm altura variável de propósito — 633px a 1400px, derivada de
  15% do comprimento real de cada site. Com proporção idêntica o masonry seria
  só um grid com JS a mais.

  O componente cai para grid CSS quando o GSAP não roda ou quando o visitante
  pediu movimento reduzido, então o conteúdo nunca depende da animação.
*/

const itens: MasonryItem[] = trabalhos.map((t) => ({
  id: t.slug,
  img: `/trabalhos/${t.slug}.webp`,
  url: t.url,
  height: t.height,
  title: t.title,
  kind: t.kind,
  author: t.author,
}));

export default function Trabalhos() {
  return (
    <Section id="trabalhos">
      <Eyebrow>o que a gente já construiu</Eyebrow>

      <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed opacity-60">
        Seis projetos nossos, no ar agora. São trabalhos que a gente construiu —
        não são clientes, e a gente prefere dizer isso a deixar você supor.
        Cada preview é o site rodando de verdade: clique e confira.
      </p>

      <div className="mt-10">
        <Masonry items={itens} />
      </div>
    </Section>
  );
}
