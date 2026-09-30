/**
 * # Aperçu ou publicação
 *
 * O site tem dois modos, e a diferença é **o que se pode afirmar em público**.
 *
 * | | aperçu | publicação |
 * |---|---|---|
 * | projetos `provisorio` | visíveis, com o selo "Provisoire" | fora das listas, do sitemap e do build (404) |
 * | equipa por completar | placeholders identificados | secção escondida |
 * | textos por validar | marcados "à valider" | escritos como estão |
 * | indexação | `noindex` + robots a bloquear tudo | aberta |
 *
 * **Publicação** quando o deploy é o de produção da Vercel, ou quando
 * `STOA_PUBLICATION=1`. **Aperçu** em tudo o resto: `npm run dev`, um build
 * local, as pré-visualizações da Vercel. `STOA_PUBLICATION=0` força o aperçu
 * mesmo em produção — útil para mostrar o site ao cliente no endereço final
 * antes de ele validar os projetos, sem que nada disso seja indexado.
 *
 * ⚠️ Um projeto passa a `validado` quando a STOA confirmar o nome, o local, a
 * missão e o direito de publicar as imagens — não porque o site já parece
 * pronto. Ver `docs/a-confirmer.md`.
 */
export type Modo = "publication" | "apercu";

function modoPedido(): Modo {
  const forcado = process.env.STOA_PUBLICATION?.trim();
  if (forcado === "1") return "publication";
  if (forcado === "0") return "apercu";
  return process.env.VERCEL_ENV === "production" ? "publication" : "apercu";
}

export const MODO: Modo = modoPedido();

export const EM_PUBLICACAO = MODO === "publication";
