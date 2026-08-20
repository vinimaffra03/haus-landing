import type { Bundle } from "./types.ts";

/*
  Coleta. Só GET, só o que o navegador de qualquer visitante já baixa.
  Nenhuma requisição aqui é mais intrusiva que abrir o site.
*/

const TIMEOUT_MS = 12_000;
/** Bundle acima disso quase sempre é source map ou asset — não vale o download. */
const MAX_BUNDLE_BYTES = 4 * 1024 * 1024;
const MAX_BUNDLES = 25;

export const UA = "haus-scanner/1.0 (+https://thehausdot.vercel.app)";

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  // Lança se for inválida — o CLI transforma isso em erro legível.
  return new URL(withProto).toString();
}

export async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const html = await res.text();
  return { html, headers: res.headers, status: res.status, finalUrl: res.url || url };
}

/** Extrai os src de <script> e o conteúdo dos scripts inline. */
export function extractScriptUrls(html: string, baseUrl: string): string[] {
  const urls = new Set<string>();
  const re = /<script[^>]+src\s*=\s*["']([^"']+)["']/gi;

  for (const m of html.matchAll(re)) {
    try {
      const abs = new URL(m[1], baseUrl).toString();
      // Só JS servido pelo próprio site ou CDN — ignora data: e blob:
      if (abs.startsWith("http")) urls.add(abs);
    } catch {
      // src malformado, ignora
    }
  }

  return [...urls].slice(0, MAX_BUNDLES);
}

export function extractInlineScripts(html: string): string {
  const re = /<script(?![^>]+src)[^>]*>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(re)].map((m) => m[1]).join("\n");
}

export async function fetchBundles(urls: string[]): Promise<{ bundles: Bundle[]; warnings: string[] }> {
  const bundles: Bundle[] = [];
  const warnings: string[] = [];

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const len = Number(res.headers.get("content-length") ?? 0);
      if (len > MAX_BUNDLE_BYTES) throw new Error(`bundle grande demais (${Math.round(len / 1024)}KB)`);

      const content = await res.text();
      if (content.length > MAX_BUNDLE_BYTES) throw new Error("bundle grande demais");

      return { url, content } satisfies Bundle;
    }),
  );

  results.forEach((r, i) => {
    if (r.status === "fulfilled") bundles.push(r.value);
    else warnings.push(`não foi possível ler ${urls[i]}: ${r.reason?.message ?? r.reason}`);
  });

  return { bundles, warnings };
}
