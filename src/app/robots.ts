import type { MetadataRoute } from "next";

/*
  /scan é landing de tráfego pago. Se ela ranquear no orgânico, passa a competir
  com a home pela mesma busca — e a /scan tem uma oferta só, sem preço, sem
  portfólio e sem FAQ. Ganhar o clique orgânico com ela é perder a venda.

  A página já manda `noindex` pela metadata (src/app/scan/page.tsx). Isto aqui é
  a segunda tranca: `noindex` depende do robô baixar e ler o HTML, o Disallow
  corta antes.

  /api fica de fora porque não há nada ali para indexar.
  /privacidade fica DE FORA do bloqueio de propósito — o Google Ads verifica a
  política no destino durante a revisão do anunciante.
*/

const SITE = "https://haus.dev.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/scan", "/api/"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
