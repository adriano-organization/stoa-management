import { defineRouting } from "next-intl/routing";

/**
 * Uma língua, por agora: o francês da Suíça romanda.
 *
 * O site nasce só em `fr-CH` e é de propósito — uma segunda língua meio
 * traduzida é pior do que nenhuma. A estrutura já está pronta para ela: todo o
 * texto vive em `messages/`, e acrescentar o alemão é juntar `"de-CH"` a esta
 * lista e criar `messages/de-CH.json`. O `sitemap.ts`, os `alternates` das
 * metadata e o `verificar-mensagens` leem esta lista e seguem sozinhos.
 *
 * `localePrefix: "as-needed"` deixa a língua por omissão sem prefixo
 * (`/realisations`) e prefixa só as outras (`/de-CH/realisations`, no dia em
 * que existir). Os *slugs* ficam em francês em todas as línguas: traduzi-los
 * obrigava a manter um mapa de `pathnames` e redirecionamentos.
 *
 * ⚠️ **`localeCookie: false`**: o site não grava cookie nenhum a quem o visita,
 * e o CI verifica-o. A língua está no endereço, e é lá que fica.
 *
 * ⚠️ **`localeDetection: false`**: sem cookie, o negociador só teria o
 * `Accept-Language` para adivinhar, e re-adivinhava a cada pedido — quando
 * houver duas línguas, uma escolha explícita no seletor seria desfeita por
 * trás. O endereço manda e mais nada.
 */
export const routing = defineRouting({
  locales: ["fr-CH"],
  defaultLocale: "fr-CH",
  localePrefix: "as-needed",
  localeCookie: false,
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
