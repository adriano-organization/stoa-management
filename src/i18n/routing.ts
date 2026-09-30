import { defineRouting } from "next-intl/routing";

/**
 * Três línguas: o francês da Suíça romanda, que é a principal, e as traduções
 * para português e inglês.
 *
 * O francês é a língua de referência: um texto novo nasce em
 * `messages/fr-CH.json` e só depois se traduz. O `verificar-mensagens` falha se
 * uma língua tiver chaves a mais ou a menos que as outras, e é isso que evita
 * uma página meio traduzida. O `sitemap.ts`, os `alternates` das metadata e o
 * seletor do cabeçalho leem esta lista e seguem sozinhos.
 *
 * `localePrefix: "as-needed"` deixa a língua por omissão sem prefixo
 * (`/realisations`) e prefixa só as outras (`/pt/realisations`,
 * `/en/realisations`). Os *slugs* ficam em francês em todas as línguas:
 * traduzi-los obrigava a manter um mapa de `pathnames` e redirecionamentos.
 *
 * `pt` e `en` sem região: o endereço fica curto, e nada no texto depende de
 * ser o português de Portugal ou o inglês britânico ao ponto de o dizer no URL.
 *
 * ⚠️ **`localeCookie: false`**: o site não grava cookie nenhum a quem o visita,
 * e o CI verifica-o. A língua está no endereço, e é lá que fica.
 *
 * ⚠️ **`localeDetection: false`**: sem cookie, o negociador só teria o
 * `Accept-Language` para adivinhar, e re-adivinhava a cada pedido — uma
 * escolha explícita no seletor seria desfeita por trás. O endereço manda e
 * mais nada.
 */
export const routing = defineRouting({
  locales: ["fr-CH", "pt", "en"],
  defaultLocale: "fr-CH",
  localePrefix: "as-needed",
  localeCookie: false,
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

/**
 * O nome de cada língua na própria língua — é assim que quem procura a sua a
 * reconhece no seletor, seja qual for a página em que está. Igual em qualquer
 * língua, por isso vive aqui e não em `messages/`.
 */
export const NOMES_DAS_LINGUAS: Record<Locale, { nome: string; curto: string }> = {
  "fr-CH": { nome: "Français", curto: "FR" },
  pt: { nome: "Português", curto: "PT" },
  en: { nome: "English", curto: "EN" },
};

/**
 * O caminho de uma rota numa língua, já com o prefixo certo.
 *
 * Existe porque a regra do `localePrefix: "as-needed"` — a língua por omissão
 * sem prefixo, as outras com — está em vários sítios que têm de concordar (o
 * sitemap, os `alternates` das metadata, o seletor do cabeçalho), e
 * escrevê-la à mão em cada um é garantir que um fica para trás.
 */
export function caminhoLocalizado(rota: string, locale: string): string {
  const prefixo = locale === routing.defaultLocale ? "" : `/${locale}`;
  return rota === "/" ? prefixo || "/" : `${prefixo}${rota}`;
}
