"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
  TEMPO_DE_SAIDA_MS,
  TEMPO_MAXIMO_MS,
  TEMPO_MINIMO_MS,
  deveCobrir,
} from "@/lib/movimento/cortina";
import { FolhaDaMarca } from "./FolhaDaMarca";

/**
 * # A cortina entre páginas
 *
 * Ao clicar num link do site, uma cortina tapa a página e uma linha desenha a
 * folha e o nome. Sai quando a página nova já está montada (o caminho mudou)
 * **e** o desenho acabou — ou, se a página nova nunca chegar, ao fim de
 * `TEMPO_MAXIMO_MS`. A regra de quando há cortina está em
 * `lib/movimento/cortina.ts`.
 *
 * O estado vive no `<html>` (`data-cortina="entrar" | "sair"`) e o CSS faz o
 * resto (`site.css`); a construção do herói espera por ele (`inicio.css`).
 * Os botões "anterior"/"seguinte" do browser não passam por aqui — não há
 * clique — e ficam com o fade das View Transitions.
 *
 * O pedido em curso vive **fora do componente**: mudar de língua troca o
 * layout `[locale]` inteiro — este componente desmonta-se a meio do desenho,
 * e o React limpa do `<html>` os atributos que não são dele (`data-cortina`
 * incluído). O novo encontra o pedido, repõe a cortina e tira-a quando for a
 * hora.
 */
let pedido: { inicio: number; caminho: string } | null = null;

export function CortinaDeNavegacao({ comFolha }: { comFolha: boolean }) {
  const caminho = usePathname();
  const caminhoAtual = useRef(caminho);
  const relogios = useRef<number[]>([]);
  /* O `sair` nasce no primeiro efeito (precisa do `<html>`) e o segundo efeito
     chama-o quando o caminho muda. */
  const sairRef = useRef<() => void>(() => {});

  /* `useLayoutEffect`: a reposição depois de mudar de língua tem de acontecer
     antes da pintura, senão a página nova aparece um instante sem cortina. */
  useLayoutEffect(() => {
    const raiz = document.documentElement;

    const limpar = () => {
      relogios.current.forEach((id) => window.clearTimeout(id));
      relogios.current = [];
    };

    const sair = () => {
      limpar();
      pedido = null;
      raiz.setAttribute("data-cortina", "sair");
      /* O desconto de tempo só sai no fim: tirá-lo a meio mudava os atrasos e
         as últimas riscas apagavam-se enquanto a cortina sobe. */
      relogios.current.push(
        window.setTimeout(() => {
          raiz.removeAttribute("data-cortina");
          raiz.style.removeProperty("--cortina-decorrido");
        }, TEMPO_DE_SAIDA_MS),
      );
    };

    const aoClicar = (evento: MouseEvent) => {
      const ancora = (evento.target as Element | null)?.closest?.("a[href]");
      if (!(ancora instanceof HTMLAnchorElement)) return;
      const cobre = deveCobrir(
        {
          botao: evento.button,
          modificador: evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey,
          prevenido: evento.defaultPrevented,
        },
        {
          href: ancora.getAttribute("href") ?? "",
          target: ancora.getAttribute("target"),
          download: ancora.hasAttribute("download"),
          semCortina: ancora.closest("[data-sem-cortina]") !== null,
        },
        { href: window.location.href, movimento: raiz.hasAttribute("data-movimento") },
      );
      if (!cobre) return;

      limpar();
      pedido = { inicio: performance.now(), caminho: caminhoAtual.current };
      raiz.setAttribute("data-cortina", "entrar");
      relogios.current.push(window.setTimeout(sair, TEMPO_MAXIMO_MS));
    };

    /* Na fase de captura, antes do `Link` do Next: se ele depois cancelar a
       navegação, o limite de segurança tira a cortina. */
    document.addEventListener("click", aoClicar, true);
    sairRef.current = sair;

    /* Um pedido que vem do componente anterior: a cortina nova é outro
       elemento e as animações recomeçariam do zero (a cortina subia outra vez,
       a folha redesenhava-se). O tempo já decorrido desconta-se nos atrasos
       (`site.css`), e o limite de segurança conta desde o clique. */
    if (pedido) {
      const decorrido = performance.now() - pedido.inicio;
      raiz.style.setProperty("--cortina-decorrido", `${Math.round(decorrido)}ms`);
      raiz.setAttribute("data-cortina", "entrar");
      relogios.current.push(window.setTimeout(sair, Math.max(0, TEMPO_MAXIMO_MS - decorrido)));
    }

    return () => {
      document.removeEventListener("click", aoClicar, true);
      limpar();
      /* Com um pedido em curso, a cortina fica: o próximo componente tira-a. */
      if (!pedido) raiz.removeAttribute("data-cortina");
    };
  }, []);

  /* A página nova chegou: sai quando o desenho tiver tido o seu tempo. */
  useEffect(() => {
    caminhoAtual.current = caminho;
    const atual = pedido;
    if (!atual || atual.caminho === caminho) return;
    const falta = Math.max(0, TEMPO_MINIMO_MS - (performance.now() - atual.inicio));
    const id = window.setTimeout(() => sairRef.current(), falta);
    relogios.current.push(id);
  }, [caminho]);

  return (
    <div className="cortina" aria-hidden="true">
      <FolhaDaMarca comFolha={comFolha} />
    </div>
  );
}
