import { getTranslations } from "next-intl/server";
import { hrefTelefone, stoa } from "@/data/stoa";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * "Parlons de votre projet." — o fecho das páginas, antes do rodapé. Liga ao
 * formulário e dá os contactos diretos: quem prefere o telefone não tem de
 * passar pelo formulário.
 */
export async function ChamadaContacto({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "chamada" });

  return (
    <section className="chamada escuro" aria-labelledby="chamada-titulo">
      <div className="envelope chamada__grelha">
        <h2 id="chamada-titulo" className="titulo-display chamada__titulo" data-revelar="">
          {t("titulo")}
        </h2>
        <div className="chamada__lado" data-revelar="">
          <p className="texto-medio">{t("texto")}</p>
          <Link href="/contact" className="botao botao--claro chamada__botao">
            {t("cta")}
            <span className="botao__seta" aria-hidden="true">
              →
            </span>
          </Link>
          <div className="chamada__direto">
            <p className="legenda suave">{t("ouDireto")}</p>
            <p>
              <a className="ligacao" href={`mailto:${stoa.email}`}>
                {stoa.email}
              </a>
            </p>
            {stoa.contactos.map((c) =>
              c.telefone ? (
                <p key={c.nome}>
                  <a className="ligacao" href={hrefTelefone(c.telefone)}>
                    {c.telefone}
                  </a>{" "}
                  <span className="suave">{c.nome}</span>
                </p>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
