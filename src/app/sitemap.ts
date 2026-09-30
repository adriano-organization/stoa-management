import type { MetadataRoute } from "next";
import { projetosVisiveis } from "@/data/projetos";
import { routing } from "@/i18n/routing";
import { ROTAS_FIXAS, urlLocalizado } from "@/lib/site";

/**
 * As páginas fixas e as de projeto que o modo de publicação deixa sair — em
 * publicação, só as validadas. Uma entrada por rota e por língua, cada uma a
 * apontar para as alternativas (hoje só há uma língua; fica pronto para mais).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const rotas = [...ROTAS_FIXAS, ...projetosVisiveis().map((p) => `/realisations/${p.slug}`)];

  return rotas.flatMap((rota) =>
    routing.locales.map((locale) => ({
      url: urlLocalizado(rota, locale),
      lastModified: new Date(),
      priority: rota === "/" ? 1 : rota.startsWith("/realisations/") ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, urlLocalizado(rota, l)])),
      },
    })),
  );
}
