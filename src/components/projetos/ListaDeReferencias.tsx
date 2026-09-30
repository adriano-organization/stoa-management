import { getTranslations } from "next-intl/server";
import type { Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";

/**
 * As referências do site atual, numa tabela de linhas finas: ano, projeto,
 * lugar, missão e a empresa com quem foi feita. É aqui que a distinção pedida
 * fica escrita — foram missões de colaboradores da STOA, em colaboração com
 * outras empresas, e o site diz isso por extenso em vez de as misturar com os
 * projetos da STOA.
 */
export async function ListaDeReferencias({
  referencias,
  locale,
  nivel = 2,
}: {
  referencias: Projeto[];
  locale: Locale;
  nivel?: 2 | 3;
}) {
  const t = await getTranslations({ locale, namespace: "realisations.referencias" });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const tt = await getTranslations({ locale, namespace: "projetos" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const Titulo = nivel === 2 ? "h2" : "h3";

  return (
    <section className="referencias" aria-labelledby="referencias-titulo">
      <div className="referencias__topo">
        <Titulo id="referencias-titulo" className="titulo-seccao" data-revelar="">
          {t("titulo")}
        </Titulo>
        <p className="texto-medio suave" data-revelar="">
          {t("intro")}
        </p>
      </div>

      <div className="referencias__cabecalho legenda suave" aria-hidden="true">
        <span>{t("colunas.periodo")}</span>
        <span>{t("colunas.projeto")}</span>
        <span>{t("colunas.missao")}</span>
        <span>{t("colunas.colaboracao")}</span>
      </div>

      <ol className="referencias__lista">
        {referencias.map((r) => (
          <li key={r.slug} className="referencia" data-revelar="">
            <Link href={`/realisations/${r.slug}`} className="referencia__ligacao">
              <span className="referencia__periodo legenda">{r.periodo}</span>
              <span className="referencia__projeto">
                <span className="referencia__titulo">{tt(`${r.slug}.titulo`)}</span>
                {r.local && <span className="referencia__local suave">{r.local}</span>}
              </span>
              <span className="referencia__missao">
                {r.missao ? tp(`missoes.${r.missao}`) : null}
                {r.pessoa && <span className="suave referencia__pessoa">{r.pessoa}</span>}
              </span>
              <span className="referencia__colaboracao suave">
                {r.colaboracao ? `${r.colaboracao.empresa}, ${r.colaboracao.cidade}` : null}
              </span>
              <span className="referencia__imagem">
                <Foto id={r.capa} alt={medias(r.capa)} sizes="160px" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
