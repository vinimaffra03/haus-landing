"use client";

import { useEffect, useRef, useState } from "react";

/*
  Contagem que dispara ao entrar na viewport.
  Usado nos números de prova — 90% / 75% / 45%.
*/

type Props = {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

export default function CountUp({
  to,
  suffix = "",
  duration = 1100,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sem animação possível, o número vai direto ao valor final.
    // Agendado em vez de síncrono: setState no corpo do efeito encadeia renders.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      const t = window.setTimeout(() => setValue(to), 0);
      return () => clearTimeout(t);
    }

    let raf = 0;

    const animate = () => {
      if (done.current) return;
      done.current = true;

      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        // easeOutExpo — chega rápido e assenta
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setValue(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) animate();
      },
      { threshold: 0.4 },
    );

    io.observe(el);

    // Se o observer nunca entregar, o número precisa existir de qualquer jeito.
    const failsafe = window.setTimeout(() => {
      if (!done.current) {
        done.current = true;
        setValue(to);
      }
    }, 1500);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
