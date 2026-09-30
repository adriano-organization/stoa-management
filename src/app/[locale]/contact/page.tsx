import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Formulario, type TextosDoFormulario } from "@/components/contacto/Formulario";
import { Foto } from "@/components/Foto";
import { SeloProvisorio } from "@/components/SeloProvisorio";
import { hrefTelefone, redesConfirmadas, stoa } from "@/data/stoa";
import type { Locale } from "@/i18n/routing";
import { TIPOS_DE_PROJETO } from "@/lib/contacto/esquema";
import { metadataDaPagina } from "@/lib/metadata";
import { EM_PUBLICACAO } from "@/lib/publicacao";
import "../../contact.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "metadata.contact" });
  return metadataDaPagina({ locale, rota: "/contact", titulo: t("titulo"), descricao: t("descricao") });
}

/**
 * Contacto: o formulário e, ao lado, os contactos diretos — quem prefere o
 * telefone ou o email não tem de passar pelo formulário.
 *
 * A fotografia do escritório só aparece em aperçu, com o selo: as fotografias
 * foram tiradas perto da morada da STOA, mas ninguém confirmou que é o
 * escritório, nem que se pode publicar.
 */
export default async function Contacto({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contacto" });
  const f = await getTranslations({ locale, namespace: "contacto.formulario" });
  const comum = await getTranslations({ locale, namespace: "comum" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const tp = await getTranslations({ locale, namespace: "projeto" });

  const textos: TextosDoFormulario = {
    titulo: f("titulo"),
    obrigatorio: f("obrigatorio"),
    facultativo: f("facultativo"),
    campos: {
      nome: f("nome"),
      email: f("email"),
      telefone: f("telefone"),
      tipo: f("tipo"),
      local: f("local"),
      mensagem: f("mensagem"),
    },
    tipoEscolher: f("tipoEscolher"),
    tipos: Object.fromEntries(TIPOS_DE_PROJETO.map((tipo) => [tipo, f(`tipos.${tipo}`)])) as TextosDoFormulario["tipos"],
    localAjuda: f("localAjuda"),
    mensagemAjuda: f("mensagemAjuda"),
    isco: f("isco"),
    enviar: f("enviar"),
    aEnviar: f("aEnviar"),
    erros: {
      nome: f("erros.nome"),
      email: f("erros.email"),
      telefone: f("erros.telefone"),
      tipo: f("erros.tipo"),
      mensagem: f("erros.mensagem"),
      longo: f("erros.longo"),
      resumoUm: f("erros.resumoUm"),
      resumoVarios: f.raw("erros.resumoVarios") as string,
    },
    sucesso: { titulo: f("sucesso.titulo"), texto: f("sucesso.texto") },
    falhas: {
      limite: f("falhas.limite", { email: stoa.email }),
      servico: f("falhas.servico", { email: stoa.email }),
      configuracao: f("falhas.configuracao", { email: stoa.email }),
      rapido: f("falhas.rapido"),
      ligacoes: f("falhas.ligacoes"),
    },
    novo: f("novo"),
    dados: f("dados"),
  };

  return (
    <section className="contacto envelope" aria-labelledby="contacto-titulo">
      <div className="contacto__topo">
        <h1 id="contacto-titulo" className="titulo-display" data-revelar="">
          {t("titulo")}
        </h1>
        <p className="texto-medio suave contacto__intro" data-revelar="">
          {t("intro")}
        </p>
      </div>

      <div className="contacto__grelha">
        <div className="contacto__formulario">
          <h2 className="legenda suave">{f("titulo")}</h2>
          <Formulario textos={textos} lingua={locale} />
        </div>

        <aside className="contacto__direto" aria-labelledby="direto-titulo">
          <h2 id="direto-titulo" className="legenda suave">
            {t("direto.titulo")}
          </h2>

          <dl className="contacto__lista">
            <div>
              <dt className="legenda suave">{t("direto.email")}</dt>
              <dd>
                <a className="ligacao" href={`mailto:${stoa.email}`}>
                  {stoa.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="legenda suave">{t("direto.telefones")}</dt>
              <dd>
                <ul>
                  {stoa.contactos.map((c) =>
                    c.telefone ? (
                      <li key={c.nome}>
                        <a className="ligacao" href={hrefTelefone(c.telefone)}>
                          {c.telefone}
                        </a>{" "}
                        <span className="suave">{c.nome}</span>
                      </li>
                    ) : null,
                  )}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="legenda suave">{t("direto.morada")}</dt>
              <dd>
                <address>
                  {stoa.morada.rua}
                  <br />
                  {stoa.morada.codigoPostal} {stoa.morada.localidade}
                  <br />
                  <span className="suave">{comum("cantao")}</span>
                </address>
                {stoa.mapa && (
                  <a className="ligacao" href={stoa.mapa} rel="noopener" target="_blank">
                    {t("direto.mapa")}
                  </a>
                )}
              </dd>
            </div>
            {redesConfirmadas.length > 0 && (
              <div>
                <dt className="legenda suave">{t("direto.redes")}</dt>
                <dd>
                  <ul className="contacto__redes">
                    {redesConfirmadas.map((r) => (
                      <li key={r.nome}>
                        <a className="ligacao" href={r.url} rel="noopener" target="_blank">
                          {r.nome}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          {!EM_PUBLICACAO && (
            <figure className="contacto__foto">
              <Foto id="bureau-plateau" alt={medias("bureau-plateau")} sizes="(min-width: 900px) 30vw, 92vw" />
              <figcaption className="legenda suave">
                {t("legendaBureau")} <SeloProvisorio texto={tp("provisorio")} />
              </figcaption>
            </figure>
          )}
        </aside>
      </div>
    </section>
  );
}
