import Achados from "@/components/sections/Achados";
import ComoFunciona from "@/components/sections/ComoFunciona";
import Faq from "@/components/sections/Faq";
import Hero from "@/components/sections/Hero";
import Orcamento from "@/components/sections/Orcamento";
import Precos from "@/components/sections/Precos";
import Problema from "@/components/sections/Problema";
import QuemFaz from "@/components/sections/QuemFaz";
import WhatsAppFloat from "@/components/WhatsAppFloat";

/*
  Ordem deliberada: prova antes de preço, preço antes de pedir contato.
  O bloco de achados demonstra competência sem cobrar nada — é o que
  permite publicar preço logo em seguida sem parecer caro.
*/

export default function Home() {
  return (
    <main>
      <Hero />
      <Problema />
      <Achados />
      <ComoFunciona />
      <Precos />
      <QuemFaz />
      <Faq />
      <Orcamento />
      <WhatsAppFloat />
    </main>
  );
}
