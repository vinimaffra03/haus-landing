import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/*
  next/font baixa e auto-hospeda no build — nenhuma requisição a CDN em runtime,
  e nenhum fallback silencioso. O peso condensado é o que faz esta direção
  funcionar; perder a fonte é perder a identidade inteira.
*/

const anton = Anton({
  weight: "400", // Anton só tem um peso, e ele já renderiza pesadíssimo
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE = "https://haus.dev.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "haus. — seu app travou, a gente coloca no ar",
  description:
    "Verifique seu app de graça em 30 segundos. Consertamos e colocamos no ar apps feitos com Lovable, Bolt, v0 e Replit. Preço fechado, sem orçamento surpresa.",
  /*
    ⚠️ Vocabulário deliberado. A política do Google Ads sobre "possibilitar
    comportamento desonesto" proíbe serviço que dê acesso não autorizado a
    sistemas, e um revisor automatizado pode confundir linguagem de segurança
    com isso. Evitamos: hacker, invadir, vulnerabilidade, exploit, brecha.
  */
  keywords: [
    "consertar app lovable",
    "finalizar app feito com IA",
    "desenvolvedor para terminar projeto",
    "colocar aplicativo no ar",
    "revisão técnica de app",
    "software house",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE,
    siteName: "haus.",
    title: "haus. — seu app travou, a gente coloca no ar",
    description:
      "Verificação grátis em 30 segundos. Apps feitos com IA, corrigidos e em produção.",
  },
  twitter: {
    card: "summary_large_image",
    title: "haus. — seu app travou, a gente coloca no ar",
    description: "Verificação grátis em 30 segundos.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${anton.variable} ${jetbrains.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="bg-ink text-paper font-sans min-h-full">
        {children}
        {/*
          Vercel Analytics: sem cookie, sem banner de consentimento, sem
          configuração. Não substitui GA4 nem pixel — mas hoje não havia
          NADA, e anunciar sem saber quantas pessoas chegam é gastar às cegas.
        */}
        <Analytics />
      </body>
    </html>
  );
}
