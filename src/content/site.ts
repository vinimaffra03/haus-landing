/*
  Todo o conteúdo da landing vive aqui. Mudar preço ou copy é mexer neste
  arquivo — nenhuma seção tem texto hard-coded.
*/

export const site = {
  brand: "haus.",
  tagline: "software house",
  city: "São Paulo",
  whatsapp: {
    // Formato internacional sem símbolos: 55 + DDD + número
    number: "5511999999999",
    message: "Oi! Vi o site da haus. e queria falar sobre meu app.",
  },
  email: "contato@haus.dev.br",
} as const;

export const hero = {
  line1: "SEU APP TRAVOU.",
  line2: "A GENTE COLOCA NO AR.",
  meta: "AUDITORIA EM 48H · R$300 · PREÇO FECHADO",
} as const;

export const stats = [
  {
    value: 90,
    suffix: "%",
    label: "dos repositórios gerados com IA têm ao menos uma vulnerabilidade",
  },
  {
    value: 75,
    suffix: "%",
    label: "têm controle de acesso quebrado — o banco fica aberto",
  },
  {
    value: 45,
    suffix: "%",
    label: "do código gerado por IA introduz falha de segurança",
  },
] as const;

export const statsSource = {
  label: "arXiv 2606.23130 · auditoria de 200 repositórios · Veracode 2025",
  href: "https://arxiv.org/html/2606.23130v2",
} as const;

/** O bloco de achados é a assinatura da marca. Ordenado por frequência real. */
export const findings = [
  { id: "01", text: "RLS ausente no banco", severity: "CRÍTICO" },
  { id: "02", text: "chave de API no bundle do client", severity: "CRÍTICO" },
  { id: "03", text: "autenticação só no frontend", severity: "CRÍTICO" },
  { id: "04", text: "webhook de pagamento sem verificação", severity: "CRÍTICO" },
  { id: "05", text: "sem validação de entrada", severity: "CRÍTICO" },
  { id: "06", text: "security headers ausentes", severity: "ALTO" },
  { id: "07", text: "dependência com CVE conhecido", severity: "ALTO" },
  { id: "08", text: "sem rate limiting", severity: "MÉDIO" },
  { id: "09", text: "sem staging nem rollback", severity: "MÉDIO" },
] as const;

export const steps = [
  {
    n: "01",
    title: "Você manda o link",
    body: "Repositório ou app no ar. Não precisa saber explicar o que está errado — esse é o nosso trabalho.",
  },
  {
    n: "02",
    title: "Relatório em 48h",
    body: "Cada achado com severidade, onde exatamente está, e como corrigir. Completo o bastante para você resolver sozinho se quiser.",
  },
  {
    n: "03",
    title: "Você decide",
    body: "Corrige por conta com o relatório na mão, ou a gente corrige com escopo e preço fechados antes de começar.",
  },
] as const;

export const prices = [
  { service: "Auditoria de segurança", term: "48h", price: "R$300", lead: true },
  { service: "Correção pontual", term: "3-5 dias", price: "R$600" },
  { service: "Colocar no ar — produção", term: "2 semanas", price: "R$2.200", from: true },
  { service: "Landing page", term: "1 semana", price: "R$1.400" },
  { service: "Landing avançada", term: "3 semanas", price: "R$3.400", from: true },
  { service: "Sistema / CRM sob medida", term: "orçado", price: "R$6.500", from: true },
  { service: "Monitoramento mensal", term: "contínuo", price: "R$400", suffix: "/mês" },
] as const;

export const people = [
  {
    initials: "VM",
    name: "VINICIUS MAFRA",
    role: "BACKEND · BANCO · SEGURANÇA",
    stack: "NODE / POSTGRES / SUPABASE",
    accent: true,
  },
  {
    initials: "—",
    name: "[SÓCIO]",
    role: "FRONTEND · INTEGRAÇÃO",
    stack: "REACT / NEXT / DEPLOY",
    accent: false,
  },
] as const;

/*
  Seis projetos reais, todos no ar e verificados (HTTP 200 em 14/08/2026).
  Três de cada sócio, escolhidos por AFINIDADE COM O PÚBLICO — fundador
  brasileiro não-técnico quer ver negócio parecido com o dele, não proeza
  técnica. Por isso os projetos de cripto e quant ficaram de fora: são os
  mais impressionantes tecnicamente e os que menos conversam com esse cliente.

  `summary` está descrito a partir do próprio site. Antes de publicar, revisem
  — vocês sabem o contexto que a meta description não conta.

  Previews geradas por `node scripts/previews.mjs` — versionadas em
  public/trabalhos/<slug>.webp (900x563). Sem dependencia externa em runtime.

  Para atualizar depois de mexer num projeto: node scripts/previews.mjs <slug>

*/
export const trabalhos = [
  {
    slug: "rickfretes",
    title: "RickFretes",
    kind: "Logística",
    stack: "Next.js · TypeScript",
    summary: "Fretes e mudanças em Curitiba, com orçamento automático no site.",
    url: "https://rickfretes.vercel.app",
    author: "VM",
  },
  {
    slug: "quattromed",
    title: "QuattroMed",
    kind: "Saúde",
    stack: "Next.js · TypeScript",
    summary: "Telemedicina com consulta online acessível para todo o Brasil.",
    url: "https://quattro-med.vercel.app",
    author: "JP",
  },
  {
    slug: "alphaplanner",
    title: "AlphaPlanner",
    kind: "Sistema",
    stack: "Next.js · TypeScript",
    summary: "Sistema de planejamento financeiro pessoal, com área logada.",
    url: "https://alphaplanner.vercel.app",
    author: "VM",
  },
  {
    slug: "worknow",
    title: "WorkNow",
    kind: "Marketplace",
    stack: "JavaScript · React",
    summary: "Plataforma de locação de salas comerciais, conectando proprietário e locatário.",
    url: "https://worknow-delta.vercel.app",
    author: "JP",
  },
  {
    slug: "smokeside",
    title: "SmokeSide",
    kind: "E-commerce",
    stack: "Next.js · TypeScript",
    summary: "Loja de streetwear com catálogo e coleção sazonal.",
    url: "https://smokesideco.vercel.app",
    author: "VM",
  },
  {
    slug: "houdimedia",
    title: "Houdi Media",
    kind: "Agência",
    stack: "JavaScript · React",
    summary: "Site da agência de tráfego pago, social media e branding.",
    url: "https://houdimedia.vercel.app",
    author: "JP",
  },
] as const;

export const faq = [
  {
    q: "E se vocês não acharem nada?",
    a: "Você recebe o relatório dizendo isso, com o que foi verificado item a item. Em 200 repositórios auditados, 9 em cada 10 tinham pelo menos uma falha — mas se o seu for a exceção, a gente diz.",
  },
  {
    q: "A auditoria abate no valor da correção?",
    a: "Não. Ela é avulsa e vale sozinha: o relatório é detalhado o suficiente para você corrigir por conta própria se preferir.",
  },
  {
    q: "Vocês precisam de acesso ao meu banco?",
    a: "Para a auditoria, não. Basta o repositório ou a URL do app. Acesso a produção só entra se você contratar a correção, e com credencial temporária que você revoga depois.",
  },
  {
    q: "Meu app foi feito no Lovable / Bolt / v0. Vocês julgam?",
    a: "Não. Ferramenta de IA constrói rápido e deixa buraco — isso é característica da ferramenta, não falha sua. Nosso trabalho começa exatamente aí.",
  },
] as const;

export function whatsappHref() {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message)}`;
}
