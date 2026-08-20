import type { MetadataRoute } from "next";

/*
  Só as rotas que devem ranquear. A /scan não entra — ver src/app/robots.ts.
*/

const SITE = "https://haus.dev.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  return [
    { url: SITE, lastModified: agora, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE}/privacidade`,
      lastModified: agora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
