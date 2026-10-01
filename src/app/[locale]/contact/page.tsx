import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Formulario, type TextosDoFormulario } from "@/components/contacto/Formulario";
import { PlanoDoEscritorio } from "@/components/contacto/PlanoDoEscritorio";
import { Foto } from "@/components/Foto";
import { SeloProvisorio } from "@/components/SeloProvisorio";
import { hrefTelefone, redesConfirmadas, stoa } from "@/data/stoa";
import { imagemPublicavel } from "@/data/validacoes";
import type { Locale } from "@/i18n/routing";
import { TIPOS_DE_PROJETO } from "@/lib/contacto/esquema";
import { metadataDaPagina } from "@/lib/metadata";
import "../../contact.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "metadata.contact" });
  return metadataDaPagina({ locale, rota: "/contact", titulo: t("titulo"), descricao: t("descricao") });
}

/**
 * Contacto, em três tempos: as vias diretas à cabeça (quem prefere o telefone
 * ou o email não tem de passar pelo formulário), o formulário, e o mapa do
 * escritório a fechar.
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

  const telefones = stoa.contactos.flatMap((c) => (c.telefone ? [{ nome: c.nome, telefone: c.telefone }] : []));

  return (
    <div className="contacto">
      <section className="contacto__abertura envelope" aria-labelledby="contacto-titulo">
        <h1 id="contacto-titulo" className="titulo-display" data-revelar="">
          {t("titulo")}
        </h1>
        <p className="texto-medio suave contacto__intro" data-revelar="">
          {t("intro")}
        </p>

        {/* As três vias diretas, logo à cabeça: quem só quer ligar não tem de
            passar pelo formulário. Numeradas como os capítulos dos projetos. */}
        <h2 className="sr-only-focavel">{t("direto.titulo")}</h2>
        <ol className="vias">
          <li className="via" data-revelar="">
            <span className="via__numero" aria-hidden="true">
              01
            </span>
            <h3 className="legenda suave">{t("direto.email")}</h3>
            <a className="via__principal ligacao" href={`mailto:${stoa.email}`}>
              {stoa.email}
            </a>
          </li>

          {telefones.length > 0 && (
            <li className="via" data-revelar="" style={{ "--atraso": "90ms" } as React.CSSProperties}>
              <span className="via__numero" aria-hidden="true">
                02
              </span>
              <h3 className="legenda suave">{t("direto.telefones")}</h3>
              <ul className="via__telefones">
                {telefones.map((c) => (
                  <li key={c.nome}>
                    <a className="via__principal ligacao" href={hrefTelefone(c.telefone)}>
                      {c.telefone}
                    </a>
                    <span className="suave">{c.nome}</span>
                  </li>
                ))}
              </ul>
            </li>
          )}

          <li className="via" data-revelar="" style={{ "--atraso": "180ms" } as React.CSSProperties}>
            <span className="via__numero" aria-hidden="true">
              {telefones.length > 0 ? "03" : "02"}
            </span>
            <h3 className="legenda suave">{t("direto.morada")}</h3>
            <address className="via__morada">
              {stoa.morada.rua}
              <br />
              {stoa.morada.codigoPostal} {stoa.morada.localidade}
              <br />
              <span className="suave">{comum("cantao")}</span>
            </address>
            {stoa.coordenadas && (
              <a className="ligacao ligacao-seta via__plano" href="#plano">
                {t("direto.verPlano")}{" "}
                <span className="botao__seta" aria-hidden="true">
                  ↓
                </span>
              </a>
            )}
          </li>
        </ol>
      </section>

      <section className="contacto__escrever envelope" aria-labelledby="escrever-titulo">
        <div className="contacto__lado">
          <p className="legenda suave">{f("titulo")}</p>
          <h2 id="escrever-titulo" className="titulo-seccao" data-revelar="">
            {t("escrever.titulo")}
          </h2>
          <p className="suave contacto__nota">{t("escrever.texto")}</p>

          {redesConfirmadas.length > 0 && (
            <div className="contacto__redes">
              <h3 className="legenda suave">{t("direto.redes")}</h3>
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

          {imagemPublicavel("bureau-plateau") && (
            <figure className="contacto__foto">
              <Foto id="bureau-plateau" alt={medias("bureau-plateau")} sizes="(min-width: 900px) 28vw, 92vw" />
              <figcaption className="legenda suave">
                {t("legendaBureau")} <SeloProvisorio texto={tp("provisorio")} />
              </figcaption>
            </figure>
          )}
        </div>

        <div className="contacto__formulario">
          <Formulario textos={textos} lingua={locale} />
        </div>
      </section>

      <PlanoDoEscritorio locale={locale} />
    </div>
  );
}
