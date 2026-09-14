/*
  Rosto de sócio. Usado na seção "quem faz" da home e na assinatura da /scan.

  As iniciais ficam SEMPRE renderizadas atrás da foto. Se `photo` estiver vazia
  (fotos ainda não processadas) ou o arquivo sumir, a seção continua inteira em
  vez de abrir um buraco — mesma regra de falhar aberto que vale para as
  animações do ReactBits.

  ── Por que <img> e não next/image ────────────────────────────────────────
  Estas fotos já saem de scripts/fotos.mjs em WebP quadrado de 192px, ~4 KB, no
  tamanho exato de exibição (96px em tela 2x). O otimizador do next/image não
  tem o que otimizar aqui — o WebP já é o formato final e o tamanho é fixo — e
  ainda pedia `/_next/image?...&w=3840` para um avatar de 96px, um round-trip
  inútil. <img> direto serve o arquivo cru (200, image/webp), respeita a CSP
  (img-src 'self') e não depende de rota de otimização. width/height fixos
  evitam layout shift.

  ⚠️ Não passe `size` acima de 96. O original do De Lazzari tem ~299px; a 96px
  numa tela 2x isso dá 192px e ainda fica nítido. Acima disso borra.
*/

type Pessoa = {
  initials: string;
  name: string;
  accent: boolean;
  photo: string;
};

export default function Avatar({
  person,
  size = 56,
  className = "",
}: {
  person: Pessoa;
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden font-mono ${
        person.accent ? "bg-accent text-ink" : "bg-slate text-paper"
      } ${className}`}
    >
      <span style={{ fontSize: Math.round(size * 0.28) }}>{person.initials}</span>

      {person.photo && (
        // eslint-disable-next-line @next/next/no-img-element -- asset fixo pré-otimizado; ver cabeçalho
        <img
          src={person.photo}
          alt={person.name}
          width={size * 2}
          height={size * 2}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
