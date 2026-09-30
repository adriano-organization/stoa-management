import type { MetadataRoute } from "next";
import { EM_PUBLICACAO } from "@/lib/publicacao";
import { URL_SITE } from "@/lib/site";

/**
 * Em aperçu não se indexa nada — as pré-visualizações mostram projetos
 * provisórios, e um motor de busca que os guarde guarda-os durante meses.
 * Em publicação, abre tudo. Ver `lib/publicacao.ts`.
 */
export default function robots(): MetadataRoute.Robots {
  if (!EM_PUBLICACAO) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${URL_SITE}/sitemap.xml`,
  };
}
