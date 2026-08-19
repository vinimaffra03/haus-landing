"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./FlowingMenu.module.css";

/*
  FlowingMenu do ReactBits, adaptado.

  Diferenças em relação ao original:
  - CSS Module. O original usa `.menu`, `.marquee`, `.menu__item` globais —
    nomes genéricos demais para conviver com Tailwind.
  - Cores do sistema: fundo preto, marquee no acento, raio zero.
  - prefers-reduced-motion: o marquee não roda nem aparece. O original anima
    incondicionalmente, inclusive um loop infinito de GSAP.
  - O loop infinito só é criado quando o item entra na viewport, e é morto ao
    sair. O original deixa um `repeat: -1` por item rodando para sempre,
    mesmo fora da tela — desperdício de CPU e bateria no celular.
*/

export type FlowingItem = {
  link: string;
  text: string;
  image: string;
  /** Linha secundária, some no hover junto com o resto. */
  note?: string;
};

export default function FlowingMenu({
  items = [],
  speed = 18,
}: {
  items: FlowingItem[];
  speed?: number;
}) {
  return (
    <div className={styles.wrap}>
      <nav className={styles.menu}>
        {items.map((item, i) => (
          <Item key={item.text + i} {...item} speed={speed} />
        ))}
      </nav>
    </div>
  );
}

function Item({ link, text, image, note, speed }: FlowingItem & { speed: number }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<gsap.core.Tween | null>(null);
  const [repeticoes, setRepeticoes] = useState(4);

  const reduzido = () =>
    typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Quantas cópias cabem na largura da tela, para o loop não deixar buraco.
  useEffect(() => {
    const calcular = () => {
      const parte = innerRef.current?.querySelector("[data-parte]") as HTMLElement | null;
      if (!parte || !parte.offsetWidth) return;
      setRepeticoes(Math.max(4, Math.ceil(window.innerWidth / parte.offsetWidth) + 2));
    };

    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [text, image]);

  // O loop só existe enquanto o item está visível.
  useEffect(() => {
    const el = itemRef.current;
    if (!el || reduzido()) return;

    const iniciar = () => {
      const parte = innerRef.current?.querySelector("[data-parte]") as HTMLElement | null;
      const largura = parte?.offsetWidth ?? 0;
      if (!largura || animRef.current) return;

      animRef.current = gsap.to(innerRef.current, {
        x: -largura,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const parar = () => {
      animRef.current?.kill();
      animRef.current = null;
    };

    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(iniciar, 60);
      return () => {
        clearTimeout(t);
        parar();
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? iniciar() : parar()),
      { threshold: 0 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      parar();
    };
  }, [text, image, repeticoes, speed]);

  /** Detecta se o mouse entrou por cima ou por baixo, para o marquee vir do lado certo. */
  function bordaMaisProxima(e: React.MouseEvent, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const y = e.clientY - r.top;
    return y < r.height / 2 ? "top" : "bottom";
  }

  function onEnter(e: React.MouseEvent) {
    if (!itemRef.current || reduzido()) return;
    const borda = bordaMaisProxima(e, itemRef.current);

    gsap
      .timeline({ defaults: { duration: 0.55, ease: "expo" } })
      .set(marqueeRef.current, { y: borda === "top" ? "-101%" : "101%" }, 0)
      .set(innerRef.current, { y: borda === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, innerRef.current], { y: "0%" }, 0);
  }

  function onLeave(e: React.MouseEvent) {
    if (!itemRef.current || reduzido()) return;
    const borda = bordaMaisProxima(e, itemRef.current);

    gsap
      .timeline({ defaults: { duration: 0.55, ease: "expo" } })
      .to(marqueeRef.current, { y: borda === "top" ? "-101%" : "101%" }, 0)
      .to(innerRef.current, { y: borda === "top" ? "101%" : "-101%" }, 0);
  }

  return (
    <div className={styles.item} ref={itemRef}>
      <a className={styles.link} href={link} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {text}
        {note && <span className={styles.note}>{note}</span>}
      </a>

      <div className={styles.marquee} ref={marqueeRef} aria-hidden="true">
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeInner} ref={innerRef}>
            {Array.from({ length: repeticoes }).map((_, i) => (
              <div data-parte className={styles.part} key={i}>
                <span>{text}</span>
                <div className={styles.partImg} style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
