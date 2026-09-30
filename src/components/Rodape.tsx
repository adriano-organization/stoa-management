import { getTranslations } from "next-intl/server";
import { hrefTelefone, redesConfirmadas, stoa } from "@/data/stoa";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { URL_ESTUDIO } from "@/lib/site";
import { ComProgresso } from "./movimento/ComProgresso";

/**
 * O fecho de todas as páginas: contactos, navegação e a marca a toda a
 * largura. A marca ergue-se por trás de um fio horizontal à medida que se
 * chega ao fim — o par do herói, onde ela afunda atrás do edifício.
 */
export async function Rodape({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "rodape" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const marca = await getTranslations({ locale, namespace: "marca" });
  const comum = await getTranslations({ locale, namespace: "comum" });
  const { morada } = stoa;

  return (
    <footer className="rodape escuro">
      <div className="envelope rodape__colunas">
        <div className="rodape__coluna">
          <p className="legenda suave">{t("morada")}</p>
          <address>
            {stoa.nome}
            <br />
            {morada.rua}
            <br />
            {morada.codigoPostal} {morada.localidade}
            <br />
            <span className="suave">{comum("cantao")}</span>
          </address>
          {stoa.mapa && (
            <a className="ligacao" href={stoa.mapa} rel="noopener" target="_blank">
              {t("verMapa")}
            </a>
          )}
        </div>

        <div className="rodape__coluna">
          <p className="legenda suave">{t("contacto")}</p>
          <ul>
            <li>
              <a className="ligacao" href={`mailto:${stoa.email}`}>
                {stoa.email}
              </a>
            </li>
            {stoa.contactos.map((c) =>
              c.telefone ? (
                <li key={c.nome}>
                  <span className="suave">{c.nome}</span>{" "}
                  <a className="ligacao" href={hrefTelefone(c.telefone)}>
                    {c.telefone}
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        </div>

        <nav className="rodape__coluna" aria-label={t("navegacao")}>
          <p className="legenda suave">{t("navegacao")}</p>
          <ul>
            <li>
              <Link className="ligacao" href="/realisations">
                {nav("realisations")}
              </Link>
            </li>
            <li>
              <Link className="ligacao" href="/#expertises">
                {nav("expertises")}
              </Link>
            </li>
            <li>
              <Link className="ligacao" href="/#a-propos">
                {nav("aPropos")}
              </Link>
            </li>
            <li>
              <Link className="ligacao" href="/contact">
                {nav("contact")}
              </Link>
            </li>
          </ul>
        </nav>

        {redesConfirmadas.length > 0 && (
          <div className="rodape__coluna">
            <p className="legenda suave">{t("redes")}</p>
            <ul>
              {redesConfirmadas.map((r) => (
                <li key={r.nome}>
                  <a className="ligacao" href={r.url} rel="noopener" target="_blank">
                    {r.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ComProgresso modo="revelado" className="rodape__marca">
        <p aria-hidden="true">{marca("curto")}</p>
      </ComProgresso>

      <div className="envelope rodape__base legenda suave">
        <p>{t("direitos", { ano: new Date().getFullYear() })}</p>
        <p>{marca("actividade")}</p>
        <p>
          <a className="ligacao" href={URL_ESTUDIO} rel="noopener" target="_blank">
            {t("credito")}
          </a>
        </p>
      </div>
    </footer>
  );
}
