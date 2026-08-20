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
    number: "5511987837177",
    message: "Oi! Vi o site da haus. e queria falar sobre meu app.",
  },
  email: "thehausdot@gmail.com",
} as const;

export const hero = {
  line1: "SEU APP TRAVOU.",
  line2: "A GENTE COLOCA NO AR.",
  meta: "SCAN GRÁTIS EM 30 SEGUNDOS · SEM CADASTRO",
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
    title: "Cole o endereço do seu app",
    body: "Só o link, sem cadastro e sem cartão. Em 30 segundos você vê o que está exposto.",
  },
  {
    n: "02",
    title: "Veja o que achamos",
    body: "Cada problema com gravidade e explicação em português. O relatório é seu, mesmo que você não contrate nada.",
  },
  {
    n: "03",
    title: "Você decide",
    body: "Corrige por conta com o relatório na mão, ou a gente corrige com escopo e preço fechados antes de começar.",
  },
] as const;

/*
  Tabela revisada em 19/08/2026, com base em preço real de marketplace.

  O que a pesquisa mostrou e derrubou a tabela anterior:
  - Landing page: mediana do Fiverr R$438-547, Workana R$261-522.
    Os R$1.400 anteriores eram ~3x a mediana de mercado.
  - Correção pontual: Workana R$261-522; gigs "rescue Lovable" no Fiverr
    começam em R$157. O nicho JÁ tem preço global formado.
  - "Colocar no ar" a R$2.200 era 33% do faturamento bruto mensal de um MEI
    (teto R$81k/ano). Era o item mais exposto da tabela.
  - CRM a R$6.500 compete com SaaS pronto a R$100/usuário/mês.

  ⚠️ Preço menor SEM escopo menor é doar mão de obra. Os prazos abaixo foram
  encurtados junto com os valores — cada item é deliberadamente mais estreito
  do que era.

  ⚠️ O scan automatizado não é mais produto pago: existe concorrente com
  camada gratuita e R$99/mês. Ele virou isca. O que se cobra é julgamento
  humano — o que corrigir primeiro e o que o scanner não enxerga.
*/
/*
  ⚠️ Diagnóstico a R$9,98 desde 20/08/2026, por decisão dos sócios. Não é preço,
  é isca paga: a barreira que se quer derrubar é psicológica (de graça → cliente),
  não financeira. Três consequências que vieram junto e precisam ser gerenciadas:

  - A garantia "não achou, não paga" para de reverter risco. Ninguém pesa risco
    de R$9,98. Ela continua no ar porque comunica confiança, não porque converte.
  - Abre um degrau de 35x até a correção de R$350. É nesse vão que a venda morre,
    e é o que o diagnóstico precisa costurar sozinho.
  - Qualquer minuto humano aqui dá prejuízo. O diagnóstico TEM que ser quase
    todo automático — se voltar a custar 30 min de trabalho, o preço é uma
    doação, não uma estratégia.

  Alternativa registrada caso o degrau se mostre fatal: R$49 com a mesma
  garantia. Continua compra por impulso e mantém a escada navegável.
*/
export const prices = [
  { service: "Scan de superfície", term: "30 segundos", price: "grátis", lead: true },
  { service: "Diagnóstico com prioridade", term: "24h", price: "R$9,98" },
  { service: "Correção pontual", term: "2 dias", price: "R$350" },
  { service: "Landing page", term: "4 dias", price: "R$650" },
  { service: "Colocar no ar — produção", term: "1 semana", price: "R$1.200", from: true },
  { service: "Landing avançada", term: "2 semanas", price: "R$1.800", from: true },
  { service: "Sistema sob medida", term: "orçado", price: "R$3.500", from: true },
  { service: "Monitoramento mensal", term: "contínuo", price: "R$200", suffix: "/mês" },
] as const;

/*
  Os 4 checks da porta 1, na ordem em que src/lib/scan/index.ts os executa.

  Servem em dois lugares: a lista estática do "o que a verificação cobre" na
  /scan, e o indicador de progresso durante a espera. Manter numa fonte só evita
  que o progresso mostre um check que o scanner não faz mais.
*/
export const scanChecks = [
  "Chaves de acesso no código do navegador",
  "Tabelas do banco abertas ao público",
  "Proteções de navegador ausentes",
  "Bibliotecas com falha conhecida",
] as const;

