import { getTranslations } from "next-intl/server";
import { hrefTelefone, stoa } from "@/data/stoa";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ComProgresso } from "./movimento/ComProgresso";

/**
 * "Parlons de votre projet." — o fecho das páginas, antes do rodapé. Liga ao
 * formulário e dá os contactos diretos: quem prefere o telefone não tem de
 * passar pelo formulário. É a única faixa verde do site, entre o calcário da
 * página e o carvão do rodapé, e alarga-se até às bordas ao entrar.
 */
export async function ChamadaContacto({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "chamada" });
  const direto = await getTranslations({ locale, namespace: "contacto.direto" });

  return (
    <ComProgresso as="section" modo="entrada" className="chamada" aria-labelledby="chamada-titulo">
      <div className="envelope chamada__corpo">
        <h2 id="chamada-titulo" className="titulo-display chamada__titulo" data-revelar="">
          {t("titulo")}
        </h2>
        <p className="texto-medio chamada__texto" data-revelar="">
          {t("texto")}
        </p>
        <div data-revelar="">
          <Link href="/contact" className="botao botao--claro chamada__botao">
            {t("cta")}
            <span className="botao__seta" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <div className="chamada__direto" data-revelar="">
          <p className="chamada__cota legenda">{t("ouDireto")}</p>
          <ul className="chamada__vias">
            <li>
              <span className="legenda">{direto("email")}</span>
              <a className="ligacao" href={`mailto:${stoa.email}`}>
                {stoa.email}
              </a>
            </li>
            {stoa.contactos.map((c) =>
              c.telefone ? (
                <li key={c.nome}>
                  <span className="legenda">{c.nome}</span>
                  <a className="ligacao" href={hrefTelefone(c.telefone)}>
                    {c.telefone}
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      </div>
    </ComProgresso>
  );
}
