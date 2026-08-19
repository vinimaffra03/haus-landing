import Achados from "@/components/sections/Achados";
import ComoFunciona from "@/components/sections/ComoFunciona";
import Faq from "@/components/sections/Faq";
import Hero from "@/components/sections/Hero";
import Orcamento from "@/components/sections/Orcamento";
import Precos from "@/components/sections/Precos";
import Problema from "@/components/sections/Problema";
import Servicos from "@/components/sections/Servicos";
import QuemFaz from "@/components/sections/QuemFaz";
import Trabalhos from "@/components/sections/Trabalhos";
import WhatsAppFloat from "@/components/WhatsAppFloat";

/*
  Ordem deliberada: prova antes de preço, preço antes de pedir contato.
  O bloco de achados demonstra competência sem cobrar nada — é o que
  permite publicar preço logo em seguida sem parecer caro.

  Trabalhos fica perto do fim, como pedido. Vale saber do trade-off: portfólio
  ANTES do preço justifica o valor e costuma converter melhor. Depois dele,
  funciona como confirmação para quem já decidiu — não como argumento.

  O fundo alterna preto/papel a cada seção; mexer na ordem exige revisar o
  `invert` das vizinhas para não deixar duas do mesmo tom coladas.
*/

export default function Home() {
  return (
    <main>
      <Hero />
      <Problema />
      <Achados />
      <ComoFunciona />
      <Precos />
      <Servicos />
      <QuemFaz />
      <Trabalhos />
      <Faq />
      <Orcamento />
      <WhatsAppFloat />
    </main>
  );
}
