import { getTranslations } from "next-intl/server";
import { ComProgresso } from "@/components/movimento/ComProgresso";
import { stoa } from "@/data/stoa";
import type { Locale } from "@/i18n/routing";

/**
 * O fecho da página de contacto: o mapa do escritório de ponta a ponta, com a
 * morada num cartão por cima.
 *
 * O mapa são dois SVG nossos, desenhados do OpenStreetMap por
 * `scripts/desenhar-mapa.mjs` (o porquê de não ser um `<iframe>` está no
 * cabeçalho desse script). Primeiro vê-se o traço, como uma planta; ao rolar,
 * o mapa pintado abre-se por cima a partir do escritório. Parado (sem
 * JavaScript, menos movimento) `--p` não existe e o mapa pintado está inteiro.
 *
 * O escritório fica a 64 % da largura e a meio da altura do desenho, e a
 * imagem recorta-se à volta desse ponto (`object-position` em `contact.css`):
 * por isso o alfinete pode estar sempre no mesmo sítio, qualquer que seja a
 * proporção do ecrã.
 */
export async function PlanoDoEscritorio({ locale }: { locale: Locale }) {
  if (!stoa.coordenadas) return null;

  const t = await getTranslations({ locale, namespace: "contacto.mapa" });
  const comum = await getTranslations({ locale, namespace: "comum" });

  const marca = (
    <>
      <span className="plano__marca" />
      <span className="plano__etiqueta legenda">{stoa.nome}</span>
    </>
  );

  return (
    <ComProgresso as="section" modo="entrada" className="plano" id="plano" aria-labelledby="plano-titulo">
      <div className="plano__mapa">
        {/* Decorativo: o mesmo desenho que o de cima, só em linha. */}
        <img className="plano__traco" src="/mapa/farvagny-traco.svg" alt="" width={2850} height={940} loading="lazy" />
        <img className="plano__pintado" src="/mapa/farvagny.svg" alt={t("alt")} width={2850} height={940} loading="lazy" />

        {/* O alfinete é o primeiro sítio onde se toca: leva ao mesmo mapa que o
            botão do cartão. Sem link confirmado fica só a marca. */}
        {stoa.mapa ? (
          <a className="plano__alfinete" href={stoa.mapa} target="_blank" rel="noopener noreferrer" aria-label={t("abrir")}>
            {marca}
          </a>
        ) : (
          <span className="plano__alfinete" aria-hidden="true">
            {marca}
          </span>
        )}

        {/* O crédito é condição da licença ODbL, não decoração. */}
        <p className="plano__credito legenda">
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            {t("credito")}
          </a>
        </p>
      </div>

      <div className="plano__sobre envelope">
        <div className="plano__cartao" data-revelar="">
          <p className="legenda suave">{t("olho")}</p>
          <h2 id="plano-titulo" className="plano__nome">
            {stoa.nome}
          </h2>
          <address className="plano__morada">
            {stoa.morada.rua}
            <br />
            {stoa.morada.codigoPostal} {stoa.morada.localidade}
            <br />
            <span className="suave">{comum("cantao")}</span>
          </address>
          {stoa.mapa && (
            <a className="botao" href={stoa.mapa} target="_blank" rel="noopener noreferrer">
              {t("abrir")}
              <span className="botao__seta" aria-hidden="true">
                ↗
              </span>
            </a>
          )}
        </div>
      </div>
    </ComProgresso>
  );
}
