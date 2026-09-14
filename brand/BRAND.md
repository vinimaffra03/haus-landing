# haus. — identidade visual e de marca

Handoff completo para criar qualquer peça (post de Instagram, story, capa, anúncio,
apresentação) mantendo a mesma cara do site. Serve tanto para o Claude cowork
quanto para o Claude normal: cole este arquivo no contexto antes de pedir arte.

A regra que governa tudo: **não pode parecer feito por IA.** O que faz parecer IA
está listado no fim — leia antes de começar.

---

## 1. Quem é a haus.

Software house de dois sócios — **Vinicius Mafra** (backend, banco, segurança) e
**João De Lazzari** (frontend, integração). Atende **fundador brasileiro
não-técnico** que fez um app com IA (Lovable, Bolt, v0, Replit) e travou antes de
colocar no ar.

**O que a marca comunica:** competência técnica sem arrogância, honestidade radical,
"você fala direto com quem escreve o código". A promessa é *"seu app travou, a gente
coloca no ar"*.

**Tom de voz:** direto, plano, um pouco seco. Frase curta. Sem superlativo, sem
"transformamos", sem "soluções inovadoras", sem "impulsione". Fala como dev que
respeita o tempo do outro. Exemplos reais do site:

- "SEU APP TRAVOU. A GENTE COLOCA NO AR."
- "Você fala direto com quem escreve o código — não com atendimento."
- "Não precisa saber explicar o que está errado — esse é o nosso trabalho."
- "Se a gente não achar nada, você não paga."

---

## 2. A ideia visual: planta técnica, não pôster

A marca é **desenho técnico** — planta de engenharia, não modernismo decorativo.
Peso de linha vira hierarquia; cota e anotação são elementos legítimos; o grid é
visível, não escondido. Mono porque medida se escreve em mono.

**A tese de cor:** papel + grafite + **vermelho de correção**. A cor só existe
**onde há correção** — que é onde está o valor. Alguém desenhou, o desenho tem
problema, você marca em vermelho e devolve. É literalmente o que a haus. faz com o
código gerado por IA. Por isso o laranja-vermelho nunca é enfeite: ele marca a coisa
que importa (um preço, um dado, o ponto do wordmark, um achado crítico).

O ponto do `haus.` funciona como **marca de cota** — o pingo de dimensão de uma
planta. É o átomo da marca.

---

## 3. Paleta — tokens exatos

Copie estes hex. São os mesmos do site (`src/app/globals.css`).

| Papel | uso | hex |
|---|---|---|
| **Preto (ink)** | fundo principal, a identidade | `#000000` |
| Preto 2 | fundo alternativo sutil | `#0A0A0A` |
| **Acento (correção)** | só onde há valor/correção | `#D33D00` |
| **Papel** | texto sobre preto | `#F5F5F5` |
| Ardósia (slate) | secundário, blocos | `#303F3C` |
| Linha | divisórias sobre preto | `#1E1E1E` |
| Linha 2 | divisórias mais visíveis | `#2C2C2C` |
| Dim | texto apagado, legendas | `#7A7A7A` |

**Regra de uso da cor:**
- Fundo é **preto** por padrão. Papel (`#F5F5F5`) é o fundo claro alternativo, usado
  seção sim seção não — nunca cinza, nunca gradiente.
- **O acento `#D33D00` é raro.** Num post inteiro ele aparece em UM ou dois lugares:
  o ponto do wordmark, um número que importa, uma palavra-chave. Se mais de ~10% da
  arte é laranja, está errado.
- **Sem gradiente. Sem sombra. Sem brilho. Sem glassmorphism.** Raio zero em tudo
  (cantos retos, sempre).

---

## 4. Tipografia

| Papel | fonte | onde usar |
|---|---|---|
| **Display** | **Anton** (Google Fonts, peso 400) | títulos, wordmark, números gigantes. Sempre CAIXA ALTA, condensada, pesadíssima |
| **Mono** | **JetBrains Mono** | dado técnico, legenda, preço, rótulo, número de item, "cota" |
| Corpo | **Inter** | texto corrido quando precisar (raro em post) |

Substitutos gratuitos equivalentes se Anton faltar: **Oswald** ou **Bebas Neue** no
display; qualquer mono decente (Consolas) no lugar do JetBrains.

