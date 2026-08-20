import { rule } from "../rules.ts";
import type { Finding, ScanContext } from "../types.ts";

/*
  Detector de segredo no bundle servido — o achado nº2, e o de maior valor.

  O sinal é ESTRUTURAL, não estatístico: um JWT decodificável cujo claim
  `role` é `service_role`. Entropia genérica gera falso positivo demais em
  bundle minificado (hash de build, id de source map, base64 de asset).

  ⚠️ REGRA QUE NÃO SE QUEBRA: `role: anon` é público POR DESIGN.
  A anon key existe para ficar no navegador; ela é segura desde que RLS
  esteja ligada. Reportá-la como vulnerabilidade queima a credibilidade
  no primeiro cliente que entende do assunto.
*/

const JWT_RE = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
const SUPABASE_URL_RE = /https:\/\/([a-z0-9]{20})\.supabase\.co/gi;

/** Segredos de formato conhecido. Prefixo fixo = zero ambiguidade. */
const PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bsk_live_[A-Za-z0-9]{16,}/g, label: "chave secreta de produção do Stripe" },
  { re: /\bsk_test_[A-Za-z0-9]{16,}/g, label: "chave secreta de teste do Stripe" },
  { re: /\brk_live_[A-Za-z0-9]{16,}/g, label: "chave restrita do Stripe" },
  { re: /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, label: "chave do SendGrid" },
  { re: /\bAKIA[0-9A-Z]{16}\b/g, label: "access key da AWS" },
  { re: /\bsk-proj-[A-Za-z0-9_-]{20,}/g, label: "chave da OpenAI" },
  { re: /\bsk-ant-[A-Za-z0-9_-]{20,}/g, label: "chave da Anthropic" },
  { re: /\bghp_[A-Za-z0-9]{36}\b/g, label: "token do GitHub" },
  { re: /postgres(?:ql)?:\/\/[^\s"'`]{10,}/g, label: "string de conexão do Postgres" },
  /*
    Ampliação de 20/08/2026. Mesmo critério dos de cima: prefixo fixo, zero
    ambiguidade. Nada de entropia genérica — em bundle minificado isso gera
    falso positivo em hash de build e base64 de asset.

    ⚠️ NÃO entram aqui, por serem públicas por design (mesma razão da anon key
    do Supabase): a apiKey do Firebase (`AIza…`), o token público do Mapbox
    (`pk.`) e a publishable key do Stripe (`pk_live_`). Todas as três são
    feitas para ficar no navegador. Reportá-las é o erro que queima a
    credibilidade no primeiro cliente que entende do assunto.
  */
  { re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/g, label: "chave do Resend" },
  { re: /\bshpat_[a-fA-F0-9]{32}\b/g, label: "token de acesso da Shopify" },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g, label: "token do Slack" },
  { re: /\bglpat-[A-Za-z0-9_-]{20,}/g, label: "token do GitLab" },
  { re: /\bAC[a-f0-9]{32}\b/g, label: "Account SID da Twilio" },
  { re: /\bGOCSPX-[A-Za-z0-9_-]{20,}/g, label: "client secret do Google OAuth" },
  { re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g, label: "chave privada" },
  { re: /\bmongodb(?:\+srv)?:\/\/[^\s"'`]{10,}/g, label: "string de conexão do MongoDB" },
];

/** Mostra o suficiente para o cliente localizar a chave, sem republicá-la. */
function truncate(secret: string): string {
  if (secret.length <= 18) return `${secret.slice(0, 6)}…`;
  return `${secret.slice(0, 10)}…${secret.slice(-4)}`;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function checkSecrets(ctx: ScanContext): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<string>();

  for (const bundle of ctx.bundles) {
    // ---- JWTs (Supabase) ----
    for (const match of bundle.content.match(JWT_RE) ?? []) {
      const payload = decodeJwtPayload(match);
      if (!payload) continue;

      const role = typeof payload.role === "string" ? payload.role : null;

      if (role === "service_role") {
        const key = `service_role:${match.slice(0, 24)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const r = rule("02");
        findings.push({
          rule: r.code,
          severity: r.severity,
          title: "Chave service_role do Supabase exposta no navegador",
          evidence: `JWT com claim role="service_role": ${truncate(match)}`,
          where: bundle.url,
          fix: r.fix,
        });
      }

      // role === "anon" é esperado e NÃO é achado. Guardamos só para o check
      // de Supabase conseguir consultar o schema depois.
      if (role === "anon" && !ctx.supabase) {
        const projectUrl = findSupabaseUrl(ctx);
        if (projectUrl) ctx.supabase = { projectUrl, anonKey: match };
      }
    }

    // ---- Outros segredos de formato conhecido ----
    for (const { re, label } of PATTERNS) {
      for (const match of bundle.content.match(re) ?? []) {
        const key = `${label}:${match.slice(0, 20)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const r = rule("02");
        findings.push({
          rule: r.code,
          severity: r.severity,
          title: `Segredo exposto no navegador: ${label}`,
          evidence: `${label} encontrada no código servido: ${truncate(match)}`,
          where: bundle.url,
          fix: r.fix,
        });
      }
    }
  }

  return findings;
}

/** Procura a URL do projeto Supabase em qualquer bundle. */
function findSupabaseUrl(ctx: ScanContext): string | null {
  for (const bundle of ctx.bundles) {
    const m = SUPABASE_URL_RE.exec(bundle.content);
    SUPABASE_URL_RE.lastIndex = 0;
    if (m) return `https://${m[1]}.supabase.co`;
  }
  return null;
}
