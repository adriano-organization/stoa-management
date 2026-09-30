"use client";

import { useEffect, useLayoutEffect } from "react";
import { CHAVE_DA_ENTRADA, EVENTO_DA_ENTRADA } from "@/lib/movimento/entrada";
import { useMenosMovimento } from "@/lib/movimento/preferencia";

/* As animações da entrada chamam-se todas `intro-…` (`inicio.css`). */
const DA_ENTRADA = /^intro-/;

/* Sem a fotografia a tempo (rede lenta, erro), o herói aparece como sempre. */
const LIMITE_MS = 6000;

/* Os gestos de quem quer seguir. Não o `scroll`: numa navegação interna o
   próprio Next rola para o topo depois de montar, e acabava logo a entrada. */
const GESTOS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/* Quantas instâncias estão montadas. Em desenvolvimento o React monta,
   desmonta e volta a montar: os atributos só saem se ninguém os reclamar. */
let montadas = 0;

const arrumar = () => {
  document.documentElement.removeAttribute("data-intro");
  document.documentElement.removeAttribute("data-intro-foto");
};

/**
 * # Quem conduz a entrada do herói
 *
 * O desenho é todo CSS (`inicio.css`, "a entrada do herói"); isto só decide
 * e arruma:
 *
 * - **Se há entrada.** Num carregamento, o script do `<head>` já decidiu antes
 *   da primeira pintura (`html[data-intro]`). Numa navegação interna, decide
 *   aqui, antes da pintura: primeira vez na inicial nesta sessão, sem âncora.
 *   Ao voltar de um projeto já se viu — o herói aparece pronto, onde estava.
 *   O logótipo é a exceção: pede a entrada outra vez (`pedirEntrada`), e se
 *   já se está na inicial recomeça-a aqui (`EVENTO_DA_ENTRADA`).
 * - **A fotografia manda.** O desenho corre logo; o resto (a obra, o
 *   contexto, a marca, o texto) espera por `data-intro-foto`, que só chega
 *   com a imagem descodificada. Se não chegar a tempo, acaba-se.
 * - **Ninguém espera.** A roda, um toque, uma tecla ou um clique acabam a
 *   entrada: as mesmas animações correm 8× mais depressa até ao fim, sem
 *   salto. O título e os botões estão `visibility: hidden` enquanto não se
 *   veem — sem foco nem cliques invisíveis.
 * - **No fim** tira os atributos; as camadas da entrada desaparecem e o que
 *   fica é exatamente o herói de sempre.
 */
export function EntradaDoHeroi() {
  const menosMovimento = useMenosMovimento();

  useLayoutEffect(() => {
    const raiz = document.documentElement;
    const palco = document.querySelector<HTMLElement>(".heroi__palco[data-com-foto]");
    montadas += 1;

    let vista = false;
    try {
      vista = sessionStorage.getItem(CHAVE_DA_ENTRADA) !== null;
    } catch {}
    if (!raiz.hasAttribute("data-intro") && palco && !vista && raiz.hasAttribute("data-movimento") && !window.location.hash) {
      raiz.setAttribute("data-intro", "");
    }

    /* Cada começo é uma geração: o que uma entrada anterior (cancelada pelo
       logótipo) ainda tenha pendente já não mexe na nova. */
    let geracao = 0;
    let ativa = false;
    let limite = 0;

    const animacoes = () =>
      document
        .getAnimations()
        .filter((a): a is CSSAnimation => a instanceof CSSAnimation && DA_ENTRADA.test(a.animationName));

    const parar = () => {
      ativa = false;
      window.clearTimeout(limite);
      GESTOS.forEach((g) => window.removeEventListener(g, acelerar, true));
    };

    const acabar = (g: number) => {
      if (g !== geracao || !ativa) return;
      parar();
      arrumar();
    };

    /* Acaba depressa mas pelo mesmo caminho; sem a fotografia não há o que
       mostrar, e acaba já. */
    function acelerar() {
      if (!ativa) return;
      if (!raiz.hasAttribute("data-intro-foto")) return acabar(geracao);
      animacoes().forEach((a) => a.updatePlaybackRate(8));
    }

    const iniciar = () => {
      const g = ++geracao;
      ativa = true;
      try {
        sessionStorage.setItem(CHAVE_DA_ENTRADA, "1");
      } catch {}

      limite = window.setTimeout(() => {
        if (!raiz.hasAttribute("data-intro-foto")) acabar(g);
      }, LIMITE_MS);
      GESTOS.forEach((gesto) => window.addEventListener(gesto, acelerar, { capture: true, passive: true }));

      /* `load`, e não `decode()`: num separador em segundo plano o browser adia
         a descodificação até ele se ver, e a entrada acabava pelo limite. A
         imagem principal já pede `decoding="sync"`. */
      const imagem = palco?.querySelector<HTMLImageElement>(".heroi__foto img");
      new Promise<void>((resolver, recusar) => {
        if (!imagem) return recusar(new Error("sem fotografia"));
        if (imagem.complete) return imagem.naturalWidth > 0 ? resolver() : recusar(new Error("falhou"));
        imagem.addEventListener("load", () => resolver(), { once: true });
        imagem.addEventListener("error", () => recusar(new Error("falhou")), { once: true });
      })
        .then(() => {
          if (g !== geracao || !ativa) return;
          raiz.setAttribute("data-intro-foto", "");
          return Promise.all(animacoes().map((a) => a.finished));
        })
        .then(
          () => acabar(g),
          () => acabar(g),
        );
    };

    if (!palco) arrumar();
    else if (raiz.hasAttribute("data-intro")) iniciar();

    /* O logótipo, já na inicial: não há página nova a montar, por isso a
       entrada recomeça aqui. Tirar e voltar a pôr o atributo no mesmo instante
       não recomeçava as animações — o browser tem de ver a entrada sair. */
    const aoPedir = () => {
      if (!palco || !raiz.hasAttribute("data-movimento")) return;
      parar();
      arrumar();
      raiz.getBoundingClientRect();
      raiz.setAttribute("data-intro", "");
      iniciar();
    };
    window.addEventListener(EVENTO_DA_ENTRADA, aoPedir);

    return () => {
      montadas -= 1;
      const estavaAtiva = ativa;
      parar();
      geracao += 1;
      window.removeEventListener(EVENTO_DA_ENTRADA, aoPedir);
      /* Saiu-se da inicial a meio: arruma, a menos que outra instância (o
         remontar do modo estrito) já a tenha retomado. */
      if (estavaAtiva) window.setTimeout(() => montadas === 0 && arrumar(), 0);
    };
  }, []);

  /* Menos movimento pedido a meio: o estado final, já. */
  useEffect(() => {
    if (menosMovimento) arrumar();
  }, [menosMovimento]);

  return null;
}
