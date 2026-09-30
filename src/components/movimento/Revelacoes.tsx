"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Revela, uma vez, cada elemento com `data-revelar` quando entra no ecrã.
 *
 * Um só observador para a página inteira, montado no layout, em vez de um
 * componente cliente à volta de cada parágrafo: as secções continuam a ser
 * componentes de servidor e só levam o atributo. Volta a procurar a cada
 * mudança de página, e vigia o que for acrescentado depois (um componente
 * cliente que monta mais tarde).
 *
 * O estado escondido só existe com `data-movimento` no `<html>` (ver
 * `globals.css`): sem JavaScript, ou com menos movimento pedido, não há nada
 * a revelar — o conteúdo já lá está.
 */
export function Revelacoes() {
  const caminho = usePathname();

  useEffect(() => {
    const raiz = document.documentElement;
    const revelar = (el: Element) => el.setAttribute("data-visivel", "");

    if (!raiz.hasAttribute("data-movimento")) {
      document.querySelectorAll("[data-revelar]").forEach(revelar);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          revelar(entrada.target);
          observador.unobserve(entrada.target);
        }
      },
      /* Um pouco antes de chegar ao fundo do ecrã, para a entrada acabar
         enquanto ainda está à vista, e não depois. */
      { rootMargin: "0px 0px -8% 0px" },
    );

    const vigiar = (raizDaBusca: ParentNode) =>
      raizDaBusca.querySelectorAll("[data-revelar]:not([data-visivel])").forEach((el) => observador.observe(el));

    vigiar(document);

    const mutacoes = new MutationObserver((lista) => {
      for (const m of lista) {
        m.addedNodes.forEach((no) => {
          if (!(no instanceof Element)) return;
          if (no.matches("[data-revelar]:not([data-visivel])")) observador.observe(no);
          vigiar(no);
        });
      }
    });
    mutacoes.observe(document.body, { childList: true, subtree: true });

    return () => {
      observador.disconnect();
      mutacoes.disconnect();
    };
  }, [caminho]);

  return null;
}
