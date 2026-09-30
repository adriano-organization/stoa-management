"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useProgresso, type ModoDeProgresso } from "@/lib/movimento/progresso";

type Etiqueta = "section" | "div" | "article" | "footer" | "header" | "li" | "figure";

/**
 * Um elemento que recebe `--p` do motor de movimento (ou `--entrada` e
 * `--coberto`, se se pedirem as duas medidas). O conteúdo continua a ser
 * renderizado no servidor: este componente só acrescenta a medida.
 */
export function ComProgresso({
  as: Etiqueta = "div",
  modo,
  modoExtra,
  limiar,
  className,
  style,
  id,
  children,
  ...atributos
}: {
  as?: Etiqueta;
  modo: ModoDeProgresso;
  /* Uma segunda medida, escrita noutra variável (`--<modo>`). */
  modoExtra?: ModoDeProgresso;
  /* A partir deste valor da medida principal, o elemento leva `data-passou`. */
  limiar?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  "data-sob-cabecalho"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useProgresso(ref, modo, modoExtra ? `--${modo}` : "--p", true, limiar);
  useProgresso(ref, modoExtra ?? modo, `--${modoExtra}`, modoExtra !== undefined);

  return (
    <Etiqueta
      ref={ref as React.RefObject<never>}
      className={className}
      style={style}
      id={id}
      {...atributos}
    >
      {children}
    </Etiqueta>
  );
}
