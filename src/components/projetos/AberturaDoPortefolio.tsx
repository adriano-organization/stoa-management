import { ViewTransition, type CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import type { Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";
import { ComProgresso } from "../movimento/ComProgresso";
import { SeloProvisorio } from "../SeloProvisorio";
import { VideoMudo } from "../VideoMudo";

/**
 * # A abertura do portefólio
 *
 * O primeiro ecrã é uma obra, não um título sobre fundo vazio: o projeto em
 * destaque de ponta a ponta (o vídeo do drone, quando o há), e "Réalisations"
 * em letras grandes por cima, que sobem uma a uma à chegada.
 *
 * Ao rolar, a imagem aproxima-se e escurece até ao carvão do trilho que vem a
 * seguir, e o título sobe e apaga-se — a mesma aproximação do herói da
 * inicial, com o mesmo motor (`--p`, modo `preso`).
 *
 * Parado (sem JavaScript, menos movimento, ecrã de pé) é um ecrã inteiro com
 * tudo no lugar.
 *
 * Quando o destaque é uma referência (em publicação, antes de haver projetos
 * da STOA validados), a abertura diz com quem foi feita, como a lista.
 */
export async function AberturaDoPortefolio({ projeto, locale }: { projeto: Projeto; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "realisations" });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const tt = await getTranslations({ locale, namespace: `projetos.${projeto.slug}` });
  const td = await getTranslations({ locale, namespace: "destaque" });
  const medias = await getTranslations({ locale, namespace: "medias" });

  const titulo = t("titulo");
  const meta = [
    projeto.local,
    projeto.missao ? tp(`missoes.${projeto.missao}`) : null,
    projeto.estado ? tp(`estados.${projeto.estado}`) : null,
    projeto.periodo,
  ].filter(Boolean);

  return (
    <ComProgresso
      as="section"
      modo="preso"
      className="abertura escuro"
      aria-labelledby="abertura-titulo"
      data-sob-cabecalho=""
    >
      <div className="abertura__palco">
        {/* Sem cortina: o morph da fotografia até à página do projeto é a
            transição (a regra está em `lib/movimento/cortina.ts`). */}
        <ViewTransition name={`projeto-${projeto.slug}`} share="morph" default="none">
          <div className="abertura__media">
            {projeto.video ? (
              <VideoMudo
                id={projeto.video}
                rotulo={medias(`videos.${projeto.video}`)}
                textos={{ pausa: tp("video.pausa"), ler: tp("video.ler"), rever: tp("video.rever") }}
                className="abertura__video"
              />
            ) : (
              <Foto
                id={projeto.capa}
                alt={medias(projeto.capa)}
                sizes="100vw"
                foco={projeto.foco}
                prioridade
                className="abertura__foto"
              />
            )}
          </div>
        </ViewTransition>

        <div className="abertura__veu" aria-hidden="true" />
        <div className="abertura__escurecer" aria-hidden="true" />

        {/* As letras sobem uma a uma; o leitor de ecrã lê a palavra inteira. */}
        <h1 id="abertura-titulo" className="abertura__titulo">
          <span className="sr-only">{titulo}</span>
          <span className="abertura__letras" aria-hidden="true">
            {Array.from(titulo).map((letra, i) => (
              <span key={i} style={{ "--i": i } as CSSProperties}>
                {letra}
              </span>
            ))}
          </span>
        </h1>

        <div className="abertura__destaque envelope">
          <div className="abertura__projeto">
            <p className="legenda abertura__etiqueta">
              <span>01</span> {t("emDestaque")}
            </p>
            <h2 className="abertura__nome">{tt("titulo")}</h2>
            {meta.length > 0 && <p className="legenda abertura__meta">{meta.join(" · ")}</p>}
            {projeto.publicacao === "provisorio" && <SeloProvisorio texto={tp("provisorio")} />}
          </div>
          <div className="abertura__lado">
            {tt.has("resumo") && <p className="abertura__resumo">{tt("resumo")}</p>}
            {projeto.colaboracao && (
              <p className="abertura__nota">
                {tp("referenciaNota", projeto.colaboracao)}
              </p>
            )}
            <Link href={`/realisations/${projeto.slug}`} className="botao botao--claro">
              {td("verProjeto")}
              <span className="sr-only">, {tt("titulo")}</span>
              <span className="botao__seta" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </ComProgresso>
  );
}
