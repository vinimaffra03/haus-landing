import Image from "next/image";

/*
  Rosto de sócio. Usado na seção "quem faz" da home e na assinatura da /scan.

  As iniciais ficam SEMPRE renderizadas atrás da foto. Se `photo` estiver vazia
  (fotos ainda não processadas) ou o arquivo sumir, a seção continua inteira em
  vez de abrir um buraco — mesma regra de falhar aberto que vale para as
  animações do ReactBits.

  ⚠️ Não passe `size` acima de 96. O original do De Lazzari tem ~299px de
  largura; a 96px numa tela 2x isso dá 192px e ainda fica nítido. Acima disso
  borra, e foto borrada de sócio converte pior que inicial limpa.
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
        <Image
          src={person.photo}
          alt={person.name}
          width={size * 2}
          height={size * 2}
          sizes={`${size}px`}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </div>
  );
}
