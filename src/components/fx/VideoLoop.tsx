"use client";

import { useEffect, useRef, useState } from "react";

/*
  Preview em loop para o portfólio.

  Seis vídeos em autoplay numa landing é exatamente o que destrói o LCP no
  celular — que é de onde vem a conversão. Por isso:

  - preload="none": o vídeo só é buscado quando entra na viewport
  - poster leve carrega antes e é o que o usuário vê enquanto rola
  - pausa ao sair da tela, para não gastar CPU e bateria em vídeo invisível
  - prefers-reduced-motion: fica no poster, nunca toca
  - falha aberto: sem IntersectionObserver, mostra o poster em vez de
    disparar seis downloads de uma vez
*/

type Props = {
  src: string;
  poster: string;
  /** Descrição do que o vídeo mostra — some para leitor de tela. */
  label: string;
  className?: string;
};

export default function VideoLoop({ src, poster, label, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          // play() rejeita quando o browser bloqueia autoplay — o poster fica.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      poster={poster}
      src={armed ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
