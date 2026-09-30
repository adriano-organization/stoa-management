import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChamadaContacto } from "@/components/ChamadaContacto";
import { AberturaDoPortefolio } from "@/components/projetos/AberturaDoPortefolio";
import { CartaoDeProjeto } from "@/components/projetos/CartaoDeProjeto";
import { ListaDeReferencias } from "@/components/projetos/ListaDeReferencias";
import { Trilho } from "@/components/projetos/Trilho";
import { projetosEmDestaque, realizacoesStoa, referencias } from "@/data/projetos";
import type { Locale } from "@/i18n/routing";
import { metadataDaPagina } from "@/lib/metadata";
import "../../realisations.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "metadata.realisations" });
  return metadataDaPagina({ locale, rota: "/realisations", titulo: t("titulo"), descricao: t("descricao") });
}

/**
 * # O portefólio, em três tempos
 *
 * 1. **A abertura**: o projeto em destaque de ponta a ponta, com o título da
 *    página por cima (`AberturaDoPortefolio`).
 * 2. **O trilho**: os outros projetos da STOA numa fila que anda de lado
 *    enquanto a página desce (`Trilho`, `CartaoDeProjeto`). No telemóvel e
 *    parado é uma lista vertical.
 * 3. **As referências**: as missões de colaboradores, num índice à parte, com
 *    as atribuições do site atual (`ListaDeReferencias`).
 *
 * **Sem filtros**: com os projetos que existem e nenhuma classificação
 * confirmada (tipo, estado), um filtro só separaria listas de um ou dois.
 *
 * Em publicação, enquanto nenhum projeto das fotografias estiver validado, o
 * destaque é a primeira referência e não há trilho: a página abre sobre ela e
 * segue para o índice das referências.
 */
export default async function Realisations({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "realisations" });

  const [destaque] = projetosEmDestaque(1);
  const projetos = realizacoesStoa().filter((p) => p.slug !== destaque?.slug);
  const refs = referencias();

  return (
    <>
      {destaque ? (
        <AberturaDoPortefolio projeto={destaque} locale={locale} />
      ) : (
        <h1 className="sr-only">{t("titulo")}</h1>
      )}

      {projetos.length > 0 && (
        <Trilho
          className="trilho escuro"
          aria-labelledby="trilho-titulo"
          style={{ "--n": projetos.length } as CSSProperties}
        >
          <div className="trilho__palco">
            <div className="trilho__topo envelope">
              <h2 id="trilho-titulo" className="legenda">
                <span>02</span> {t("todos")}
              </h2>
              <p className="trilho__intro suave">{t("intro")}</p>
              <p className="trilho__progresso legenda suave" aria-hidden="true">
                <span>{t("percorrer")}</span>
                <span className="trilho__barra" />
              </p>
            </div>
            <div className="trilho__fila">
              {projetos.map((projeto, i) => (
                <CartaoDeProjeto key={projeto.slug} projeto={projeto} numero={i + 2} locale={locale} />
              ))}
            </div>
          </div>
        </Trilho>
      )}

      {refs.length > 0 && (
        <div className="envelope">
          <ListaDeReferencias
            referencias={refs}
            locale={locale}
            numero={String((destaque ? 1 : 0) + (projetos.length > 0 ? 1 : 0) + 1).padStart(2, "0")}
          />
        </div>
      )}

      <ChamadaContacto locale={locale} />
    </>
  );
}
