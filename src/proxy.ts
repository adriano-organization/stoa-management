import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * O que corre antes de cada pedido. No Next 16 este ficheiro chama-se
 * `proxy.ts` — é o antigo `middleware.ts`, renomeado.
 *
 * Só faz uma coisa: o negociador de língua do `next-intl`, que reescreve
 * `/realisations` para a rota interna `/fr-CH/realisations` sem mudar o
 * endereço que o visitante vê.
 */
export default createMiddleware(routing);

export const config = {
  /* Tudo o que não seja API, ficheiros internos do Next/Vercel ou um pedido com
     extensão (imagens, vídeos, sitemap.xml, robots.txt) passa por aqui. */
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
