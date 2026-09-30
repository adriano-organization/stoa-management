import { getTranslations } from "next-intl/server";
import { perfisVisiveis } from "@/data/equipa";
import type { Locale } from "@/i18n/routing";
import { EM_PUBLICACAO } from "@/lib/publicacao";
import { Foto } from "../Foto";
import { SeloProvisorio } from "../SeloProvisorio";

/**
 * A equipa — o terceiro momento de movimento: os retratos abrem-se de baixo
 * para cima, um a seguir ao outro, quando a secção entra.
 *
 * Retratos grandes (4:5), nome, função, uma apresentação curta. Hoje os três
 * perfis estão por preencher: em aperçu aparecem placeholders identificados;
 * em publicação, a secção só existe quando houver pelo menos um perfil
 * completo (ver `src/data/equipa.ts`).
 */
export async function Equipa({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "equipa" });
  const perfis = perfisVisiveis();
  if (perfis.length === 0) return null;

  const incompletos = perfis.some((p) => !p.nome || !p.retrato);

  return (
    <section className="equipa" aria-labelledby="equipa-titulo">
      <div className="envelope">
        <div className="equipa__topo">
          <p className="legenda suave" data-revelar="">
            <span>05</span> {t("titulo")}
          </p>
          <h2 id="equipa-titulo" className="titulo-seccao" data-revelar="">
            {t("intro")}
          </h2>
          {incompletos && <SeloProvisorio texto={t("aviso")} />}
        </div>

        <ul className="equipa__lista">
          {perfis.map((perfil, i) => {
            const chave = `perfis.${perfil.id}`;
            /* Em publicação, o que falta simplesmente não aparece; em aperçu,
               aparece o placeholder, para se ver o que está por preencher. */
            const ouVazio = (valor: string | null, vazio: string) =>
              valor ?? (EM_PUBLICACAO ? null : t(vazio));
            const nome = ouVazio(perfil.nome, "vazio.nome");
            const funcao = ouVazio(t.has(`${chave}.funcao`) ? t(`${chave}.funcao`) : null, "vazio.funcao");
            const apresentacao = ouVazio(
              t.has(`${chave}.apresentacao`) ? t(`${chave}.apresentacao`) : null,
              "vazio.apresentacao",
            );

            return (
              <li
                key={perfil.id}
                className="equipa__perfil"
                data-revelar=""
                style={{ "--atraso": `${i * 140}ms` } as React.CSSProperties}
              >
                <div className="equipa__retrato" data-vazio={perfil.retrato ? undefined : ""}>
                  {perfil.retrato ? (
                    <Foto
                      id={perfil.retrato}
                      alt={perfil.nome ?? ""}
                      sizes="(min-width: 900px) 30vw, 90vw"
                    />
                  ) : (
                    <p className="legenda suave">{t("vazio.retrato")}</p>
                  )}
                </div>
                {nome && <h3 className="equipa__nome">{nome}</h3>}
                {funcao && <p className="legenda suave equipa__funcao">{funcao}</p>}
                {apresentacao && <p className="equipa__apresentacao suave">{apresentacao}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
