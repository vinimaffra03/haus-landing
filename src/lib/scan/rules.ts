import type { RuleCode, Severity } from "./types.ts";

/*
  As 9 regras, com o texto de correção já escrito.

  Isto é o que torna o serviço repetível: o achado não é só "tem problema",
  é "tem este problema, aqui, e conserta assim". O texto abaixo vai direto
  para o relatório do cliente — escreva pensando em fundador não-técnico
  que precisa entender a gravidade sem saber o que é RLS.
*/

export type Rule = {
  code: RuleCode;
  severity: Severity;
  title: string;
  /** Uma linha, para o cliente leigo entender por que isso importa. */
  why: string;
  fix: string;
};

export const RULES: Record<RuleCode, Rule> = {
  "01": {
    code: "01",
    severity: "critica",
    title: "Banco de dados sem proteção de acesso (RLS)",
    why: "Qualquer pessoa com a chave pública do seu site — que fica visível no navegador — consegue ler essas tabelas direto, sem passar pelo login.",
    fix: "Ative Row Level Security em cada tabela exposta e escreva policies que confiram `auth.uid()`. Enquanto a policy não existir, a tabela deve ficar inacessível — RLS ligada sem policy nega tudo, que é o estado seguro.",
  },
  "02": {
    code: "02",
    severity: "critica",
    title: "Chave secreta exposta no código do navegador",
    why: "Essa chave dá acesso total ao seu banco, ignorando qualquer regra de permissão. Ela está no arquivo que todo visitante baixa.",
    fix: "Remova a chave do código do cliente e revogue-a imediatamente — considere-a comprometida. Chave de service_role só pode viver no servidor, em variável de ambiente sem prefixo público (nada de NEXT_PUBLIC_ ou VITE_).",
  },
  "03": {
    code: "03",
    severity: "critica",
    title: "Entrada de usuário sem validação",
    why: "Formulários que aceitam qualquer coisa permitem que um visitante mal-intencionado envie comandos em vez de dados.",
    fix: "Valide toda entrada no servidor com schema (Zod ou equivalente), limitando tipo e tamanho. Validação só no navegador não protege — ela é contornável.",
  },
  "04": {
    code: "04",
    severity: "critica",
    title: "Autenticação decidida no navegador",
    why: "Se quem decide se você é admin é o código que roda no navegador do visitante, ele pode simplesmente mudar essa resposta.",
    fix: "Mova toda decisão de permissão para o servidor ou para policies do banco. O código do navegador pode esconder um botão, mas nunca pode ser a única barreira.",
  },
  "05": {
    code: "05",
    severity: "critica",
    title: "Webhook de pagamento sem verificação de assinatura",
    why: "Sem verificar a assinatura, qualquer pessoa pode simular um aviso de pagamento aprovado e liberar acesso sem pagar.",
    fix: "Use `stripe.webhooks.constructEvent` com o signing secret em toda rota de webhook, e trate cada evento como idempotente para não processar o mesmo pagamento duas vezes.",
  },
  "06": {
    code: "06",
    severity: "media",
    title: "Cabeçalhos de segurança ausentes",
    why: "Sem esses cabeçalhos, seu site fica mais vulnerável a ataques que roubam sessão do usuário ou embutem sua página em outro site.",
    fix: "Configure Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options e Referrer-Policy. Em Next.js isso vai no `headers()` do next.config.",
  },
  "07": {
    code: "07",
    severity: "alta",
    title: "Biblioteca com falha de segurança conhecida",
    why: "Uma das bibliotecas do seu site tem falha pública documentada — quem quiser atacar já sabe como.",
    fix: "Atualize a biblioteca para a versão corrigida e rode `npm audit` no CI para não regredir.",
  },
  "08": {
    code: "08",
    severity: "media",
    title: "Sem limite de requisições",
    why: "Sem limite, alguém pode disparar milhares de chamadas e derrubar o site ou gerar conta alta de infraestrutura.",
    fix: "Adicione rate limiting nas rotas sensíveis (login, formulários, APIs pagas) via middleware ou o firewall da plataforma.",
  },
  "09": {
    code: "09",
    severity: "media",
    title: "Sem separação entre teste e produção",
    why: "Testar direto em produção significa que qualquer erro atinge seus usuários reais, e não há como voltar atrás rapidamente.",
    fix: "Separe ambientes de preview e produção com bancos distintos, e garanta que exista rollback de um clique no deploy.",
  },
};

export function rule(code: RuleCode): Rule {
  return RULES[code];
}
