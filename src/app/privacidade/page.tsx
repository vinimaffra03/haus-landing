import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { site } from "@/content/site";

/*
  Política de privacidade.

  Escrita a partir do código, não de modelo pronto. Cada afirmação aqui é
  verificável nos arquivos citados — se alguém mexer neles, esta página mente:

    src/app/api/scan/route.ts   NÃO persiste nada; só timestamps de IP em memória
    src/app/layout.tsx          Vercel Analytics, sem cookie
    src/components/sections/Orcamento.tsx   NÃO tem formulário

  ⚠️ A primeira versão desta página descrevia coleta de nome/contato/descrição
  via Supabase, escrita a partir de api/lead/route.ts. Estava errada: o
  formulário foi removido da home e a rota responde 503 — nada no site a chama.
  Se o formulário voltar, este bloco volta junto.

  ⚠️ Mexeu no que essas rotas guardam? Volte aqui. Política desatualizada é pior
  que política ausente — ela vira prova documentada do descumprimento.

  Indexável de propósito: o Google Ads verifica a política no destino, e página
  bloqueada por robots levanta suspeita na revisão do anunciante.
*/

export const metadata: Metadata = {
  title: "Privacidade — haus.",
  description:
    "O que a haus. coleta, por que coleta, por quanto tempo guarda e como pedir exclusão.",
  robots: { index: true, follow: true },
};

const ATUALIZADO = "20 de agosto de 2026";

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-line mt-10 border-t pt-7">
      <h2 className="font-display text-xl tracking-[0.04em] uppercase">{titulo}</h2>
      <div className="mt-3.5 space-y-3.5 text-[14px] leading-relaxed opacity-70">
        {children}
      </div>
    </section>
  );
}

