import FlowingMenu, { type FlowingItem } from "@/components/reactbits/FlowingMenu";
import { Eyebrow, Section } from "@/components/ui";

/*
  Faixa de serviços. Usa o FlowingMenu: cada serviço é uma linha, e o hover
  revela um marquee com a preview de um projeto daquele tipo.

  As imagens reaproveitam as previews que já existem — nenhum asset novo.

  ⚠️ `note` tem que bater com `prices` em site.ts, incluindo o "a partir de".
  Até 20/08/2026 esta faixa dizia "a partir de R$350" enquanto a tabela dizia
  R$350 fixo — dois preços para o mesmo item na mesma página é o tipo de
  detalhe que faz o visitante desconfiar do resto.
*/

const SERVICOS: FlowingItem[] = [
  {
    text: "Consertar",
    note: "R$350",
    link: "#precos",
    image: "/trabalhos/rickfretes.webp",
  },
  {
    text: "Colocar no ar",
    note: "a partir de R$1.200",
    link: "#precos",
    image: "/trabalhos/alphaplanner.webp",
  },
  {
    text: "Landing page",
    note: "R$650",
    link: "#precos",
    image: "/trabalhos/houdimedia.webp",
  },
  {
    text: "Sistema sob medida",
    note: "a partir de R$3.500",
    link: "#precos",
    image: "/trabalhos/worknow.webp",
  },
];

export default function Servicos() {
  return (
    <Section id="servicos" className="!px-0 !py-0">
      <div className="px-6 pt-20 pb-10 sm:px-8">
        <Eyebrow>o que a gente faz</Eyebrow>
      </div>
      <FlowingMenu items={SERVICOS} />
    </Section>
  );
}
