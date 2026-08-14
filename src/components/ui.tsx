import type { ReactNode } from "react";

/* Primitivas do sistema. Nenhuma usa raio — é regra da direção A. */

export function Section({
  children,
  className = "",
  id,
  invert = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  invert?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden px-6 py-20 sm:px-8 sm:py-24 ${
        invert ? "bg-paper text-ink" : "bg-ink text-paper"
      } ${className}`}
    >
      <div className="relative z-10 mx-auto w-full max-w-(--container-haus)">
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-[10px] tracking-[0.22em] uppercase opacity-50 ${className}`}
    >
      {children}
    </p>
  );
}

export function Display({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "div";
}) {
  return (
    <Tag
      className={`font-display uppercase leading-[0.88] tracking-[0.005em] ${className}`}
    >
      {children}
    </Tag>
  );
}

export function ButtonPrimary({
  children,
  href,
  type,
  className = "",
  ...rest
}: {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  className?: string;
} & Record<string, unknown>) {
  const cls =
    `inline-block bg-accent px-7 py-3.5 font-display text-[15px] uppercase tracking-[0.14em] text-ink ` +
    `transition-opacity hover:opacity-85 disabled:opacity-40 ${className}`;

  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type ?? "button"} className={cls} {...rest}>
      {children}
    </button>
  );
}

export function ButtonGhost({
  children,
  href,
  className = "",
  ...rest
}: {
  children: ReactNode;
  href?: string;
  className?: string;
} & Record<string, unknown>) {
  const cls =
    `inline-block border border-accent px-6 py-3 font-mono text-xs tracking-[0.1em] ` +
    `text-accent transition-colors hover:bg-accent hover:text-ink ${className}`;

  return href ? (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  ) : (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
