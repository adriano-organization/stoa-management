"use client";

import { useRef, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import { useProgresso } from "@/lib/movimento/progresso";

/**
 * A secção do trilho do portefólio: recebe `--p` (modo `preso`) e o CSS
 * desloca a fila de cartões para o lado enquanto a página desce.
 *
 * O que o CSS não resolve é o teclado. A fila anda por `translate`, e o
 * browser, ao dar o foco a um cartão que está fora do ecrã, não tem nada que
 * possa rolar para o mostrar: o foco ficava num link invisível. Aqui, quando
 * um cartão recebe o foco com o trilho preso, a página rola até à posição em
 * que ele fica à vista — a mesma a que se chegaria a rolar com a roda.
 *
 * Sem trilho (telemóvel, menos movimento, sem JavaScript) é uma lista vertical
 * e o browser trata do foco como sempre.
 */
export function Trilho({
  className,
  style,
  children,
  "aria-labelledby": rotulo,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-labelledby"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useProgresso(ref, "preso");

  function aoFocar(evento: FocusEvent<HTMLElement>) {
    const seccao = ref.current;
    const palco = seccao?.querySelector<HTMLElement>(".trilho__palco");
    const fila = seccao?.querySelector<HTMLElement>(".trilho__fila");
    const cartao = (evento.target as HTMLElement).closest<HTMLElement>(".trilho__cartao");
    if (!seccao || !palco || !fila || !cartao) return;
    if (getComputedStyle(palco).position !== "sticky") return;

    const largura = palco.clientWidth;
    const percurso = fila.scrollWidth - largura;
    const curso = seccao.offsetHeight - window.innerHeight;
    if (percurso <= 0 || curso <= 0) return;

    /* O cartão ao centro do ecrã, dentro do que o trilho consegue andar. */
    const alvo = cartao.offsetLeft + cartao.offsetWidth / 2 - largura / 2;
    const p = Math.min(1, Math.max(0, alvo / percurso));
    const topo = seccao.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: topo + p * curso, behavior: "instant" });
  }

  return (
    <section
      ref={ref}
      className={className}
      style={style}
      aria-labelledby={rotulo}
      /* O palco é carvão: o cabeçalho fica transparente e claro por cima,
         como sobre a abertura, em vez de uma faixa de calcário. */
      data-sob-cabecalho=""
      onFocus={aoFocar}
    >
      {children}
    </section>
  );
}
