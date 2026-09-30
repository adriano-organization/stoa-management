import { caminhoLocalizado } from "@/i18n/routing";

export { caminhoLocalizado };

/**
 * Endereço público do site — fonte única.
 *
 * É preciso em sítios que têm de concordar entre si: o `metadataBase` (que
 * transforma os caminhos relativos das imagens de partilha em absolutos), o
 * `sitemap.ts`, o `robots.ts` e os dados estruturados.
 *
 * Por ordem:
 * 1. `NEXT_PUBLIC_SITE_URL`, se estiver definido — é o que se usa em produção
 *    quando o domínio final estiver ligado a este site;
 * 2. na Vercel, o endereço que a plataforma dá ao deploy (produção ou
 *    pré-visualização), para as imagens de partilha de uma pré-visualização
 *    apontarem para ela e não para o site antigo;
 * 3. `https://stoa-management.ch`, o domínio da empresa.
 *
 * ⚠️ Hoje o domínio ainda serve o site antigo. Enquanto não mudar, uma
 * publicação deste site noutro endereço tem de definir `NEXT_PUBLIC_SITE_URL`.
 */
export const URL_SITE = validarUrlSite(
  /* `||` e não `??`: a variável definida mas vazia (o que fica ao importar o
     `.env.example` tal como está) conta como não definida. */
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    enderecoDaVercel() ||
    "https://stoa-management.ch",
);

function enderecoDaVercel(): string | null {
  const producao = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (process.env.VERCEL_ENV === "production" && producao) return `https://${producao}`;
  const deploy = process.env.VERCEL_URL?.trim();
  return deploy ? `https://${deploy}` : null;
}

/** Falha no build com uma mensagem que diz o que corrigir, em vez do
    `TypeError: Invalid URL` sem contexto que o Next mostra a meio do prerender. */
function validarUrlSite(valor: string): string {
  if (!URL.canParse(valor)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL inválido: "${valor}". Tem de ser um endereço completo, com https:// (ex.: https://stoa-management.ch).`,
    );
  }
  return valor.replace(/\/+$/, "");
}

/** Estúdio que desenhou e desenvolveu o site, creditado no rodapé. */
export const URL_ESTUDIO = "https://devplus.pt";

/**
 * As páginas fixas do site, sem prefixo de língua. As páginas de projeto
 * juntam-se no `sitemap.ts`, a partir de `projetosPublicados()` — só as que o
 * modo de publicação deixa sair.
 */
export const ROTAS_FIXAS = ["/", "/realisations", "/contact"] as const;

/** O mesmo, mas absoluto — que é o que o sitemap e as metadata precisam. */
export const urlLocalizado = (rota: string, locale: string) =>
  `${URL_SITE}${caminhoLocalizado(rota, locale)}`;
