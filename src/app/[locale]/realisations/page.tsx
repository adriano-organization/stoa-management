import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChamadaContacto } from "@/components/ChamadaContacto";
import { CartaoDeProjeto } from "@/components/projetos/CartaoDeProjeto";
import { ListaDeReferencias } from "@/components/projetos/ListaDeReferencias";
import { realizacoesStoa, referencias } from "@/data/projetos";
import type { Locale } from "@/i18n/routing";
import { metadataDaPagina } from "@/lib/metadata";
import "../../realisations.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "metadata.realisations" });
  return metadataDaPagina({ locale, rota: "/realisations", titulo: t("titulo"), descricao: t("descricao") });
}

/**
 * O portefólio: os projetos da STOA num índice editorial (capas grandes,
 * escalas alternadas), e as referências históricas à parte, em tabela.
 *
 * **Sem filtros**: com os projetos que existem e nenhuma classificação
 * confirmada (tipo, estado), um filtro só separaria listas de um ou dois. Ver
 * `docs/direction-artistique.md`.
 *
 * Em publicação, enquanto nenhum projeto das fotografias estiver validado, a
 * página mostra só as referências — e diz isso no título, não com uma lista
 * vazia.
 */
export default async function Realisations({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "realisations" });

  const projetos = realizacoesStoa();
  const refs = referencias();

  return (
    <>
      <section className="indice envelope" aria-labelledby="indice-titulo">
        <div className="indice__topo">
          <h1 id="indice-titulo" className="titulo-display" data-revelar="">
            {t("titulo")}
          </h1>
          <p className="texto-medio suave indice__intro" data-revelar="">
            {projetos.length > 0 ? t("intro") : t("introReferencias")}
          </p>
        </div>

        {projetos.length > 0 && (
          <div className="indice__grelha">
            <h2 className="sr-only">{t("projetos")}</h2>
            {projetos.map((projeto, i) => (
              <CartaoDeProjeto
                key={projeto.slug}
                projeto={projeto}
                numero={i + 1}
                locale={locale}
                sizes={i % 3 === 0 ? "(min-width: 900px) 58vw, 100vw" : "(min-width: 900px) 40vw, 100vw"}
              />
            ))}
          </div>
        )}

        {refs.length > 0 && <ListaDeReferencias referencias={refs} locale={locale} />}
      </section>

      <ChamadaContacto locale={locale} />
    </>
  );
}
