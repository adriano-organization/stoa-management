import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { HEROI, poligono, type Composicao } from "@/data/heroi";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { srcDe, srcsetDe } from "@/lib/medias";
import { ComProgresso } from "../movimento/ComProgresso";

/**
 * # O herói — "STOA derrière l'ouvrage"
 *
 * Camadas, de trás para a frente (geometria em `src/data/heroi.ts`):
 *
 * 1. a fotografia;
 * 2. a palavra STOA, num SVG com o mesmo sistema de coordenadas da fotografia
 *    (é o `viewBox` que a prende ao edifício em qualquer ecrã);
 * 3. a mesma fotografia, recortada pelo contorno do edifício — por isso a
 *    marca fica atrás dele;
 * 4. o título, o subtítulo e as duas ações, legíveis e clicáveis desde o
 *    primeiro instante.
 *
 * **Em ecrã deitado** a secção tem ~1,9 alturas de ecrã e o palco fica preso:
 * ao rolar, a fotografia aproxima-se (as duas camadas juntas), a marca afunda
 * atrás da platibanda e o texto sobe e apaga-se. **Em ecrã de pé** (a
 * fotografia da fachada) não há palco preso — só a composição.
 *
 * As duas fotografias são uma só `<picture>` com direção de arte: o browser
 * descarrega apenas a do seu formato, e a segunda `<picture>` (o recorte)
 * reutiliza o mesmo ficheiro.
 */
export async function Heroi({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "heroi" });
  const { paisagem, retrato } = HEROI;

  const variaveis = {
    "--recorte-paisagem": poligono(paisagem),
    "--recorte-retrato": poligono(retrato),
    "--foco-x-paisagem": paisagem.foco.x,
    "--foco-y-paisagem": paisagem.foco.y,
    "--foco-x-retrato": retrato.foco.x,
    "--foco-y-retrato": retrato.foco.y,
    "--zoom-paisagem": origem(paisagem),
    "--zoom-retrato": origem(retrato),
  } as CSSProperties;

  return (
    <ComProgresso
      as="section"
      modo="preso"
      className="heroi escuro"
      aria-labelledby="heroi-titulo"
      data-sob-cabecalho=""
      style={variaveis}
    >
      <div className="heroi__palco">
        <div className="heroi__caixa">
          <FotoDoHeroi className="heroi__foto" prioridade />
          <Marca composicao={paisagem} className="heroi__marca heroi__marca--paisagem" />
          <Marca composicao={retrato} className="heroi__marca heroi__marca--retrato" />
          <FotoDoHeroi className="heroi__foto heroi__recorte" />
          <div className="heroi__aproximacao" aria-hidden="true" />
        </div>

        <div className="heroi__veu" aria-hidden="true" />

        <div className="heroi__conteudo">
          <div className="envelope">
            <h1 id="heroi-titulo" className="heroi__titulo">
              <span>{t("linha1")}</span> <span>{t("linha2")}</span>
            </h1>
            <p className="heroi__subtitulo">{t("subtitulo")}</p>
            <div className="heroi__acoes">
              <Link href="/realisations" className="botao botao--claro">
                {t("ctaRealisations")}
                <span className="botao__seta" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/contact" className="botao botao--contorno">
                {t("ctaContacto")}
                <span className="botao__seta" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        <p className="heroi__defilar legenda" aria-hidden="true">
          <span>{t("defilar")}</span>
          <span className="heroi__defilar-fio" />
        </p>
      </div>
    </ComProgresso>
  );
}

const origem = ({ origemDoZoom, largura, altura }: Composicao) =>
  `${((origemDoZoom.x / largura) * 100).toFixed(2)}% ${((origemDoZoom.y / altura) * 100).toFixed(2)}%`;

/**
 * A fotografia do herói. `alt` vazio de propósito: é o cenário da mensagem,
 * que está inteira no título. As fotografias de projeto, noutras secções,
 * levam descrição.
 */
function FotoDoHeroi({ className, prioridade = false }: { className: string; prioridade?: boolean }) {
  const { paisagem, retrato } = HEROI;
  return (
    <picture className={className}>
      <source
        media="(orientation: portrait)"
        type="image/avif"
        srcSet={srcsetDe(retrato.imagem, "avif")}
        sizes="75vh"
      />
      <source
        media="(orientation: portrait)"
        type="image/webp"
        srcSet={srcsetDe(retrato.imagem, "webp")}
        sizes="75vh"
      />
      <source type="image/avif" srcSet={srcsetDe(paisagem.imagem, "avif")} sizes="100vw" />
      <img
        src={srcDe(paisagem.imagem)}
        srcSet={srcsetDe(paisagem.imagem, "webp")}
        sizes="100vw"
        width={paisagem.largura}
        height={paisagem.altura}
        alt=""
        loading="eager"
        fetchPriority={prioridade ? "high" : undefined}
        decoding={prioridade ? "sync" : "async"}
      />
    </picture>
  );
}

/**
 * A palavra, num SVG com o `viewBox` da fotografia. O `textLength` fixa a
 * largura em píxeis do original; o tamanho da letra dá a altura. Com
 * `lengthAdjust="spacing"` só o espaço entre letras se ajusta — as letras
 * nunca são esticadas.
 */
function Marca({ composicao, className }: { composicao: Composicao; className: string }) {
  const { largura, altura, marca } = composicao;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${largura} ${altura}`}
      aria-hidden="true"
      focusable="false"
    >
      <text x={marca.x} y={marca.linhaDeBase} textLength={marca.largura} lengthAdjust="spacing">
        STOA
      </text>
    </svg>
  );
}
