import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { IdImagem } from "@/lib/medias";
import { Foto } from "../Foto";
import { ListaDeEspecialidades } from "./ListaDeEspecialidades";

const ITENS: { chave: "preparacao" | "financas" | "direcao"; imagem: IdImagem; foco?: string }[] = [
  { chave: "preparacao", imagem: "plan-annote", foco: "50% 40%" },
  { chave: "financas", imagem: "bureau-poste", foco: "55% 60%" },
  { chave: "direcao", imagem: "terrain-i-etape3-a" },
];

/**
 * As três competências do site atual, numeradas. O texto está sempre todo à
 * vista; passar o rato (ou tocar) num item só troca a imagem ao lado — a
 * imagem ilustra, não informa, por isso ninguém perde nada sem ela.
 */
export async function Especialidades({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "especialidades" });
  const medias = await getTranslations({ locale, namespace: "medias" });

  const itens = ITENS.map((item, i) => ({
    chave: item.chave,
    numero: String(i + 1).padStart(2, "0"),
    titulo: t(`itens.${item.chave}.titulo`),
    resumo: t(`itens.${item.chave}.resumo`),
    detalhe: t(`itens.${item.chave}.detalhe`),
    imagem: (
      <Foto
        id={item.imagem}
        alt={medias(item.imagem)}
        sizes="(min-width: 900px) 40vw, 100vw"
        foco={item.foco}
        className="especialidade__foto"
      />
    ),
  }));

  return (
    <section id="expertises" className="especialidades" aria-labelledby="especialidades-titulo">
      <div className="envelope">
        <div className="especialidades__topo">
          <p className="legenda suave" data-revelar="">
            <span>03</span> {t("titulo")}
          </p>
          <h2 id="especialidades-titulo" className="titulo-seccao" data-revelar="">
            {t("intro")}
          </h2>
        </div>
        <ListaDeEspecialidades itens={itens} />
      </div>
    </section>
  );
}
