import type { IdImagem } from "@/lib/medias";
import { EM_PUBLICACAO } from "@/lib/publicacao";

/**
 * # O que está aprovado fora dos projetos e da equipa
 *
 * Os projetos têm `publicacao` e a equipa tem perfis completos; o resto da
 * página inicial não tinha nada, e o modo de publicação escondia o selo
 * "Provisoire" sem esconder o que ele marcava. Aqui fica o estado de cada
 * conteúdo institucional, e em publicação só sai o que estiver `validado`.
 *
 * ⚠️ Passa a `validado` quando a STOA o aprovar — o texto do método tal como
 * está, o direito de publicar cada imagem **no papel que tem aqui** (a
 * fotografia do herói representa a empresa, não só uma obra). Não porque o
 * projeto de onde a imagem vem já foi validado. Ver `docs/a-confirmer.md`.
 */
export type Estado = "provisorio" | "validado";

export const TEXTOS_INSTITUCIONAIS = {
  /* A proposta editorial dos cinco passos (`messages/fr-CH.json`, `metodo`). */
  metodo: "provisorio",
} as const satisfies Record<string, Estado>;

export const IMAGENS_INSTITUCIONAIS = {
  /* O herói em ecrã deitado, e a imagem de partilha do site que sai dele
     (`partilha-stoa`). É uma fotografia do grupo provisório E. */
  "heroi-immeuble": "provisorio",
  /* O herói em ecrã de pé, e a apresentação no ecrã largo. */
  "facade-panneaux": "provisorio",
  /* A apresentação no telemóvel. */
  "immeuble-j2-village": "provisorio",
  /* As três competências. */
  "plan-annote": "provisorio",
  "bureau-poste": "provisorio",
  "terrain-i-etape3-a": "provisorio",
  /* A página de contacto. */
  "bureau-plateau": "provisorio",
} as const satisfies Partial<Record<IdImagem, Estado>>;

export const MARCAS_INSTITUCIONAIS = {
  /* A folha em linha da transição entre páginas, redesenhada a partir do
     ícone (não há vetor do logótipo). Parecida não é igual: a STOA aprova-a
     ou manda o original. */
  folha: "provisorio",
} as const satisfies Record<string, Estado>;

const publicavel = (estado: Estado) => !EM_PUBLICACAO || estado === "validado";

export const textoPublicavel = (chave: keyof typeof TEXTOS_INSTITUCIONAIS) =>
  publicavel(TEXTOS_INSTITUCIONAIS[chave]);

export const marcaPublicavel = (chave: keyof typeof MARCAS_INSTITUCIONAIS) =>
  publicavel(MARCAS_INSTITUCIONAIS[chave]);

/**
 * Uma imagem que não esteja na lista conta como provisória: trocar a
 * fotografia do herói por outra não a torna aprovada.
 */
export const imagemPublicavel = (id: IdImagem) =>
  publicavel((IMAGENS_INSTITUCIONAIS as Partial<Record<IdImagem, Estado>>)[id] ?? "provisorio");
