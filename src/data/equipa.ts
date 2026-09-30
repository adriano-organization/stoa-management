import { EM_PUBLICACAO } from "@/lib/publicacao";
import type { IdImagem } from "@/lib/medias";

/**
 * # A equipa
 *
 * Três perfis, **todos por preencher**. As fotografias e as informações vêm
 * da STOA; até lá, nada de nomes, funções, biografias ou retratos inventados,
 * e nada de fotografias de banco de imagens a fazer de equipa.
 *
 * O site atual nomeia Leandro Lopes e Cristiano Lopes como contactos (ver
 * `src/data/stoa.ts`), mas não diz as funções de cada um, nem quem é a
 * terceira pessoa. Por isso os perfis ficam vazios em vez de pré-preenchidos.
 *
 * - O **nome** e o **retrato** são factos e vivem aqui.
 * - A **função** e a **apresentação** são texto e vivem em
 *   `messages/fr-CH.json`, em `equipa.perfis.<id>.{funcao,apresentacao}`.
 *
 * Em aperçu, os perfis vazios aparecem como placeholders identificados. Em
 * publicação só aparecem os perfis completos, e a secção esconde-se se não
 * houver nenhum.
 */
export type Perfil = {
  id: "perfil-1" | "perfil-2" | "perfil-3";
  nome: string | null;
  retrato: IdImagem | null;
};

export const EQUIPA: Perfil[] = [
  { id: "perfil-1", nome: null, retrato: null },
  { id: "perfil-2", nome: null, retrato: null },
  { id: "perfil-3", nome: null, retrato: null },
];

export const perfilCompleto = (p: Perfil) => p.nome !== null && p.retrato !== null;

export const perfisVisiveis = (): Perfil[] =>
  EM_PUBLICACAO ? EQUIPA.filter(perfilCompleto) : EQUIPA;
