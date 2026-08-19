"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./StaggeredMenu.module.css";

/*
  StaggeredMenu do ReactBits, adaptado.

  Diferenças em relação ao original:
  - Restilizado aos tokens da haus: painel preto, raio zero, acento #D33D00.
  - CSS Module — o original usa classes globais como `.sm-toggle` e `.menu`.
  - Respeita prefers-reduced-motion: sem movimento, o painel só aparece.
  - Fecha com Escape e trava o scroll do body enquanto aberto. O original não
    faz nenhum dos dois, e sem isso a página rola atrás do painel aberto.
  - Sem logo por imagem: a haus. usa wordmark tipográfico.

  ⚠️ Só vai na home. A /scan é landing de tráfego pago e precisa de zero saídas
  além da CTA — menu ali derruba justamente a conversão que está sendo paga.
*/

export type MenuItem = { label: string; href: string; ariaLabel?: string };
export type MenuLink = { label: string; href: string };

type Props = {
  items: MenuItem[];
  links?: MenuLink[];
  linksTitle?: string;
};

export default function StaggeredMenu({ items, links = [], linksTitle = "Contato" }: Props) {
  const [aberto, setAberto] = useState(false);
  const [linhas, setLinhas] = useState(["Menu", "Fechar"]);

  const abertoRef = useRef(false);
  const painelRef = useRef<HTMLElement>(null);
  const camadasRef = useRef<HTMLDivElement>(null);
  const iconeRef = useRef<HTMLSpanElement>(null);
  const barraHRef = useRef<HTMLSpanElement>(null);
  const barraVRef = useRef<HTMLSpanElement>(null);
  const textoRef = useRef<HTMLSpanElement>(null);

  const tlAbrirRef = useRef<gsap.core.Timeline | null>(null);
  const ocupadoRef = useRef(false);

  const reduzido = () =>
    typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const painel = painelRef.current;
      if (!painel) return;

      const camadas = camadasRef.current
        ? Array.from(camadasRef.current.querySelectorAll("[data-camada]"))
        : [];

      gsap.set([painel, ...camadas], { xPercent: 100 });
      gsap.set(barraHRef.current, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(barraVRef.current, { rotate: 90, transformOrigin: "50% 50%" });
      gsap.set(iconeRef.current, { rotate: 0, transformOrigin: "50% 50%" });
    });
    return () => ctx.revert();
  }, []);

  const abrir = useCallback(() => {
    if (ocupadoRef.current) return;
    ocupadoRef.current = true;

    const painel = painelRef.current;
    if (!painel) {
      ocupadoRef.current = false;
      return;
    }

    const camadas = camadasRef.current
      ? Array.from(camadasRef.current.querySelectorAll("[data-camada]"))
      : [];
    const rotulos = Array.from(painel.querySelectorAll("[data-rotulo]"));
    const itens = Array.from(painel.querySelectorAll("[data-item]"));

    tlAbrirRef.current?.kill();

    if (reduzido()) {
      gsap.set([...camadas, painel], { xPercent: 0 });
      gsap.set(rotulos, { yPercent: 0, rotate: 0 });
      gsap.set(itens, { "--num-opacity": 1 });
      ocupadoRef.current = false;
      return;
    }

    gsap.set(rotulos, { yPercent: 140, rotate: 8 });
    gsap.set(itens, { "--num-opacity": 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        ocupadoRef.current = false;
      },
    });

    camadas.forEach((c, i) => {
      tl.fromTo(c, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07);
    });

    const entradaPainel = camadas.length * 0.07;
    tl.fromTo(
      painel,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.6, ease: "power4.out" },
      entradaPainel,
    );
    tl.to(
      rotulos,
      { yPercent: 0, rotate: 0, duration: 0.9, ease: "power4.out", stagger: 0.08 },
      entradaPainel + 0.1,
    );
    tl.to(
      itens,
      { "--num-opacity": 1, duration: 0.5, ease: "power2.out", stagger: 0.07 },
      entradaPainel + 0.2,
    );

    tlAbrirRef.current = tl;
  }, []);

  const fechar = useCallback(() => {
    tlAbrirRef.current?.kill();

    const painel = painelRef.current;
    if (!painel) return;

    const camadas = camadasRef.current
      ? Array.from(camadasRef.current.querySelectorAll("[data-camada]"))
      : [];

    gsap.to([...camadas, painel], {
      xPercent: 100,
      duration: reduzido() ? 0 : 0.3,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        ocupadoRef.current = false;
      },
    });
  }, []);

  const animarBotao = useCallback((abrindo: boolean) => {
    const alvo = abrindo ? "Fechar" : "Menu";

    if (reduzido()) {
      setLinhas([alvo]);
      return;
    }

    gsap.to(iconeRef.current, {
      rotate: abrindo ? 225 : 0,
      duration: abrindo ? 0.7 : 0.35,
      ease: abrindo ? "power4.out" : "power3.inOut",
      overwrite: "auto",
    });

    const seq = [abrindo ? "Menu" : "Fechar", alvo, alvo];
    setLinhas(seq);

    gsap.set(textoRef.current, { yPercent: 0 });
    gsap.to(textoRef.current, {
      yPercent: -((seq.length - 1) / seq.length) * 100,
      duration: 0.55,
      ease: "power4.out",
    });
  }, []);

  const alternar = useCallback(() => {
    const alvo = !abertoRef.current;
    abertoRef.current = alvo;
    setAberto(alvo);
    animarBotao(alvo);
    if (alvo) abrir();
    else fechar();
  }, [abrir, fechar, animarBotao]);

  // Escape fecha, e o body para de rolar atrás do painel.
  useEffect(() => {
    if (!aberto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") alternar();
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto, alternar]);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={aberto}
        aria-controls="menu-haus"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        onClick={alternar}
      >
        <span className={styles.textWrap} aria-hidden="true">
          <span ref={textoRef} className={styles.textInner}>
            {linhas.map((l, i) => (
              <span className={styles.line} key={i}>
                {l}
              </span>
            ))}
          </span>
        </span>
        <span ref={iconeRef} className={styles.icon} aria-hidden="true">
          <span ref={barraHRef} className={styles.iconLine} />
          <span ref={barraVRef} className={styles.iconLine} />
        </span>
      </button>

      <div ref={camadasRef} className={styles.prelayers} aria-hidden="true">
        <div data-camada className={styles.prelayer} style={{ background: "#D33D00" }} />
        <div data-camada className={styles.prelayer} style={{ background: "#303F3C" }} />
      </div>

      <aside id="menu-haus" ref={painelRef} className={styles.panel} aria-hidden={!aberto}>
        <ul className={styles.list}>
          {items.map((it) => (
            <li className={styles.itemWrap} key={it.href}>
              <a
                data-item
                className={styles.item}
                href={it.href}
                aria-label={it.ariaLabel ?? it.label}
                onClick={alternar}
                tabIndex={aberto ? 0 : -1}
              >
                <span data-rotulo className={styles.itemLabel}>
                  {it.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {links.length > 0 && (
          <div className={styles.rodape}>
            <h2 className={styles.rodapeTitulo}>{linksTitle}</h2>
            <ul className={styles.rodapeLista}>
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    className={styles.rodapeLink}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    tabIndex={aberto ? 0 : -1}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
