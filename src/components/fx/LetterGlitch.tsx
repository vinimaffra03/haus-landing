"use client";

import { useEffect, useRef } from "react";

/*
  Letter Glitch — no espírito do componente do ReactBits, reescrito para a
  paleta da haus. e com orçamento de performance apertado.

  Roda em canvas (não WebGL), pausa fora da viewport e respeita
  prefers-reduced-motion. A escolha é deliberada: a conversão vem do celular,
  e fundo WebGL derruba o LCP.

  O dimensionamento vem do contentRect do ResizeObserver — que a spec garante
  disparar uma vez no observe(). Medir por conta própria em rAF é frágil:
  o layout pode não ter assentado, e aí o canvas fica no default 300x150.

  Trocar pelo oficial: https://reactbits.dev/backgrounds/letter-glitch
*/

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\{}[]=+-*$#@!%&_;:";

type Props = {
  /** Lado da célula em px. Maior = menos caracteres = mais barato. */
  cell?: number;
  /** Intervalo entre quadros em ms. */
  interval?: number;
  /** Fração das células que recebem a cor de acento. */
  accentRatio?: number;
  className?: string;
};

export default function LetterGlitch({
  cell = 16,
  interval = 110,
  accentRatio = 0.06,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cols = 0;
    let rows = 0;
    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    function size(width: number, height: number) {
      if (!canvas || !ctx || width < 1 || height < 1) return;

      cssW = width;
      cssH = height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cell - 3}px ui-monospace, Consolas, monospace`;
      ctx.textBaseline = "top";
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
    }

    function paint() {
      if (!ctx || !cols || !rows) return;
      ctx.clearRect(0, 0, cssW, cssH);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ch = CHARS[(Math.random() * CHARS.length) | 0];
          ctx.fillStyle =
            Math.random() < accentRatio
              ? "rgba(211, 61, 0, 0.55)"
              : `rgba(245, 245, 245, ${0.04 + Math.random() * 0.05})`;
          ctx.fillText(ch, x * cell, y * cell);
        }
      }
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < interval) return;
      last = now;
      paint();
    }

    function measure() {
      const box = parent!.getBoundingClientRect();
      size(box.width, box.height);
      paint();
    }

    // Caminho principal: o observer entrega o tamanho correto já na primeira
    // chamada. Mas ele depende do pipeline de compositing — em aba oculta ou
    // ambiente headless ele simplesmente não dispara, e aí o canvas ficaria
    // no default 300x150. Por isso há medição direta e listener de resize.
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(([entry]) => {
        const box = entry.contentRect;
        size(box.width, box.height);
        paint();
      });
      ro.observe(parent);
    }

    const first = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      io.observe(canvas);
    }

    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(first);
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [cell, interval, accentRatio]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