**Como o display se comporta:** corpo enorme (o título ocupa a largura toda),
entrelinha apertada (`line-height` ~0.86), tracking levemente negativo. O salto de
escala entre o título gigante e a legenda mono de 10-11px em caixa alta com tracking
largo (`letter-spacing` ~0.18em) É o que sinaliza qualidade — não a cor.

---

## 5. O wordmark e o logo de perfil

- Wordmark oficial: **`haus.`** em caixa baixa com ponto. O ponto é a marca de cota.
- Em contextos que pedem caixa alta (o site força uppercase por CSS), vira `HAUS.`
  — e aí o ponto ganha o acento `#D33D00`.
- **Logos de perfil prontos** (1000×1000, nesta pasta):
  - `haus-perfil-preto.png` — fundo preto, "HAUS" branco, ponto laranja. **Este é o
    principal** (foto de perfil do Instagram).
  - `haus-perfil-branco.png` — fundo papel, "HAUS" preto, ponto laranja. Alternativa
    para fundos claros.
- **Favicon / ícone**: `h` geométrico + ponto-cota laranja sobre preto
  (`src/app/icon.svg`).

⚠️ O Instagram recorta a foto de perfil em círculo — o wordmark cabe, mas nunca
adicione moldura ou texto extra à imagem de perfil.

---

## 6. Imagem e fotografia

- **Fotos de pessoa: preto e branco, contraste levantado.** Nunca coloridas. É o que
  faz duas selfies em luz diferente virarem um sistema. (Ver `scripts/fotos.mjs`.)
- Preview de projeto/produto: captura real da tela, sem mockup de celular flutuando,
  sem sombra, sem perspectiva 3D.
- Textura permitida: o **grid de fundo** (linhas finas a 40px) e o "letter glitch"
  (caracteres mono caindo) — ambos discretos, opacidade baixa, nunca competindo com o
  texto. É o único "movimento" da marca.

---

## 7. Layout de um post (receita)

1. Fundo preto (`#000`) ou papel (`#F5F5F5`), escolha um. Raio zero.
2. Um título em Anton, caixa alta, ocupando a largura — uma frase seca.
3. O dado ou a legenda em JetBrains Mono, pequeno, caixa alta, tracking largo.
4. UMA marca de acento `#D33D00`: um ponto, um número, uma palavra.
5. Muito espaço vazio. A composição respira — não encha.
6. Assinatura: `haus.` no canto, mono, apagado (`#7A7A7A`).

**Grid:** margens generosas, alinhamento à esquerda (não centralize texto longo). Se
usar números de item, formate como `[01]` `[02]` em mono, como o site faz nos achados.

---

## 8. O que NUNCA fazer (é o que faz parecer IA)

Os sócios rejeitaram uma rodada inteira de identidade por parecer de IA. Registro do
que estava errado, para não repetir:

- ❌ **Catálogo de estilos em cartões uniformes.** Uma direção, não um menu.
- ❌ **Fórmula "um neutro + um acento + cores semânticas".** Verde de sucesso, amarelo
  de alerta — não existem aqui.
- ❌ **Gradiente, sombra suave, glow, glassmorphism, cantos arredondados, blob
  orgânico, 3D flutuante, emoji como ícone, ilustração "corporate Memphis"** (aquelas
  pessoas roxas desproporcionais).
- ❌ **Clichês de "tech/segurança"**: cadeado, escudo, matrix verde, circuito, cérebro
  com chip, robô, aperto de mão azul corporativo.
- ❌ **Stock genérico**, foto colorida sorridente, mockup de iPhone com sombra.
- ❌ **Copy de IA**: "transformando ideias em realidade", "impulsione seu negócio",
  "soluções sob medida para você", "no mundo digital de hoje", "eleve o seu app".
- ❌ **Centralizar tudo, encher a arte, usar 5 cores, arredondar cantos.**

Se a peça pudesse ser de qualquer software house genérica, ela está errada. Tem que
parecer uma **planta técnica com uma correção em vermelho**.

---

## 9. Referências rápidas de código (fonte da verdade)

- Tokens de cor e tipo: `src/app/globals.css` (bloco `@theme`)
- Conteúdo, preços, copy: `src/content/site.ts`
- Fonte carregada: `src/app/layout.tsx` (Anton, JetBrains Mono, Inter via next/font)
- Processamento de foto P&B: `scripts/fotos.mjs`
- Site no ar: https://thehausdot.vercel.app
