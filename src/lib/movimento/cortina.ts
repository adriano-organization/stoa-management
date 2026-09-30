/**
 * # Quando é que a troca de página passa pela cortina
 *
 * A cortina tapa a página e só sai quando o caminho muda. Por isso só pode
 * cobrir uma navegação que vai mesmo acontecer **nesta aba** e **para outra
 * página do site** — senão fica a tapar uma página que não mudou até ao
 * limite de segurança. Os projetos ficam de fora (`data-sem-cortina`): o
 * cartão já tem o morph da fotografia, e a cortina escondia-o.
 *
 * É uma função pura para se poder testar sem browser; quem lê o evento e o
 * `<a>` é `CortinaDeNavegacao.tsx`.
 */
export type Clique = { botao: number; modificador: boolean; prevenido: boolean };
export type Ligacao = { href: string; target: string | null; download: boolean; semCortina: boolean };
export type Local = { href: string; movimento: boolean };

/** O desenho da folha e do nome leva isto; a cortina não sai antes. */
export const TEMPO_MINIMO_MS = 850;
/** O que a cortina leva a sair (tem de bater com `cortina-sai` em `site.css`). */
export const TEMPO_DE_SAIDA_MS = 300;
/** Se a página nova não chegar, a cortina sai na mesma: nunca fica presa. */
export const TEMPO_MAXIMO_MS = 5000;

export function deveCobrir(clique: Clique, ligacao: Ligacao, local: Local): boolean {
  if (!local.movimento) return false;
  if (clique.botao !== 0 || clique.modificador || clique.prevenido) return false;
  if (ligacao.semCortina || ligacao.download) return false;
  if (ligacao.target && ligacao.target !== "_self") return false;

  let destino: URL;
  let atual: URL;
  try {
    atual = new URL(local.href);
    destino = new URL(ligacao.href, atual);
  } catch {
    return false;
  }

  if (destino.origin !== atual.origin) return false;
  return destino.pathname !== atual.pathname;
}
