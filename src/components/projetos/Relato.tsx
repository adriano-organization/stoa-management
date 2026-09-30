import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ComProgresso } from "@/components/movimento/ComProgresso";
import { SeloProvisorio } from "@/components/SeloProvisorio";
import { relatoPublicavel, type Projeto } from "@/data/projetos";
import type { Locale } from "@/i18n/routing";

/* A ordem é a da obra: o que se pediu, o que se fez, o que se entregou. Um
   projeto pode não ter os três — o que falta nas mensagens não aparece. */
const CAPITULOS = ["projeto", "obra", "entrega"] as const;

/**
 * Os capítulos do relato de um projeto, já prontos para a página os intercalar
 * com as imagens. Em publicação, um relato `exemplo` não devolve nada: as
 * lacunas (o que só a STOA pode dizer) nunca chegam ao público.
 */
export async function capitulosDoRelato(projeto: Projeto, locale: Locale): Promise<ReactNode[]> {
  if (!relatoPublicavel(projeto)) return [];

  const t = await getTranslations({ locale, namespace: `projetos.${projeto.slug}` });
  const tp = await getTranslations({ locale, namespace: "projeto" });
  const presentes = CAPITULOS.filter((id) => t.has(`relato.${id}`));

  return presentes.map((id, i) => (
    <ComProgresso
      key={id}
      as="section"
      modo="fluxo"
      className={`capitulo ${i % 2 ? "capitulo--inverso" : ""} envelope`}
      aria-labelledby={`capitulo-${id}`}
    >
      <p className="capitulo__numero" aria-hidden="true">
        {String(i + 1).padStart(2, "0")}
      </p>
      <div className="capitulo__corpo" data-revelar="">
        <h2 id={`capitulo-${id}`} className="legenda suave">
          {tp(`capitulos.${id}`)}
        </h2>
        <p className="capitulo__texto">
          {t.rich(`relato.${id}`, {
            lacuna: (conteudo) => (
              <span className="lacuna">
                <span className="sr-only">{tp("lacuna")} </span>
                {conteudo}
              </span>
            ),
          })}
        </p>
        {i === 0 && projeto.relato === "exemplo" && <SeloProvisorio texto={tp("relatoExemplo")} />}
      </div>
    </ComProgresso>
  ));
}
