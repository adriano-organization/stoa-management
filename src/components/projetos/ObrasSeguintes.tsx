import { ViewTransition, type CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import type { Projeto } from "@/data/projetos";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Foto } from "../Foto";
import { ComProgresso } from "../movimento/ComProgresso";
import { SeloProvisorio } from "../SeloProvisorio";
import { Trilho } from "./Trilho";

/**
 * O fim de cada página de projeto: as obras seguintes, com o mecanismo do
 * trilho do portefólio (preso ao ecrã, a andar de lado enquanto a página
 * desce) mas outra cara, para não parecer a página das obras repetida: fundo
 * de pedra, o título num painel fixo à esquerda por baixo do qual os cartões
 * passam, e cada cartão encabeçado como uma planta ("01 ——— local").
 *
 * Parado, ficam lado a lado; no telemóvel, numa fila que se desliza com o
 * dedo.
 */
export async function ObrasSeguintes({ projetos, locale }: { projetos: Projeto[]; locale: Locale }) {
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const tr = await getTranslations({ locale, namespace: "realisations" });

  return (
    <Trilho
      className="seguintes"
      prefixo="seguintes"
      sobCabecalho={false}
      aria-labelledby="seguintes-titulo"
      style={{ "--n": projetos.length } as CSSProperties}
    >
      <div className="seguintes__palco">
        <div className="seguintes__painel">
          <h2 id="seguintes-titulo" className="seguintes__titulo-seccao">
            {tp("outras")}
          </h2>
          <p className="seguintes__progresso legenda suave" aria-hidden="true">
            <span>{tr("percorrer")}</span>
            <span className="seguintes__barra" />
          </p>
          <Link href="/realisations" className="ligacao seguintes__todas">
            {tp("voltar")} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ol className="seguintes__fila">
          {projetos.map((projeto, i) => (
            <CartaoSeguinte key={projeto.slug} projeto={projeto} numero={i + 1} locale={locale} />
          ))}
        </ol>
      </div>
    </Trilho>
  );
}

/**
 * Um cartão: a cota com o número e o local, a capa, o título. Mede a sua
 * própria chegada (`lateral`), como os do portefólio: o fio da cota
 * desenha-se e a fotografia desliza dentro da moldura.
 *
 * A capa tem o nome de transição da abertura do projeto: é a mesma imagem
 * que cresce até lá.
 */
async function CartaoSeguinte({ projeto, numero, locale }: { projeto: Projeto; numero: number; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: `projetos.${projeto.slug}` });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const medias = await getTranslations({ locale, namespace: "medias" });
  const meta = [projeto.local, projeto.periodo].filter(Boolean).join(" · ");

  return (
    <ComProgresso as="li" modo="lateral" className="seguintes__cartao" data-revelar="">
      <Link href={`/realisations/${projeto.slug}`} className="seguintes__ligacao">
        <span className="seguintes__cota legenda">
          <span>{String(numero).padStart(2, "0")}</span>
          <span className="seguintes__fio" aria-hidden="true" />
          {meta && <span className="seguintes__meta suave">{meta}</span>}
        </span>
        <ViewTransition name={`projeto-${projeto.slug}`} share="morph" default="none">
          <span className="seguintes__moldura">
            <Foto
              id={projeto.capa}
              alt={medias(projeto.capa)}
              sizes="(min-width: 900px) 40vw, 80vw"
              foco={projeto.foco}
              antecipar
            />
          </span>
        </ViewTransition>
        <span className="seguintes__titulo">
          {t("titulo")}
          <span className="botao__seta" aria-hidden="true">
            →
          </span>
        </span>
      </Link>
      {projeto.publicacao === "provisorio" && (
        <SeloProvisorio texto={tp("provisorio")} className="seguintes__selo" />
      )}
    </ComProgresso>
  );
}