/*
  `photo` sai de `node scripts/fotos.mjs`, a partir dos originais em fotos/.
  Enquanto estiver vazia, a seção cai nas iniciais e nada quebra.

  ⚠️ Teto de 96px de exibição. O original do De Lazzari tem ~299px de largura;
  a 96px com tela 2x dá 192px e fica nítido. Acima disso borra.
*/
export const people = [
  {
    initials: "VM",
    name: "VINICIUS MAFRA",
    role: "BACKEND · BANCO · SEGURANÇA",
    stack: "NODE / POSTGRES / SUPABASE",
    accent: true,
    photo: "",
  },
  {
    initials: "JD",
    name: "JOÃO DE LAZZARI",
    role: "FRONTEND · INTEGRAÇÃO",
    stack: "REACT / NEXT / DEPLOY",
    accent: false,
    photo: "",
  },
] as const;

/*
  Garantia — fechada pelos sócios em 20/08/2026.

  Sem valor escrito aqui de propósito: a /scan foi mantida sem nenhum "R$" por
  decisão deles, e este texto é usado nas duas páginas.
*/
export const garantia = {
  titulo: "Se a gente não achar nada, você não paga",
  corpo:
    "O diagnóstico completo custa menos que um café. E se mesmo assim não encontrarmos nada que valha a pena corrigir, você não paga — a gente te diz isso na cara e devolve.",
} as const;

/*
  Seis projetos reais, todos no ar e verificados (HTTP 200 em 14/08/2026).
  Três de cada sócio, escolhidos por AFINIDADE COM O PÚBLICO — fundador
  brasileiro não-técnico quer ver negócio parecido com o dele, não proeza
  técnica. Por isso os projetos de cripto e quant ficaram de fora: são os
  mais impressionantes tecnicamente e os que menos conversam com esse cliente.

  `summary` está descrito a partir do próprio site. Antes de publicar, revisem
  — vocês sabem o contexto que a meta description não conta.

  Previews geradas por `node scripts/previews.mjs` — versionadas em
  public/trabalhos/<slug>.webp, 900px de largura e ALTURA VARIÁVEL.

  A altura sai de 15% do comprimento real da página de cada projeto, então
  site longo vira card alto e site curto vira card baixo. Isso não é estética:
  masonry com imagens de proporção idêntica é só um grid com JS a mais.
  Variação atual: 633px a 1400px (2,2x).

  Para atualizar depois de mexer num projeto: node scripts/previews.mjs <slug>

*/
export const trabalhos = [
  {
    slug: "rickfretes",
    /** Altura real da preview — o masonry usa para calcular a coluna. */
    height: 904,
    title: "RickFretes",
    kind: "Logística",
    stack: "Next.js · TypeScript",
    summary: "Fretes e mudanças em Curitiba, com orçamento automático no site.",
    url: "https://rickfretes.vercel.app",
    author: "VM",
  },
  {
    slug: "quattromed",
    /** Altura real da preview — o masonry usa para calcular a coluna. */
    height: 1212,
    title: "QuattroMed",
    kind: "Saúde",
    stack: "Next.js · TypeScript",
    summary: "Telemedicina com consulta online acessível para todo o Brasil.",
    url: "https://quattro-med.vercel.app",
    author: "JP",
  },
  {
    slug: "alphaplanner",
    /** Altura real da preview — o masonry usa para calcular a coluna. */
    height: 1075,
    title: "AlphaPlanner",
    kind: "Sistema",
    stack: "Next.js · TypeScript",
    summary: "Sistema de planejamento financeiro pessoal, com área logada.",
    url: "https://alphaplanner.vercel.app",
    author: "VM",
  },
  {
    slug: "worknow",
    /** Altura real da preview — o masonry usa para calcular a coluna. */
    height: 1296,
    title: "WorkNow",
    kind: "Marketplace",
    stack: "JavaScript · React",
    summary: "Plataforma de locação de salas comerciais, conectando proprietário e locatário.",
    url: "https://worknow-delta.vercel.app",
    author: "JP",
  },
  {
    slug: "smokeside",
    /** Altura real da preview — o masonry usa para calcular a coluna. */
    height: 633,
    title: "SmokeSide",
    kind: "E-commerce",
    stack: "Next.js · TypeScript",
    summary: "Loja de streetwear com catálogo e coleção sazonal.",
    url: "https://smokesideco.vercel.app",
    author: "VM",
  },
  {
    slug: "houdimedia",
    /** Altura real da preview — o masonry usa para calcular a coluna. */
    height: 1400,
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
    q: "O scan é grátis mesmo? Qual a pegadinha?",
    a: "É grátis e não pede cadastro. Ele olha o que qualquer visitante do seu site já consegue ver — por isso sai em segundos e não nos custa nada. O que cobramos é o passo seguinte: dizer o que corrigir primeiro e corrigir.",
  },
  {
    q: "E se o scan não achar nada?",
    a: "Ótimo, e você não paga nada. Mas fique atento: o scan enxerga só o lado de fora. Cinco dos nove problemas que procuramos só aparecem com acesso ao código — é isso que o diagnóstico completo cobre.",
  },
  {
    q: "Vocês precisam de acesso ao meu banco de dados?",
    a: "Para o scan, não — basta o endereço do site. Para o diagnóstico completo, o código. Acesso a produção só entra se você contratar a correção, e com credencial temporária que você revoga depois.",
  },
  {
    q: "Vocês olham dentro dos meus dados?",
    a: "Não, e isso é decisão técnica nossa. Quando encontramos uma tabela aberta, provamos com a contagem de registros — nunca lendo o conteúdo. O scan é feito de forma que nenhuma linha do seu banco chega até nós.",
  },
  {
    q: "Meu app foi feito no Lovable, Bolt ou v0. Vocês julgam?",
    a: "Não. Ferramenta de IA constrói rápido e deixa buraco — isso é característica da ferramenta, não falha sua. Nosso trabalho começa exatamente aí.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Pix, com metade na aprovação do escopo e metade na entrega. Escopo e prazo são fechados por escrito antes de começar — se algo sair do combinado, orçamos à parte e você aprova antes.",
  },
] as const;

