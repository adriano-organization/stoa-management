import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { Bloco } from "@/data/projetos";
import type { Locale } from "@/i18n/routing";
import type { IdImagem } from "@/lib/medias";
import { Foto } from "../Foto";
import { ComProgresso } from "../movimento/ComProgresso";
import { VideoMudo } from "../VideoMudo";

/**
 * A galeria de um projeto, em blocos que alternam de escala: uma imagem a toda
 * a largura, um par, um vídeo, uma sequência de etapas. É a ordem dos blocos
 * em `src/data/projetos.ts` que faz o ritmo — nunca uma grelha de miniaturas.
 *
 * Os `capitulos` do relato entram antes de cada bloco, um a um: texto,
 * imagem, texto. A página lê-se como a obra andou, e as imagens deixam de
 * ser um álbum solto depois do texto. Os que sobram ficam no fim.
 *
 * Cada imagem vive num quadro de proporção fixa, preso às linhas da grelha:
 * as fotografias têm formatos diferentes, e deixadas no tamanho natural
 * ficavam cada uma à sua altura. O quadro recebe `--p` (modo `fluxo`) e o
 * CSS abre-o de um recorte e faz a fotografia deslizar lá dentro.
 */
export async function Galeria({
  blocos,
  capitulos = [],
  locale,
}: {
  blocos: Bloco[];
  capitulos?: ReactNode[];
  locale: Locale;
}) {
  if (blocos.length === 0 && capitulos.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "projeto" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const textosDoVideo = { pausa: t("video.pausa"), ler: t("video.ler"), rever: t("video.rever") };

  /* A numeração corre pela página toda, como as figuras de um caderno de
     obra; e os blocos largos alternam de lado, como os capítulos. */
  let figuras = 0;
  let largos = 0;

  const sequencia = Array.from({ length: Math.max(blocos.length, capitulos.length) }, (_, i) => [
    capitulos[i],
    blocos[i] && desenhar(blocos[i], `bloco-${i}`),
  ]).flat();

  return (
    <section className="galeria" aria-label={capitulos.length ? t("relato") : t("galeria")}>
      {sequencia}
    </section>
  );

  function legenda(texto: string) {
    figuras += 1;
    return (
      /* O texto alternativo já diz o mesmo a quem usa um leitor de ecrã. */
      <figcaption className="galeria__legenda" aria-hidden="true">
        <span className="legenda">{t("figura", { n: String(figuras).padStart(2, "0") })}</span>
        <span className="suave">{texto}</span>
      </figcaption>
    );
  }

  function imagem(id: IdImagem, sizes: string) {
    return (
      <div className="galeria__quadro">
        <Foto id={id} alt={medias(id)} sizes={sizes} />
      </div>
    );
  }

  function desenhar(bloco: Bloco, chave: string) {
    switch (bloco.tipo) {
      case "largo":
        return (
          <div key={chave} className="envelope">
            <ComProgresso
              as="figure"
              modo="fluxo"
              className={`galeria__largo ${largos++ % 2 ? "galeria__largo--fim" : ""}`}
            >
              {imagem(bloco.imagem, "(min-width: 1400px) 1280px, 92vw")}
              {legenda(medias(bloco.imagem))}
            </ComProgresso>
          </div>
        );
      case "par":
        return (
          <div key={chave} className="galeria__par envelope">
            {bloco.imagens.map((id, j) => (
              <ComProgresso key={id} as="figure" modo="fluxo" className={`galeria__par-${j ? "segunda" : "primeira"}`}>
                {imagem(id, j ? "(min-width: 900px) 46vw, 70vw" : "(min-width: 900px) 62vw, 92vw")}
                {legenda(medias(id))}
              </ComProgresso>
            ))}
          </div>
        );
      case "video":
        return (
          <div key={chave} className="envelope">
            <ComProgresso
              as="figure"
              modo="fluxo"
              className={`galeria__largo galeria__video ${largos++ % 2 ? "galeria__largo--fim" : ""}`}
            >
              <div className="galeria__quadro">
                <VideoMudo id={bloco.video} rotulo={medias(`videos.${bloco.video}`)} textos={textosDoVideo} />
              </div>
              {legenda(medias(`videos.${bloco.video}`))}
            </ComProgresso>
          </div>
        );
      case "etapas":
        return (
          <section key={chave} className="galeria__etapas envelope" aria-labelledby={`etapas-${chave}`}>
            <div className="galeria__etapas-topo">
              <h2 id={`etapas-${chave}`} className="texto-grande">
                {t("etapas")}
              </h2>
              <p className="suave">{t("etapasNota")}</p>
            </div>
            <ol className="galeria__etapas-lista">
              {bloco.imagens.map((id, j) => (
                <ComProgresso
                  key={id}
                  as="li"
                  modo="fluxo"
                  style={{ "--atraso": `${j * 0.06}` } as React.CSSProperties}
                >
                  <p className="legenda suave">{t("etapa", { n: j + 1 })}</p>
                  {imagem(id, "(min-width: 900px) 30vw, 92vw")}
                </ComProgresso>
              ))}
            </ol>
          </section>
        );
    }
  }
}
