import { ViewTransition, type CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import type { Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";
import { ComProgresso } from "../movimento/ComProgresso";
import { SeloProvisorio } from "../SeloProvisorio";

/**
 * Um projeto no trilho do portefólio: a capa grande, o número gigante em
 * contorno, o título e só a informação confirmada.
 *
 * Cada cartão mede a sua própria chegada (`lateral`): a fotografia desliza
 * dentro da moldura mais devagar do que o cartão, o número mais depressa, e é
 * essa diferença de velocidades que dá profundidade ao trilho. Parado, os
 * valores de repouso deixam tudo no sítio.
 *
 * A capa tem o mesmo nome de transição que a abertura da página do projeto —
 * é a mesma imagem que cresce até lá.
 */
export async function CartaoDeProjeto({
  projeto,
  numero,
  locale,
}: {
  projeto: Projeto;
  numero: number;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: `projetos.${projeto.slug}` });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const medias = await getTranslations({ locale, namespace: "medias" });

  const meta = [
    projeto.local,
    projeto.missao ? tp(`missoes.${projeto.missao}`) : null,
    projeto.estado ? tp(`estados.${projeto.estado}`) : null,
    projeto.periodo,
  ].filter(Boolean);

  return (
    <ComProgresso
      as="article"
      modo="lateral"
      className="trilho__cartao"
      style={{ "--i": numero } as CSSProperties}
      aria-labelledby={`trilho-${projeto.slug}`}
      data-revelar=""
    >
      <p className="trilho__numero" aria-hidden="true">
        {String(numero).padStart(2, "0")}
      </p>
      <Link href={`/realisations/${projeto.slug}`} className="trilho__ligacao">
        <ViewTransition name={`projeto-${projeto.slug}`} share="morph" default="none">
          <div className="trilho__moldura">
            <Foto
              id={projeto.capa}
              alt={medias(projeto.capa)}
              sizes="(min-width: 900px) 46vw, 92vw"
              foco={projeto.foco}
              antecipar
            />
          </div>
        </ViewTransition>
        <div className="trilho__texto">
          <h3 id={`trilho-${projeto.slug}`} className="trilho__titulo">
            {t("titulo")}
            <span className="botao__seta" aria-hidden="true">
              →
            </span>
          </h3>
          {t.has("resumo") && <p className="trilho__resumo suave">{t("resumo")}</p>}
          {meta.length > 0 && <p className="legenda trilho__meta">{meta.join(" · ")}</p>}
        </div>
      </Link>
      {projeto.publicacao === "provisorio" && (
        <SeloProvisorio texto={tp("provisorio")} className="trilho__selo" />
      )}
    </ComProgresso>
  );
}
