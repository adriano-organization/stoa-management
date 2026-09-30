import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { cabecalhosDoSite } from "./src/lib/cabecalhos";

const withNextIntl = createNextIntlPlugin();

/**
 * Sem `images.remotePatterns`, e é de propósito: **todas as fotografias vivem em
 * `public/medias/`**, já otimizadas pelo `npm run medias` (AVIF + WebP, nas
 * larguras que as páginas pedem). Um domínio a mais aqui seria também um
 * domínio a mais na CSP.
 *
 * Os cabeçalhos e o porquê de cada linha vivem em `src/lib/cabecalhos.ts`.
 */
const nextConfig: NextConfig = {
  /* O `X-Powered-By: Next.js` só serve para dizer a quem procura alvos que
     versão de framework está do outro lado. */
  poweredByHeader: false,

  experimental: {
    serverActions: {
      /* O formulário de contacto é a única server action: nome, email,
         telefone, local e uma mensagem de 4000 caracteres, no máximo. O
         valor por omissão (1 MB) deixava um desconhecido mandar mil vezes
         isso antes de o esquema recusar. */
      bodySizeLimit: "32kb",
    },
  },

  async headers() {
    return [
      { source: "/:caminho*", headers: cabecalhosDoSite },
      /* Os ficheiros de `public/medias/` têm o nome do que mostram, sem hash, e
         mudam quando o `npm run medias` corre outra vez. Por isso um dia de
         cache no browser e uma semana no CDN, e não um ano `immutable`: uma
         fotografia substituída chega depressa, e a mesma imagem não se pede
         duas vezes na mesma visita. */
      {
        source: "/medias/:ficheiro*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
