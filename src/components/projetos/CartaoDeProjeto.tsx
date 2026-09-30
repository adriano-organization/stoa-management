import { ViewTransition } from "react";
import { getTranslations } from "next-intl/server";
import type { Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";
import { SeloProvisorio } from "../SeloProvisorio";

/**
 * Um projeto no índice do portefólio: a capa, o número, o título e só a
 * informação confirmada. A capa tem o mesmo nome de transição que a abertura
 * da página do projeto — é a mesma imagem que cresce até lá.
 */
export async function CartaoDeProjeto({
  projeto,
  numero,
  locale,
  sizes,
}: {
  projeto: Projeto;
  numero: number;
  locale: Locale;
  sizes: string;
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
    <article className="cartao-projeto" data-revelar="">
      <Link href={`/realisations/${projeto.slug}`} className="cartao-projeto__ligacao">
        <ViewTransition name={`projeto-${projeto.slug}`} share="morph" default="none">
          <div className="cartao-projeto__moldura">
            <Foto id={projeto.capa} alt={medias(projeto.capa)} sizes={sizes} foco={projeto.foco} />
          </div>
        </ViewTransition>
        <div className="cartao-projeto__texto">
          <p className="legenda suave">{String(numero).padStart(2, "0")}</p>
          <h3 className="cartao-projeto__titulo">{t("titulo")}</h3>
          {meta.length > 0 && <p className="legenda cartao-projeto__meta">{meta.join(" · ")}</p>}
        </div>
      </Link>
      {projeto.publicacao === "provisorio" && (
        <SeloProvisorio texto={tp("provisorio")} className="cartao-projeto__selo" />
      )}
    </article>
  );
}
