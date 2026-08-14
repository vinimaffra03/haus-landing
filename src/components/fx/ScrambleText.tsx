"use client";

import { useEffect, useRef, useState } from "react";

/*
  Scramble Text — no espírito de https://www.reactbits.dev/text-animations/scramble-text

  Aqui o efeito não é enfeite: o texto embaralhado que se resolve é literalmente
  o que a haus. vende — código quebrado virando código que funciona.

  Acessibilidade: o texto final fica no DOM desde o início para leitor de tela;
  só a camada visual embaralha.
*/

type Props = {
  text: string;
  /** Duração total em ms. */
  duration?: number;
  /** Atraso antes de começar. */
  delay?: number;
  className?: string;
  as?: "span" | "div";
};

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\{}[]=+-*$#@!%&";

export default function ScrambleText({
  text,
  duration = 900,
  delay = 0,
  className = "",
  as: Tag = "span",
}: Props) {
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timeout = 0;

    const run = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        // Revela da esquerda para a direita, com easing.
        const settled = Math.floor(text.length * (1 - Math.pow(1 - p, 3)));

        let out = "";
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (i < settled || c === " " || c === "\n") out += c;
          else out += CHARS[(Math.random() * CHARS.length) | 0];
        }
        setDisplay(out);

        if (p < 1) raf = requestAnimationFrame(tick);
        else setDisplay(text);
      };

      raf = requestAnimationFrame(tick);
    };

    timeout = window.setTimeout(run, delay);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [text, duration, delay]);

  return (
    <Tag className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
