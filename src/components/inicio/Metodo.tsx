import { getTranslations } from "next-intl/server";
import { textoPublicavel } from "@/data/validacoes";
import type { Locale } from "@/i18n/routing";
import { SeloProvisorio } from "../SeloProvisorio";

const ETAPAS = ["compreender", "preparar", "coordenar", "acompanhar", "entregar"] as const;

/**
 * O método, em cinco passos, da compreensão do projeto à entrega.
 *
 * ⚠️ **É uma proposta editorial**, não um procedimento confirmado: por isso não
 * há prazos, garantias nem números, e em aperçu leva o selo "à valider". O
 * texto vive em `messages/fr-CH.json` (`metodo.etapas`) e é para rever com a
 * STOA antes de publicar. Em publicação, a secção só sai depois de marcada
 * `validado` em `src/data/validacoes.ts` — sem o selo, o texto passaria por
 * definitivo.
 */
export async function Metodo({ locale }: { locale: Locale }) {
  if (!textoPublicavel("metodo")) return null;
  const t = await getTranslations({ locale, namespace: "metodo" });

  return (
    <section className="metodo" aria-labelledby="metodo-titulo">
      <div className="envelope">
        <div className="metodo__topo">
          <p className="legenda suave" data-revelar="">
            <span>04</span> {t("titulo")}
          </p>
          <h2 id="metodo-titulo" className="titulo-seccao" data-revelar="">
            {t("intro")}
          </h2>
          <SeloProvisorio texto={t("aviso")} />
        </div>

        <ol className="metodo__etapas" data-revelar="">
          {ETAPAS.map((etapa, i) => (
            <li key={etapa} className="metodo__etapa" style={{ "--i": i } as React.CSSProperties}>
              <p className="legenda metodo__numero">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="metodo__titulo">{t(`etapas.${etapa}.titulo`)}</h3>
              <p className="metodo__texto suave">{t(`etapas.${etapa}.texto`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
