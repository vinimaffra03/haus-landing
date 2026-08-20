import type { Metadata } from "next";
import Avatar from "@/components/Avatar";
import ScanForm from "@/components/ScanForm";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { people, scanChecks, site } from "@/content/site";

/*
  Landing dedicada ao tráfego pago.

  Diferenças propositais em relação à home:
  - Uma oferta só (o scan), não sete preços. Escolha reduz conversão.
  - Sem menu e sem links de saída além da CTA. A única exceção é a política de
    privacidade no rodapé, que o Google Ads exige alcançável no destino.
  - Sem nenhum "R$" na página, por decisão dos sócios em 20/08/2026.
  - H1 espelha o texto do anúncio — correspondência anúncio↔página é o
    principal preditor de conversão em mídia paga, e o Google usa a
    experiência da landing no Índice de Qualidade (CPC mais barato).

  ⚠️ Vocabulário: a política do Google Ads sobre "possibilitar comportamento
  desonesto" proíbe serviço que dê acesso não autorizado a sistemas. Evitar
  aqui e no anúncio: hacker, invadir, vulnerabilidade, exploit, brecha,
  senha exposta. Usar: revisão técnica, verificação, correção.

  A garantia mora no bloco de CTA (ScanForm), não aqui: ela cobre o diagnóstico
  PAGO, que só é oferecido depois do resultado. Antes disso a oferta é grátis e
  não há risco a reverter.
*/

export const metadata: Metadata = {
  title: "Verifique seu app de graça — haus.",
  description:
    "Cole o endereço do seu site e veja em 30 segundos o que está exposto. Sem cadastro, sem cartão.",
  robots: { index: false, follow: false }, // página de anúncio não compete com a home no orgânico
};

export default function ScanPage() {
  return (
    <main className="bg-ink text-paper min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-(--container-haus)">
        <div className="font-display text-xl tracking-[0.08em] uppercase">{site.brand}</div>

        <div className="mt-14 max-w-[24ch]">
          <h1 className="font-display text-[clamp(2.4rem,8vw,4.5rem)] leading-[0.86] uppercase">
            Seu app está <span className="text-accent">exposto?</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed opacity-70">
            Cole o endereço do seu site. Em 30 segundos você vê o que qualquer
            visitante consegue enxergar do seu sistema — sem cadastro e sem cartão.
          </p>
        </div>

        <div className="mt-10">
          <ScanForm />
        </div>

        <div className="border-line mt-16 border-t pt-8">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-45">
            o que a verificação cobre
          </p>
          <ul className="mt-4 grid gap-2 font-mono text-[12.5px] sm:grid-cols-2">
            {scanChecks.map((c) => (
              <li key={c} className="opacity-75">
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[58ch] text-[12.5px] leading-relaxed opacity-50">
            A verificação é passiva: nós só olhamos o que seu site já entrega a
            qualquer visitante. Nenhum dado do seu banco é lido — quando encontramos
            uma tabela aberta, provamos com a contagem de registros, nunca com o
            conteúdo.
          </p>
        </div>

        {/*
          Assinatura humana. Até 20/08/2026 esta página pedia a um estranho que
          colasse o endereço do app dele sem mostrar uma única pessoa por trás.
        */}
        <div className="border-line mt-12 border-t pt-8">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-45">
            quem vai olhar
          </p>
          <div className="mt-5 flex flex-wrap gap-x-10 gap-y-5">
            {people.map((p) => (
              <div key={p.name} className="flex items-center gap-3.5">
                <Avatar person={p} size={48} />
                <div>
                  <p className="font-display text-[15px] tracking-[0.04em] uppercase">
                    {p.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] opacity-45">
                    {p.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-[52ch] text-[12.5px] leading-relaxed opacity-50">
            Somos dois, em {site.city}. Você fala direto com quem escreve o código —
            não com atendimento.
          </p>
        </div>

        <div className="border-line mt-14 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t pt-8 font-mono text-[10px] tracking-[0.18em] uppercase opacity-40">
          <span>
            {site.brand} · {site.city} · {site.email}
          </span>
          <a href="/privacidade" className="underline underline-offset-4">
            privacidade
          </a>
        </div>
      </div>

      <WhatsAppFloat />
    </main>
  );
}