export function whatsappHref(mensagem: string = site.whatsapp.message) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;
}

/** Quantos achados são listados na mensagem antes de virar "e mais N". */
const MAX_NA_MENSAGEM = 6;

/*
  Monta a mensagem do WhatsApp já com o resultado do scan dentro.

  Por que isto existe: até 20/08/2026 o botão pós-scan mandava o texto genérico.
  A pessoa via o resultado, clicava, e chegava no WhatsApp com uma tela em branco
  e a obrigação de explicar tudo de novo. O funil vazava inteiro no passo mais
  caro — o clique já tinha sido pago.

  🚨 INVARIANTE: só `title` entra aqui. NUNCA `evidence`.

  `evidence` é o campo que carrega chave truncada e nome de tabela, e a
  disciplina de src/lib/scan/checks/supabase.ts é justamente que ele jamais
  contenha conteúdo de linha. Uma query string vai parar em log de servidor,
  histórico de navegador e prévia de link — é o pior lugar possível para
  qualquer coisa que se pareça com credencial. Título é rótulo de regra, texto
  fixo escrito por nós, e não carrega nada do cliente.
*/
export function whatsappScanHref(
  url: string,
  achados: readonly { title: string; severity: string }[],
) {
  if (achados.length === 0) {
    return whatsappHref(
      `Oi! Rodei a verificação em ${url} e não apareceu nada por fora. ` +
        `Queria entender o que só dá pra ver com acesso ao código.`,
    );
  }

  const criticos = achados.filter((a) => a.severity === "critica").length;
  const lista = achados
    .slice(0, MAX_NA_MENSAGEM)
    .map((a) => `- ${a.title}`)
    .join("\n");
  const resto =
    achados.length > MAX_NA_MENSAGEM
      ? `\n- e mais ${achados.length - MAX_NA_MENSAGEM}`
      : "";

  return whatsappHref(
    `Oi! Rodei a verificação em ${url} e deu ${achados.length} ponto(s)` +
      (criticos > 0 ? `, sendo ${criticos} crítico(s)` : "") +
      `:\n\n${lista}${resto}\n\nQueria saber o que corrigir primeiro.`,
  );
}
