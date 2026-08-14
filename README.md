# haus. — landing

Next.js 16 · React 19 · Tailwind 4 · TypeScript

Landing da software house. Direção visual **A (condensada)** — preto, laranja de
correção, raio zero. O sistema completo está em
[`docs/design-system`](#sistema-de-design).

## Rodar

```bash
npm install
cp .env.example .env.local   # preencher para o formulário gravar
npm run dev
```

Abre em `http://localhost:3000`.

## Estrutura

```
src/
  content/site.ts         ← TODO o conteúdo e os preços vivem aqui
  app/
    layout.tsx            fontes auto-hospedadas + metadata/SEO
    page.tsx              ordem das seções
    api/lead/route.ts     recebe o formulário
  components/
    ui.tsx                Section, Eyebrow, Display, botões
    fx/                   LetterGlitch, ScrambleText, CountUp, Reveal
    sections/             uma por seção da página
supabase/leads.sql        tabela de leads
```

**Para mudar preço ou copy, mexa só em `src/content/site.ts`.** Nenhuma seção tem
texto hard-coded.

## Antes de publicar

- [ ] Trocar o número em `site.whatsapp.number` (formato `55DDDNÚMERO`)
- [ ] Preencher nome e stack do segundo sócio em `people`
- [ ] Trocar as iniciais por **foto real** em `QuemFaz.tsx` — rosto converte mais
- [ ] Conferir a cidade em `site.city`
- [ ] Rodar `supabase/leads.sql` e preencher `.env.local`
- [ ] Ajustar `SITE` em `layout.tsx` para o domínio real

## Decisões que parecem detalhe e não são

**Fontes auto-hospedadas via `next/font`.** Nada de CDN. O peso condensado é o que
faz a direção A funcionar — fallback silencioso destrói a identidade inteira.

**Canvas, não WebGL.** Aurora, Silk e Dark Veil do ReactBits são bonitos e pesados;
a conversão vem do celular e fundo WebGL derruba o LCP. Letter Glitch em canvas
entrega a mesma sensação por uma fração do custo.

**Duas CTAs com hierarquia explícita.** Formulário é a ação primária; WhatsApp é
escape de baixo atrito com peso visual menor. Peso igual não converte nenhum dos dois.

**A rota `/api/lead` responde 503 em produção se o Supabase não estiver configurado.**
É deliberado. Responder "recebemos" sem gravar faria vocês perderem lead sem
nunca descobrir — melhor mandar a pessoa ao WhatsApp.

**Os componentes de animação falham abertos.** Se `IntersectionObserver` não
entregar, o conteúdo aparece mesmo assim e os números assumem o valor final.
Conteúdo escondido atrás de um observer é conteúdo que pode nunca aparecer.

## Animações

Implementadas no espírito do [ReactBits](https://reactbits.dev), ajustadas à paleta:

| Componente | Onde | Referência |
|---|---|---|
| `LetterGlitch` | fundo do hero | [Letter Glitch](https://reactbits.dev/backgrounds/letter-glitch) |
| `ScrambleText` | título do hero | [Scramble Text](https://www.reactbits.dev/text-animations/scramble-text) |
| `CountUp` | números de prova | — |
| `Reveal` | entrada das seções | — |
| `.grid-bg` | seções escuras | CSS puro |

Todas respeitam `prefers-reduced-motion`.

## Verificação

```bash
npm run build   # compila + typecheck
npm run lint
```

**O que ainda não foi verificado visualmente:** o `LetterGlitch`, o `CountUp` e a
transição do `Reveal` dependem de `requestAnimationFrame`, `ResizeObserver` e
`IntersectionObserver`. O navegador usado no desenvolvimento não compõe quadros e
nenhum dos três dispara nele — confirmado com probe direto. Abra
`http://localhost:3000` num navegador real e confirme:

1. O fundo do hero mostra caracteres embaralhando, com alguns em laranja
2. O título se resolve do embaralhado ao entrar
3. Os números 90 / 75 / 45 contam ao entrar na viewport
4. As seções entram com fade sutil
