import { ViewTransition } from "react";
import { getTranslations } from "next-intl/server";
import { projetosEmDestaque, type Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";
import { ComProgresso } from "../movimento/ComProgresso";
import { SeloProvisorio } from "../SeloProvisorio";
import { VideoMudo } from "../VideoMudo";

/**
 * # Projetos em destaque — o segundo momento de movimento
 *
 * Uma pilha: cada projeto ocupa um ecrã inteiro — a fotografia (ou o vídeo) é
 * o fundo, de ponta a ponta —, fica preso ao topo, e o seguinte sobe e
 * cobre-o. O que fica para trás recua um pouco e escurece
 * (`--coberto`); o que chega assenta a imagem e o título (`--entrada`). Tudo
 * `position: sticky` — a pilha é CSS, o motor só escreve as duas variáveis.
 *
 * No telemóvel e com menos movimento não há pilha: é uma sequência vertical
 * simples (ver `inicio.css`).
 *
 * O texto que se lê fica sempre claro, sobre um véu do lado onde assenta: por
 * baixo dele as fotografias misturam céu e relva, e nenhuma cor automática
 * lia bem em todas. Quem muda de cor com a fotografia é o número gigante do
 * projeto, que é só decoração (`mix-blend-mode`, em `inicio.css`).
 *
 * A imagem de cada cartão tem o mesmo nome de transição que a abertura da
 * página do projeto: ao abrir, é a mesma imagem que cresce até lá.
 */
export async function ProjetosEmDestaque({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "destaque" });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const projetos = projetosEmDestaque(4);
  if (projetos.length === 0) return null;

  const textosDoVideo = {
    pausa: tp("video.pausa"),
    ler: tp("video.ler"),
    rever: tp("video.rever"),
  };

  return (
    <section className="destaque escuro" aria-labelledby="destaque-titulo">
      <div className="envelope destaque__topo">
        <p className="legenda suave" data-revelar="">
          <span>02</span> {t("titulo")}
        </p>
        <h2 id="destaque-titulo" className="titulo-seccao" data-revelar="">
          {t("intro")}
        </h2>
        <Link
          href="/realisations"
          className="ligacao-seta destaque__todos"
          data-revelar=""
        >
          {t("verTodos")}
          <span className="botao__seta" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <ol className="destaque__pilha">
        {projetos.map((projeto, i) => (
          <ComProgresso
            key={projeto.slug}
            as="li"
            modo="entrada"
            modoExtra="coberto"
            className="destaque__cartao"
            data-sob-cabecalho=""
            aria-labelledby={`destaque-${projeto.slug}`}
          >
            <Cartao
              projeto={projeto}
              indice={i}
              total={projetos.length}
              locale={locale}
              textosDoVideo={textosDoVideo}
              verProjeto={t("verProjeto")}
              provisorio={tp("provisorio")}
            />
          </ComProgresso>
        ))}
      </ol>
    </section>
  );
}

async function Cartao({
  projeto,
  indice,
  total,
  locale,
  textosDoVideo,
  verProjeto,
  provisorio,
}: {
  projeto: Projeto;
  indice: number;
  total: number;
  locale: Locale;
  textosDoVideo: { pausa: string; ler: string; rever: string };
  verProjeto: string;
  provisorio: string;
}) {
  const t = await getTranslations({
    locale,
    namespace: `projetos.${projeto.slug}`,
  });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const href = `/realisations/${projeto.slug}`;
  const numero = (n: number) => String(n).padStart(2, "0");

  const meta = [
    projeto.local,
    projeto.missao ? tp(`missoes.${projeto.missao}`) : null,
    projeto.periodo,
  ].filter(Boolean);

  return (
    <div className="destaque__interior" data-sem-cortina="">
      {/* Sem cortina (`data-sem-cortina`): a fotografia do cartão faz o morph
          até à abertura do projeto, e a cortina escondia-o. */}
      <div className="destaque__media">
        <ViewTransition
          name={`projeto-${projeto.slug}`}
          share="morph"
          default="none"
        >
          <div className="destaque__moldura">
            {projeto.video ? (
              <VideoMudo
                id={projeto.video}
                rotulo={medias(`videos.${projeto.video}`)}
                textos={textosDoVideo}
                className="destaque__video"
              />
            ) : (
              <Foto
                id={projeto.capa}
                alt={medias(projeto.capa)}
                sizes="100vw"
                foco={projeto.foco}
                className="destaque__foto"
              />
            )}
          </div>
        </ViewTransition>
      </div>

      <div className="destaque__veu" aria-hidden="true" />
      <p className="destaque__indice" aria-hidden="true">
        {numero(indice + 1)}
      </p>

      <div className="envelope destaque__envelope">
        <div className="destaque__texto">
          <p className="legenda suave destaque__numero">
            {numero(indice + 1)} <span aria-hidden="true">/</span>{" "}
            {numero(total)}
          </p>
          <h3 id={`destaque-${projeto.slug}`} className="destaque__titulo">
            {t("titulo")}
          </h3>
          {t.has("resumo") && (
            <p className="destaque__resumo suave">{t("resumo")}</p>
          )}
          {meta.length > 0 && (
            <p className="legenda destaque__meta">{meta.join(" · ")}</p>
          )}
          {projeto.publicacao === "provisorio" && (
            <SeloProvisorio texto={provisorio} />
          )}
          {/* Um só link por cartão; o `::after` dele cobre o cartão inteiro, e
            por isso a imagem também leva ao projeto (ver `inicio.css`). */}
          <Link href={href} className="botao botao--claro destaque__botao">
            {verProjeto}
            <span className="sr-only">, {t("titulo")}</span>
            <span className="botao__seta" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