export default function Privacidade() {
  const mailto = "mailto:" + site.email;

  return (
    <main className="bg-ink text-paper min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-[68ch]">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.08em] uppercase"
          aria-label="Voltar para a home da haus."
        >
          {site.brand}
        </Link>

        <h1 className="font-display mt-12 text-[clamp(2rem,6vw,3.2rem)] leading-[0.9] uppercase">
          Política de <span className="text-accent">privacidade</span>
        </h1>

        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase opacity-45">
          atualizada em {ATUALIZADO}
        </p>

        <p className="mt-7 text-[14.5px] leading-relaxed opacity-80">
          Em resumo:{" "}
          <strong className="text-paper">este site não guarda nada sobre você</strong>.
          Não tem cadastro, não tem formulário e não tem banco de dados de
          visitante. A verificação grátis não salva o endereço que você cola. Não
          vendemos dado, não usamos cookie de rastreamento e não há anúncio de
          terceiro aqui.
        </p>

        <Bloco titulo="Quem somos">
          <p>
            A <strong className="text-paper">haus.</strong> é operada por Vinicius
            Mafra e João De Lazzari, pessoas físicas, em {site.city}. Ainda não há
            pessoa jurídica constituída — quando houver, esta página muda e a data
            acima muda junto.
          </p>
          <p>
            Contato para qualquer assunto desta política:{" "}
            <a className="text-accent underline underline-offset-4" href={mailto}>
              {site.email}
            </a>
            .
          </p>
        </Bloco>

        <Bloco titulo="O que este site guarda sobre você">
          <p>
            <strong className="text-paper">Nada.</strong> Não há cadastro,
            formulário ou login neste site, e não existe banco de dados com
            visitante. A única coisa registrada é o seu endereço de IP durante a
            verificação, do jeito descrito abaixo.
          </p>
          <p>
            Quando você fala com a gente é pelo WhatsApp ou por e-mail, e aí o
            que você escreve fica onde você escreveu — na conversa. Se virarmos
            fornecedor, o que for necessário para o trabalho é tratado em
            contrato à parte.
          </p>
        </Bloco>

        <Bloco titulo="Verificação grátis">
          <p>
            O endereço que você cola é usado para abrir o seu site e ler o que ele
            já entrega a qualquer visitante.{" "}
            <strong className="text-paper">
              Esse endereço não é gravado em lugar nenhum
            </strong>{" "}
            — nem ele, nem o resultado. Existe durante a requisição e some quando
            ela termina.
          </p>
          <p>
            A verificação é passiva. Não tentamos autenticação, não enviamos dado e
            não lemos conteúdo do seu banco: quando encontramos uma tabela aberta,
            provamos com a contagem de registros, nunca com o que tem dentro.
          </p>
          <p>
            Guardamos temporariamente o{" "}
            <strong className="text-paper">endereço de IP</strong> apenas para
            limitar a 5 verificações por minuto e conter abuso. Fica em memória do
            servidor, sem gravação em disco, e é descartado em cerca de um minuto.
          </p>
          <p className="opacity-90">
            <strong className="text-paper">Verifique só site que é seu</strong>, ou
            que você tenha autorização para verificar.
          </p>
        </Bloco>

        <Bloco titulo="Medição de acesso">
          <p>
            Usamos o Vercel Analytics, que{" "}
            <strong className="text-paper">não usa cookie</strong> e não monta
            perfil individual. Ele conta páginas vistas e eventos agregados —
            quantas verificações começaram, quantas terminaram, quantos cliques
            foram para o WhatsApp. Nenhum desses eventos carrega o endereço que você
            digitou.
          </p>
          <p>
            É por isso que este site não tem aviso de cookie: não há o que
            consentir.
          </p>
        </Bloco>

        <Bloco titulo="WhatsApp">
          <p>
            Ao clicar no botão de WhatsApp você sai deste site e passa a conversar
            pelo aplicativo, sob a política de privacidade da Meta. A mensagem já
            vem escrita para você não precisar explicar nada — você lê antes e pode
            apagar o que quiser antes de enviar.
          </p>
        </Bloco>

        <Bloco titulo="Com quem os dados são compartilhados">
          <p>
            Com ninguém para fins de marketing, e nunca para venda. Existem apenas
            os fornecedores necessários para o site funcionar:
          </p>
          <ul className="mt-1 space-y-2 font-mono text-[12.5px]">
            <li>— Vercel: hospedagem e medição de acesso</li>
            <li>— Meta/WhatsApp: só se você clicar no botão</li>
          </ul>
        </Bloco>

        <Bloco titulo="Seus direitos">
          <p>
            A LGPD (art. 18) te dá direito a confirmar se tratamos seus dados,
            acessá-los, corrigi-los, pedir anonimização ou{" "}
            <strong className="text-paper">exclusão</strong>, e saber com quem
            compartilhamos.
          </p>
          <p>
            Escreva para{" "}
            <a className="text-accent underline underline-offset-4" href={mailto}>
              {site.email}
            </a>
            . Respondemos em até 15 dias. Não cobramos nada por isso e não pedimos
            justificativa — para excluir, basta pedir.
          </p>
        </Bloco>

        <Bloco titulo="Trabalhos contratados">
          <p>
            Se você nos contratar e o serviço exigir acesso ao seu sistema, isso é
            tratado em contrato à parte, não por esta página. As regras que já valem
            por decisão nossa:{" "}
            <strong className="text-paper">
              nunca pedimos a chave de administração do seu banco
            </strong>
            , credencial de produção só entra quando não há alternativa e com acesso
            temporário que você revoga depois, e não copiamos base de produção para
            lugar nenhum.
          </p>
        </Bloco>

        <Bloco titulo="Mudanças">
          <p>
            Se esta política mudar, a data no topo muda. Alteração relevante em
            pedido de orçamento já registrado é avisada pelo contato que você
            deixou.
          </p>
        </Bloco>

        <p className="border-line mt-12 border-t pt-8 font-mono text-[10px] tracking-[0.18em] uppercase opacity-40">
          {site.brand} · {site.city} · {site.email}
        </p>
      </div>
    </main>
  );
}
