"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
  Revelação simples na entrada da viewport. O CSS vive em globals.css
  para que o estado inicial não pisque antes do JS hidratar.
*/

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.dataset.shown = "true";
    };

    // Falha aberto: sem IntersectionObserver, mostra na hora.
    // Conteúdo escondido atrás de um observer é conteúdo que pode nunca aparecer.
    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    io.observe(el);

    // Rede de segurança: se o observer não entregar nada (ambiente sem
    // compositing, aba em background na hidratação), revela mesmo assim.
    const failsafe = window.setTimeout(show, 1200);

    return () => {
      io.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
