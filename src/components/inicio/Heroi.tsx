import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { HEROI, caminho, plantaDe, poligono, type Composicao } from "@/data/heroi";
import { imagemPublicavel } from "@/data/validacoes";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { srcDe, srcsetDe } from "@/lib/medias";
import { ComProgresso } from "../movimento/ComProgresso";
import { EntradaDoHeroi } from "./EntradaDoHeroi";

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
 * **A entrada** (só na primeira visita à inicial em cada sessão, ~2,85 s, CSS):
 * sobre pedra, linhas de construção e a planta do edifício desenham-se (lidas
 * na fotografia, `plantaDe`); os volumes ganham corpo; a fotografia sobe
 * dentro da silhueta; o contexto entra, as linhas apagam-se e fica a
 * composição de sempre — a marca sobe por trás, o título e os botões chegam.
 * Quem decide se há entrada, e a acaba se o visitante mexer, é
 * `EntradaDoHeroi.tsx`. As camadas da entrada (`__pedra`, `__obra`,
 * `__planta`) só se veem com `html[data-intro]`; sem ele, o herói é o de
 * sempre.
 *
 * **Em ecrã deitado** a secção tem ~1,9 alturas de ecrã e o palco fica preso:
 * ao rolar, a fotografia aproxima-se (as duas camadas juntas), a marca afunda
 * atrás da platibanda e o texto sobe e apaga-se. **Em ecrã de pé** (a
 * fotografia da fachada) não há palco preso — só a composição. Sem
 * JavaScript ou com menos movimento pedido também não: o herói tem a altura
 * de um ecrã e fica parado, em vez de prender a fotografia sem razão.
 *
 * Em publicação, as fotografias só entram depois de validadas em
 * `src/data/validacoes.ts`; até lá o herói fica no carvão, com a marca, o
 * título e as ações.
 *
 * Quando o texto já se apagou, os botões deixam de receber o rato
 * (`LIMIAR_DE_SAIDA`); se o teclado lá chegar, o texto volta a ver-se.
 *
 * As duas fotografias são uma só `<picture>` com direção de arte: o browser
 * descarrega apenas a do seu formato, e a segunda `<picture>` (o recorte)
 * reutiliza o mesmo ficheiro.
 */
/**
 * O texto apaga-se com `1 - 1,7·p` (`inicio.css`, `.heroi__conteudo`): a 0,53
 * resta-lhe menos de um décimo da opacidade, e a 0,59 já não se vê.
 */
const LIMIAR_DE_SAIDA = 0.53;

export async function Heroi({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "heroi" });
  const { paisagem, retrato } = HEROI;
  const comFotografia = imagemPublicavel(paisagem.imagem) && imagemPublicavel(retrato.imagem);

  const variaveis = {
    "--recorte-paisagem": poligono(paisagem),
    "--recorte-retrato": poligono(retrato),
    "--silhueta-paisagem": poligono(paisagem, plantaDe(paisagem).silhueta),
    "--silhueta-retrato": poligono(retrato, plantaDe(retrato).silhueta),
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
      limiar={LIMIAR_DE_SAIDA}
      className="heroi escuro"
      aria-labelledby="heroi-titulo"
      data-sob-cabecalho=""
      style={variaveis}
    >
      {/* `data-com-foto`: a entrada só existe com fotografia (em publicação,
          antes de validada, o herói é o carvão com a marca). */}
      <div className="heroi__palco" data-com-foto={comFotografia ? "" : undefined}>
        {comFotografia && <EntradaDoHeroi />}
        <div className="heroi__caixa">
          {comFotografia && <FotoDoHeroi className="heroi__foto" prioridade />}
          {comFotografia && <div className="heroi__pedra" aria-hidden="true" />}
          <Marca composicao={paisagem} className="heroi__marca heroi__marca--paisagem" />
          <Marca composicao={retrato} className="heroi__marca heroi__marca--retrato" />
          {comFotografia && <FotoDoHeroi className="heroi__foto heroi__recorte" />}
          {comFotografia && (
            <>
              <FotoDoHeroi className="heroi__foto heroi__obra" />
              <Planta composicao={paisagem} className="heroi__planta heroi__planta--paisagem" />
              <Planta composicao={retrato} className="heroi__planta heroi__planta--retrato" />
            </>
          )}
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

/**
 * A planta da entrada: linhas de construção, superfícies e arestas, no mesmo
 * `viewBox` da fotografia — ficam presas ao edifício em qualquer ecrã, como a
 * marca e o recorte. `pathLength="1"` deixa o CSS desenhar cada traço de 1 a 0
 * sem saber o comprimento real; `--i` é a ordem em que se desenham.
 */
function Planta({ composicao, className }: { composicao: Composicao; className: string }) {
  const { largura, altura } = composicao;
  const { guias, tracos, superficies } = plantaDe(composicao);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="heroi__guias">
        {guias.map((guia, i) => (
          <path key={i} d={caminho([guia])} pathLength={1} style={{ "--i": i } as CSSProperties} />
        ))}
      </g>
      <g className="heroi__superficies">
        {superficies.map(({ pontos, tom }, i) => (
          <path key={i} d={`${caminho([pontos])}Z`} style={{ "--tom": tom } as CSSProperties} />
        ))}
      </g>
      <g className="heroi__tracos">
        {tracos.map((traco, i) => (
          <path key={i} d={caminho([traco])} pathLength={1} style={{ "--i": i } as CSSProperties} />
        ))}
      </g>
    </svg>
  );
}
