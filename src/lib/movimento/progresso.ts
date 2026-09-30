import { useEffect, type RefObject } from "react";

/**
 * # O motor de movimento, inteiro
 *
 * Uma variável CSS por elemento — `--p`, de 0 a 1 — escrita a partir da
 * posição de rolagem. O CSS decide o que ela move (só `transform`, `opacity`
 * e `clip-path`). Nada de bibliotecas, nada de rolagem sequestrada: a página
 * rola como o browser quer, e isto só lê onde as coisas estão.
 *
 * ## Porque não o motor do scrollcraft da base
 *
 * Esse motor regista listeners globais e um `requestAnimationFrame` perpétuo
 * no `mount()`, e não tem forma de os desligar. Numa página só (o caso para
 * que foi escrito) não importa. Aqui há quatro tipos de rota com navegação no
 * cliente, e cada regresso a uma página montava mais uma instância a correr
 * sobre elementos que já não existem. Este módulo liga-se quando o primeiro
 * elemento se regista e desliga-se quando o último sai.
 *
 * ## Os modos
 *
 * | modo | 0 quando… | 1 quando… |
 * |---|---|---|
 * | `preso` | o topo da secção chega ao topo do ecrã | o fundo da secção chega ao fundo do ecrã (o palco `sticky` solta-se) |
 * | `fluxo` | o topo do elemento entra por baixo | o fundo do elemento sai por cima |
 * | `entrada` | o topo do elemento entra por baixo | o topo do elemento chega ao topo do ecrã |
 * | `revelado` | o topo do elemento entra por baixo | o elemento está inteiro no ecrã (serve o fim da página, onde nada chega ao topo) |
 * | `coberto` | o irmão seguinte ainda está abaixo do ecrã | o irmão seguinte chegou ao topo (este ficou tapado) |
 *
 * ## Menos movimento
 *
 * Com `prefers-reduced-motion: reduce` nada se regista e a variável nunca é
 * escrita: o CSS usa o valor de repouso (`var(--p, 0)` ou o que cada regra
 * disser). O mesmo acontece sem JavaScript.
 */
export type ModoDeProgresso = "preso" | "fluxo" | "entrada" | "revelado" | "coberto";

type Registo = {
  el: HTMLElement;
  modo: ModoDeProgresso;
  variavel: string;
  ultimo: number;
};

const registos = new Set<Registo>();
let pedido = 0;
let ligado = false;

const limitar = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

function progresso(r: Registo, altura: number): number {
  const caixa = r.el.getBoundingClientRect();
  switch (r.modo) {
    case "preso": {
      const curso = caixa.height - altura;
      return curso > 0 ? limitar(-caixa.top / curso) : 0;
    }
    case "fluxo":
      return limitar((altura - caixa.top) / (caixa.height + altura));
    case "entrada":
      return limitar(1 - caixa.top / altura);
    case "revelado":
      return caixa.height > 0 ? limitar((altura - caixa.top) / caixa.height) : 1;
    case "coberto": {
      const seguinte = r.el.nextElementSibling;
      if (!seguinte) return 0;
      return limitar(1 - seguinte.getBoundingClientRect().top / altura);
    }
  }
}

function medir() {
  pedido = 0;
  const altura = window.innerHeight;
  for (const r of registos) {
    const p = progresso(r, altura);
    /* Só se escreve quando muda: cada escrita invalida o estilo do elemento. */
    if (Math.abs(p - r.ultimo) > 0.0005) {
      r.el.style.setProperty(r.variavel, p.toFixed(4));
      r.ultimo = p;
    }
  }
}

function agendar() {
  if (!pedido) pedido = requestAnimationFrame(medir);
}

function ligar() {
  if (ligado) return;
  ligado = true;
  window.addEventListener("scroll", agendar, { passive: true });
  window.addEventListener("resize", agendar, { passive: true });
}

function desligarSeVazio() {
  if (!ligado || registos.size > 0) return;
  ligado = false;
  window.removeEventListener("scroll", agendar);
  window.removeEventListener("resize", agendar);
  if (pedido) cancelAnimationFrame(pedido);
  pedido = 0;
}

export const querMenosMovimento = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Liga um elemento ao motor. `variavel` permite mais do que uma medida no
 * mesmo elemento (ex.: `--entrada` e `--coberto` num cartão da pilha).
 */
export function useProgresso(
  ref: RefObject<HTMLElement | null>,
  modo: ModoDeProgresso,
  variavel = "--p",
  /* Os hooks não podem ser condicionais; um componente que só às vezes quer
     uma segunda medida passa `false` aqui. */
  ativo = true,
) {
  useEffect(() => {
    const el = ref.current;
    if (!ativo || !el || querMenosMovimento()) return;

    const registo: Registo = { el, modo, variavel, ultimo: -1 };
    registos.add(registo);
    ligar();
    agendar();

    return () => {
      registos.delete(registo);
      el.style.removeProperty(variavel);
      desligarSeVazio();
    };
  }, [ref, modo, variavel, ativo]);
}
