/*
  Contrato de saída do scanner.

  A disciplina que importa está no campo `evidence`: ele NUNCA pode conter
  conteúdo de linha de banco. Chave truncada, nome de tabela, header ausente
  e contagem são permitidos — dado de usuário, não.

  A razão não é estética. A Lei 14.155/2021 removeu do art. 154-A do Código
  Penal o requisito de "violação de mecanismo de segurança": acessar dado
  exposto pode configurar crime mesmo sem quebrar nada. Provar exposição com
  schema e contagem é seguro; provar com conteúdo não é.
*/

export type RuleCode =
  | "01" // RLS ausente ou permissiva
  | "02" // secret no bundle do client
  | "03" // injection / sem validação
  | "04" // autenticação quebrada
  | "05" // webhook de pagamento sem verificação
  | "06" // security headers ausentes
  | "07" // dependência com CVE conhecido
  | "08" // sem rate limiting
  | "09"; // sem separação staging/produção

export type Severity = "critica" | "alta" | "media";

export type Finding = {
  rule: RuleCode;
  severity: Severity;
  title: string;
  /** Prova. Nunca conteúdo de linha de banco. */
  evidence: string;
  /** Onde: URL do bundle, nome do header, nome da tabela. */
  where?: string;
  /** Texto de correção, vem pronto de rules.ts. */
  fix: string;
};

export type ScanResult = {
  url: string;
  startedAt: string;
  durationMs: number;
  findings: Finding[];
  /** O que foi efetivamente verificado — importante para o cliente saber o escopo. */
  checked: string[];
  /** Falhas de coleta que não são achados (site fora do ar, bundle inacessível). */
  warnings: string[];
};

/** Contexto que os checks compartilham — preenchido conforme a coleta avança. */
export type ScanContext = {
  url: string;
  html: string;
  headers: Headers;
  bundles: Bundle[];
  /** Descoberto pelo check de secrets, consumido pelo check de supabase. */
  supabase?: { projectUrl: string; anonKey: string };
  warnings: string[];
};

export type Bundle = {
  url: string;
  content: string;
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critica: 0,
  alta: 1,
  media: 2,
};
