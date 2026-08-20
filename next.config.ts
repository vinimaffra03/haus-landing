import type { NextConfig } from "next";

/*
  Cabeçalhos de segurança.

  Motivo de existirem: até 20/08/2026 este site tinha 1 dos 5, e o scanner da
  própria haus. reprovava a haus. — o prospect técnico cola thehausdot.vercel.app
  antes de colar o site dele, e recebia 4 achados na empresa que vende segurança.

  ⚠️ `unsafe-inline` em script-src é uma concessão consciente, não descuido.
  O App Router injeta o payload de RSC em <script> inline a cada resposta; sem
  nonce isso exige unsafe-inline. Nonce exigiria middleware, o que torna toda
  página dinâmica e mataria a entrega estática de 0,57s que é o que faz esta
  landing converter.

  Numa aplicação com login, formulário ou dado de usuário essa troca seria
  errada e a resposta seria nonce + middleware. Aqui não há entrada de usuário
  nem sessão: a superfície de XSS é a própria equipe publicando script.

  O que continua valendo integralmente e é onde está o ganho real:
  frame-ancestors, nosniff, Referrer-Policy, HSTS, base-uri, form-action.
*/

/*
  Em desenvolvimento o React usa `eval` para reconstruir stack de erro do
  servidor no navegador — sem `unsafe-eval` o `next dev` quebra. Em produção
  nem o React nem o Next usam eval, então lá ele não entra.
  Fonte: node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
*/
const DEV = process.env.NODE_ENV === "development";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // /api/scan e o Vercel Analytics (/_vercel/insights) são mesma origem.
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          /*
            A Vercel já serve HSTS no domínio dela, mas o header precisa existir
            em domínio próprio também — e quando haus.dev.br entrar, este aqui é
            o que vale. preload fica de fora de propósito: entrar na lista de
            preload é praticamente irreversível.
          */
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /*
            Desliga APIs que este site não usa. Não é exigido pelo scan — é o
            tipo de coisa que a gente cobra para configurar no cliente, então
            não faz sentido não ter aqui.
          */
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
