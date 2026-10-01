import { ViewTransition } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChamadaContacto } from "@/components/ChamadaContacto";
import { Foto } from "@/components/Foto";
import { Galeria } from "@/components/projetos/Galeria";
import { ObrasSeguintes } from "@/components/projetos/ObrasSeguintes";
import { capitulosDoRelato } from "@/components/projetos/Relato";
import { SeloProvisorio } from "@/components/SeloProvisorio";
import { projetoPorSlug, projetosSeguintes, projetosVisiveis, relatoPublicavel, type Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { dadosDaImagem, dadosDaPartilha } from "@/lib/medias";
import { metadataDaPagina } from "@/lib/metadata";
import { EM_PUBLICACAO } from "@/lib/publicacao";
import "../../../realisations.css";

/**
 * Só as páginas que o modo de publicação deixa sair são geradas; qualquer
 * outro endereço dá 404 (`dynamicParams = false`). Em publicação, um projeto
 * provisório não tem página nenhuma — nem escondida.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projetosVisiveis().map((p) => ({ locale, slug: p.slug })));
}

type Parametros = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const projeto = projetoPorSlug(slug);
  if (!projeto) return {};

  const t = await getTranslations({ locale, namespace: `projetos.${slug}` });
  const tm = await getTranslations({ locale, namespace: "metadata.realisations" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const partilha = projeto.partilha ? dadosDaPartilha(projeto.partilha) : null;

  return metadataDaPagina({
    locale,
    rota: `/realisations/${slug}`,
    titulo: t("titulo") + (projeto.local ? `, ${projeto.local}` : ""),
    descricao: t.has("resumo") ? t("resumo") : tm("descricao"),
    /* Sem partilha própria, sem imagem: a do site é outro edifício, e uma
       referência não pode parecer ilustrada por ele. */
    partilha: partilha
      ? { url: partilha.url, largura: partilha.largura, altura: partilha.altura, alt: medias(projeto.capa) }
      : null,
  });
}

export default async function PaginaDoProjeto({ params }: Parametros) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);

  const projeto = projetoPorSlug(slug);
  if (!projeto) notFound();

  const t = await getTranslations({ locale, namespace: `projetos.${slug}` });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const seguintes = projetosSeguintes(slug, 3);
  const capitulos = await capitulosDoRelato(projeto, locale);

  /* Uma capa pequena (as referências do site antigo, ~820 px) não se estica a
     toda a largura: fica numa coluna, no tamanho que tem. */
  const capaPequena = dadosDaImagem(projeto.capa).largura < 1100;

  return (
    <>
      <article className="projeto">
        <header className="projeto__cabeca envelope">
          <Link href="/realisations" className="projeto__voltar legenda">
            <span aria-hidden="true">←</span> {tp("voltar")}
          </Link>
          <h1 className="titulo-display projeto__titulo">{t("titulo")}</h1>
          {(projeto.local || projeto.periodo) && (
            <p className="texto-medio suave projeto__subtitulo">
              {[projeto.local, projeto.periodo].filter(Boolean).join(" · ")}
            </p>
          )}
          {projeto.publicacao === "provisorio" && <SeloProvisorio texto={tp("provisorioNota")} />}
        </header>

        <div className={`projeto__abertura ${capaPequena ? "projeto__abertura--pequena" : ""} envelope`}>
          <ViewTransition name={`projeto-${projeto.slug}`} share="morph" default="none">
            <div className="projeto__abertura-moldura">
              <Foto
                id={projeto.capa}
                alt={medias(projeto.capa)}
                sizes={capaPequena ? "(min-width: 900px) 812px, 92vw" : "(min-width: 1400px) 1280px, 92vw"}
                foco={projeto.foco}
                prioridade
              />
            </div>
          </ViewTransition>
        </div>

        <section className="projeto__intro envelope" aria-label={tp("ficha")}>
          <Ficha projeto={projeto} locale={locale} />
          {t.has("resumo") && <p className="texto-grande projeto__resumo">{t("resumo")}</p>}
        </section>

        <Intervencao projeto={projeto} locale={locale} />

        <Galeria blocos={projeto.galeria} capitulos={capitulos} locale={locale} />

      </article>

      {seguintes.length > 0 && <ObrasSeguintes projetos={seguintes} locale={locale} />}

      <ChamadaContacto locale={locale} />
    </>
  );
}

/**
 * A ficha, no registo de um cartouche de planta: rótulo em mono, valor ao
 * lado, fios finos. Só entram os campos confirmados — um campo a `null` não
 * deixa rótulo vazio.
 */
async function Ficha({ projeto, locale }: { projeto: Projeto; locale: Locale }) {
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const linhas = [
    [tp("rotulos.local"), projeto.local],
    [tp("rotulos.missao"), projeto.missao ? tp(`missoes.${projeto.missao}`) : null],
    [tp("rotulos.pessoa"), projeto.pessoa],
    [
      tp("rotulos.colaboracao"),
      projeto.colaboracao ? `${projeto.colaboracao.empresa}, ${projeto.colaboracao.cidade}` : null,
    ],
    [tp("rotulos.estado"), projeto.estado ? tp(`estados.${projeto.estado}`) : null],
    [tp("rotulos.periodo"), projeto.periodo],
  ].filter((linha): linha is [string, string] => Boolean(linha[1]));

  if (linhas.length === 0) return null;

  return (
    <dl className="ficha" data-revelar="">
      {linhas.map(([rotulo, valor]) => (
        <div key={rotulo} className="ficha__linha">
          <dt className="legenda suave">{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * O papel da STOA no projeto. Nas referências, a frase que as distingue (uma
 * missão de um colaborador, com outra empresa). Nos projetos da STOA, o texto
 * de `projetos.<slug>.intervencao` — que ainda não existe para nenhum. Sem
 * ele, o relato já conta o papel da STOA; sem os dois, em aperçu fica o
 * lembrete do que falta escrever, e em publicação a secção não aparece.
 */
async function Intervencao({ projeto, locale }: { projeto: Projeto; locale: Locale }) {
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const t = await getTranslations({ locale, namespace: `projetos.${projeto.slug}` });

  if (projeto.realizadoPor === "colaborador" && projeto.colaboracao) {
    return (
      <section className="projeto__intervencao envelope" aria-labelledby="intervencao-titulo">
        <h2 id="intervencao-titulo" className="legenda suave">
          {tp("missaoTitulo")}
        </h2>
        <p className="texto-medio">
          {tp("referenciaNota", { empresa: projeto.colaboracao.empresa, cidade: projeto.colaboracao.cidade })}
        </p>
      </section>
    );
  }

  const texto = t.has("intervencao") ? t("intervencao") : null;
  if (!texto && (EM_PUBLICACAO || relatoPublicavel(projeto))) return null;

  return (
    <section className="projeto__intervencao envelope" aria-labelledby="intervencao-titulo">
      <h2 id="intervencao-titulo" className="legenda suave">
        {tp("intervencaoTitulo")}
      </h2>
      {texto ? (
        <p className="texto-medio">{texto}</p>
      ) : (
        <SeloProvisorio texto={tp("intervencaoEmFalta")} />
      )}
    </section>
  );
}
