import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";

/**
 * O que é a STOA, em três frases e três factos — todos tirados do site atual
 * (ver `docs/a-confirmer.md`). A imagem é a fachada em contra-picado: no
 * telemóvel essa fotografia já é o herói, por isso lá entra outra.
 */
export async function Apresentacao({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "apresentacao" });
  const medias = await getTranslations({ locale, namespace: "medias" });

  const factos = [
    [t("factos.baseRotulo"), t("factos.base")],
    [t("factos.dominiosRotulo"), t("factos.dominios")],
    [t("factos.experienciaRotulo"), t("factos.experiencia")],
  ];

  return (
    <section id="a-propos" className="apresentacao" aria-labelledby="apresentacao-titulo">
      <div className="envelope grelha apresentacao__grelha">
        <p className="legenda suave apresentacao__etiqueta" data-revelar="">
          <span>01</span> {t("etiqueta")}
        </p>

        <h2 id="apresentacao-titulo" className="texto-grande apresentacao__titulo" data-revelar="">
          {t("titulo")}
        </h2>

        <div className="apresentacao__texto texto-corrido" data-revelar="">
          <p>{t("paragrafo1")}</p>
          <p>{t("paragrafo2")}</p>
          <p>{t("paragrafo3")}</p>
        </div>

        <dl className="apresentacao__factos" data-revelar="">
          {factos.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="legenda suave">{rotulo}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>

        <figure className="apresentacao__figura">
          <Foto
            id="facade-panneaux"
            alt={medias("facade-panneaux")}
            sizes="(min-width: 900px) 34vw, 100vw"
            className="apresentacao__foto apresentacao__foto--largo"
            foco="46% 30%"
          />
          <Foto
            id="immeuble-j2-village"
            alt={medias("immeuble-j2-village")}
            sizes="100vw"
            className="apresentacao__foto apresentacao__foto--estreito"
          />
          <figcaption className="legenda suave">{t("legenda")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
