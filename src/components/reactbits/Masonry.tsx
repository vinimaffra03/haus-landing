"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./Masonry.module.css";

/*
  Masonry do ReactBits, adaptado.

  O que mudou em relação ao original, e por quê:

  1. FALHA ABERTO. O original define opacity:0 e só revela via GSAP — se o
     script não carregar, a seção some. Aqui o estado inicial é um grid CSS
     visível, e o masonry só assume depois que mede e anima.
  2. prefers-reduced-motion. O original não trata; aqui, com movimento
     reduzido, nada anima e o grid permanece.
  3. Sem preload bloqueante de todas as imagens. O original espera as seis
     carregarem antes de mostrar qualquer coisa, o que atrasa a seção inteira.
     Aqui o layout usa a altura declarada em site.ts, então posiciona sem
     esperar download nenhum.
  4. CSS Module, raio zero, sem sombra.
*/

export type MasonryItem = {
  id: string;
  img: string;
  url: string;
  /** Altura real da imagem — dispensa esperar o download para medir. */
  height: number;
  title: string;
  kind: string;
  author: string;
};

type Caixa = MasonryItem & { x: number; y: number; w: number; h: number };

function useColunas() {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const consultas: [MediaQueryList, number][] = [
      [matchMedia("(min-width: 1100px)"), 3],
      [matchMedia("(min-width: 640px)"), 2],
    ];

    const calcular = () => {
      const achou = consultas.find(([mq]) => mq.matches);
      setCols(achou ? achou[1] : 1);
    };

    calcular();
    consultas.forEach(([mq]) => mq.addEventListener("change", calcular));
    return () => consultas.forEach(([mq]) => mq.removeEventListener("change", calcular));
  }, []);

  return cols;
}

export default function Masonry({ items }: { items: MasonryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);
  const jaAnimou = useRef(false);
  const colunas = useColunas();

  // Mede o container. Sem largura não há layout — e sem layout fica o grid.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(([entry]) => setLargura(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const grade = useMemo<Caixa[]>(() => {
    if (!largura) return [];

    const alturas = new Array(colunas).fill(0);
    const larguraCol = largura / colunas;

    return items.map((item) => {
      const col = alturas.indexOf(Math.min(...alturas));
      // Proporção real da imagem, na largura da coluna.
      const h = (item.height / 900) * larguraCol;
      const caixa = { ...item, x: larguraCol * col, y: alturas[col], w: larguraCol, h };
      alturas[col] += h;
      return caixa;
    });
  }, [items, colunas, largura]);

  const alturaTotal = useMemo(() => {
    if (!grade.length) return 0;
    return Math.max(...grade.map((c) => c.y + c.h));
  }, [grade]);

  /*
    Derivado, não estado. Enquanto não há largura medida não há grade, e sem
    grade o componente fica no grid CSS de fallback — que é o estado visível
    e seguro. Guardar isso em useState só criaria render em cascata.
  */
  const ativo = grade.length > 0;

  useLayoutEffect(() => {
    if (!grade.length) return;

    const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const [i, caixa] of grade.entries()) {
      const alvo = `[data-masonry-id="${caixa.id}"]`;
      const posicao = { x: caixa.x, y: caixa.y, width: caixa.w, height: caixa.h };

      if (reduzido || jaAnimou.current) {
        gsap.set(alvo, { ...posicao, opacity: 1, filter: "none" });
        continue;
      }

      gsap.fromTo(
        alvo,
        { ...posicao, opacity: 0, y: caixa.y + 60, filter: "blur(8px)" },
        {
          ...posicao,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.06,
        },
      );
    }

    jaAnimou.current = true;
  }, [grade]);

  return (
    <div
      ref={ref}
      className={ativo ? styles.list : `${styles.list} ${styles.fallback}`}
      style={ativo && alturaTotal ? { height: alturaTotal } : undefined}
    >
      {items.map((item) => (
        <div key={item.id} data-masonry-id={item.id} className={styles.item}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${item.title}`}
            className={styles.img}
            style={{ backgroundImage: `url(${item.img})`, display: "block" }}
          >
            <span className={styles.author}>{item.author}</span>
            <span className={styles.meta}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.kind}>{item.kind} · ver no ar ↗</span>
            </span>
          </a>
        </div>
      ))}
    </div>
  );
}
