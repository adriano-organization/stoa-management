import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { imagemPublicavel } from "@/data/validacoes";
import { routing, type Locale } from "@/i18n/routing";
import { EM_PUBLICACAO } from "./publicacao";
import { URL_SITE, caminhoLocalizado, urlLocalizado } from "./site";

/** O `og:locale` que as redes esperam: `fr_CH` e não `fr-CH`. */
export const localeOpenGraph = (locale: string) => locale.replace("-", "_");

type Partilha = { url: string; largura: number; altura: number; alt: string };

/**
 * Monta as metadata de uma página e trata sozinho da parte que é sempre igual e
 * sempre esquecida: o `metadataBase` (sem ele as imagens de partilha saem com
 * caminho relativo e nenhuma rede as resolve), os `alternates` de língua e o
 * `noindex` do modo aperçu.
 *
 * `partilha`: `undefined` usa a imagem do site; `null` quer dizer "sem
 * imagem" — é o caso de um projeto sem partilha própria, que não deve levar a
 * fotografia de outro edifício.
 */
export async function metadataDaPagina({
  locale,
  rota,
  titulo,
  descricao,
  partilha,
}: {
  locale: Locale;
  rota: string;
  titulo: string;
  descricao: string;
  partilha?: Partilha | null;
}): Promise<Metadata> {
  const marca = await getTranslations({ locale, namespace: "marca" });
  const imagem = partilha === undefined ? await partilhaPorOmissao(locale) : partilha;

  return {
    metadataBase: new URL(URL_SITE),
    title: titulo,
    description: descricao,
    alternates: {
      canonical: caminhoLocalizado(rota, locale),
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, caminhoLocalizado(rota, l)]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: marca("nome"),
      title: titulo,
      description: descricao,
      url: urlLocalizado(rota, locale),
      locale: localeOpenGraph(locale),
      ...(imagem
        ? { images: [{ url: imagem.url, width: imagem.largura, height: imagem.altura, alt: imagem.alt }] }
        : {}),
    },
    twitter: { card: imagem ? "summary_large_image" : "summary", title: titulo, description: descricao },
    ...(EM_PUBLICACAO ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * A imagem de partilha do site: o recorte do herói, gerado sem ampliação.
 * Segue a validação da fotografia de onde sai.
 */
export const PARTILHA_DO_SITE = { url: "/medias/partilha-stoa.jpg", de: "heroi-immeuble" } as const;

async function partilhaPorOmissao(locale: Locale): Promise<Partilha | null> {
  if (!imagemPublicavel(PARTILHA_DO_SITE.de)) return null;
  const t = await getTranslations({ locale, namespace: "medias" });
  return { url: PARTILHA_DO_SITE.url, largura: 1200, altura: 630, alt: t("partilha") };
}
