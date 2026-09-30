import { getTranslations } from "next-intl/server";
import type { Bloco } from "@/data/projetos";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";
import { VideoMudo } from "../VideoMudo";

/**
 * A galeria de um projeto, em blocos que alternam de escala: uma imagem a toda
 * a largura, um par, um vídeo, uma sequência de etapas. É a ordem dos blocos
 * em `src/data/projetos.ts` que faz o ritmo — nunca uma grelha de miniaturas.
 */
export async function Galeria({ blocos, locale }: { blocos: Bloco[]; locale: Locale }) {
  if (blocos.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "projeto" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const textosDoVideo = { pausa: t("video.pausa"), ler: t("video.ler"), rever: t("video.rever") };

  return (
    <section className="galeria" aria-label={t("galeria")}>
      {blocos.map((bloco, i) => {
        switch (bloco.tipo) {
          case "largo":
            return (
              <figure key={i} className="galeria__largo envelope" data-revelar="">
                <Foto id={bloco.imagem} alt={medias(bloco.imagem)} sizes="(min-width: 1400px) 1280px, 92vw" />
              </figure>
            );
          case "par":
            return (
              <div key={i} className="galeria__par envelope">
                {bloco.imagens.map((imagem, j) => (
                  <figure key={imagem} data-revelar="" style={{ "--atraso": `${j * 120}ms` } as React.CSSProperties}>
                    <Foto id={imagem} alt={medias(imagem)} sizes="(min-width: 900px) 46vw, 92vw" />
                  </figure>
                ))}
              </div>
            );
          case "video":
            return (
              <figure key={i} className="galeria__video envelope" data-revelar="">
                <VideoMudo id={bloco.video} rotulo={medias(`videos.${bloco.video}`)} textos={textosDoVideo} />
              </figure>
            );
          case "etapas":
            return (
              <section key={i} className="galeria__etapas envelope" aria-labelledby={`etapas-${i}`}>
                <div className="galeria__etapas-topo">
                  <h2 id={`etapas-${i}`} className="texto-grande">
                    {t("etapas")}
                  </h2>
                  <p className="suave">{t("etapasNota")}</p>
                </div>
                <ol className="galeria__etapas-lista">
                  {bloco.imagens.map((imagem, j) => (
                    <li
                      key={imagem}
                      data-revelar=""
                      style={{ "--atraso": `${j * 140}ms` } as React.CSSProperties}
                    >
                      <p className="legenda suave">{t("etapa", { n: j + 1 })}</p>
                      <Foto id={imagem} alt={medias(imagem)} sizes="(min-width: 900px) 30vw, 92vw" />
                    </li>
                  ))}
                </ol>
              </section>
            );
        }
      })}
    </section>
  );
}
