"use client";

import { useEffect, useRef, useState } from "react";
import { dadosDaImagem, dadosDoVideo, srcDe, type IdVideo } from "@/lib/medias";
import { useMenosMovimento } from "@/lib/movimento/preferencia";

export type TextosDoVideo = { pausa: string; ler: string; rever: string };

/**
 * Um vídeo de drone, sem som, que toca quando está à vista e pára quando sai.
 *
 * - **Uma vez, não em ciclo.** Os cortes são aproximações e voos: em ciclo, o
 *   salto do último para o primeiro fotograma via-se a cada dez segundos. Toca
 *   até ao fim e fica na última imagem; recomeça quando volta a entrar no ecrã.
 * - **A alternativa estática é o poster**, que é a primeira imagem do corte
 *   (sem salto quando arranca). Sem JavaScript, com menos movimento pedido ou
 *   com poupança de dados, o vídeo nunca carrega: fica o poster. Pedir menos
 *   movimento com a página aberta pára o vídeo e volta ao poster.
 * - **Botão de pausa** (WCAG 2.2.2): o corte dura mais de cinco segundos e
 *   arranca sozinho, por isso tem de se poder parar.
 * - `preload="none"`: nada é descarregado antes de o vídeo estar quase à vista.
 */
export function VideoMudo({
  id,
  rotulo,
  textos,
  className,
}: {
  id: IdVideo;
  rotulo: string;
  textos: TextosDoVideo;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const pausadoPeloVisitante = useRef(false);
  const [poupaDados, setPoupaDados] = useState(true);
  const menosMovimento = useMenosMovimento();
  const permitido = !poupaDados && menosMovimento === false;
  const [estado, setEstado] = useState<"parado" | "a-tocar" | "fim">("parado");

  const video = dadosDoVideo(id);
  const poster = dadosDaImagem(video.poster);
  const temMovel = video.variantes.some((v) => v.largura < 1000);

  useEffect(() => {
    const poupa =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (poupa) return;
    /* Decidido depois da hidratação, para o HTML do servidor ser o mesmo para
       toda a gente: é o poster, sem botão. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPoupaDados(false);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!permitido || !el) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && entrada.intersectionRatio >= 0.5) {
          if (pausadoPeloVisitante.current) return;
          if (el.ended) el.currentTime = 0;
          el.play().catch(() => {
            /* Autoplay recusado (iOS em poupança de energia, por exemplo):
               fica o poster, e o botão continua a funcionar. */
          });
        } else if (!entrada.isIntersecting) {
          el.pause();
          /* Fora do ecrã, volta ao princípio: da próxima vez que aparecer,
             a aproximação faz-se outra vez. */
          if (!pausadoPeloVisitante.current && el.currentTime > 0) el.currentTime = 0;
        }
      },
      { threshold: [0, 0.5] },
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      /* Deixou de ser permitido (menos movimento pedido a meio da visita) ou o
         componente saiu: o vídeo pára, e volta à primeira imagem, que é a do
         poster. */
      el.pause();
      if (el.currentTime > 0) el.currentTime = 0;
      pausadoPeloVisitante.current = false;
    };
  }, [permitido]);

  function alternar() {
    const el = ref.current;
    if (!el) return;
    if (estado === "a-tocar") {
      pausadoPeloVisitante.current = true;
      el.pause();
    } else {
      pausadoPeloVisitante.current = false;
      if (el.ended) el.currentTime = 0;
      el.play().catch(() => {});
    }
  }

  return (
    <div className={`video-mudo ${className ?? ""}`}>
      <video
        ref={ref}
        muted
        playsInline
        preload="none"
        poster={srcDe(video.poster, 1280)}
        width={video.largura}
        height={video.altura}
        aria-label={rotulo}
        style={{ backgroundColor: poster.cor }}
        onPlay={() => setEstado("a-tocar")}
        onPause={(e) => setEstado(e.currentTarget.ended ? "fim" : "parado")}
        onEnded={() => setEstado("fim")}
      >
        {/* O `media` no `<source>` escolhe a variante leve nos ecrãs estreitos. */}
        {temMovel && (
          <source
            src={`/medias/${id}-${video.variantes[video.variantes.length - 1].largura}.mp4`}
            type="video/mp4"
            media="(max-width: 767px)"
          />
        )}
        <source src={`/medias/${id}-${video.variantes[0].largura}.mp4`} type="video/mp4" />
      </video>
      {permitido && (
        <button type="button" className="video-mudo__botao" onClick={alternar}>
          <span aria-hidden="true" className="video-mudo__icone" data-estado={estado} />
          <span className="sr-only">
            {estado === "a-tocar" ? textos.pausa : estado === "fim" ? textos.rever : textos.ler}
          </span>
        </button>
      )}
    </div>
  );
}
