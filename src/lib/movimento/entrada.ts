/**
 * Marca, na sessão, que a entrada do herói já se viu. Lida pelo script do
 * `<head>` (antes da primeira pintura) e gravada por `EntradaDoHeroi.tsx`.
 * Vive aqui, e não no componente, porque o layout é do servidor: importada de
 * um módulo `"use client"`, chegava-lhe uma referência de cliente, não o texto.
 */
export const CHAVE_DA_ENTRADA = "stoa-entrada";

/**
 * O script do `<head>`, antes da primeira pintura: `data-movimento` a quem não
 * pediu menos movimento, e a decisão da entrada do herói (`data-intro`) — só
 * numa das `inicios`, sem âncora, na primeira vez da sessão. Se o React não
 * chegar a arrancar, ao fim de 6 s sem fotografia a entrada sai sozinha e fica
 * o herói de sempre. Texto fixo, sem dados de fora (ver `lib/cabecalhos.ts`).
 *
 * ⚠️ É um template literal que vira código: uma barra da expressão regular
 * precisa de duas aqui (`\\/`), senão sai `//` — um comentário que apaga o
 * resto do script (`testes/entrada.test.mjs` corre-o).
 */
export function scriptDeArranque(inicios: string[]): string {
  return `try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches){var h=document.documentElement;h.setAttribute("data-movimento","");if(${JSON.stringify(inicios)}.indexOf(location.pathname.replace(/\\/$/,""))>-1&&!location.hash&&!sessionStorage.getItem("${CHAVE_DA_ENTRADA}")){h.setAttribute("data-intro","");setTimeout(function(){if(!h.hasAttribute("data-intro-foto"))h.removeAttribute("data-intro")},6000)}}}catch(e){}`;
}
