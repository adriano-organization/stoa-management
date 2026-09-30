import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * O 404 de dentro do site: já se sabe a língua, por isso o texto vem das
 * mensagens e o visitante fica com o cabeçalho e o rodapé à volta.
 */
export default function NaoEncontrada() {
  const t = useTranslations("naoEncontrada");

  return (
    <section className="nao-encontrada envelope">
      <p className="legenda suave">{t("etiqueta")}</p>
      <h1 className="titulo-display">{t("titulo")}</h1>
      <p className="texto-medio suave">{t("texto")}</p>
      <div className="nao-encontrada__acoes">
        <Link href="/" className="botao">
          {t("inicio")}
          <span className="botao__seta" aria-hidden="true">
            →
          </span>
        </Link>
        <Link href="/realisations" className="botao botao--contorno">
          {t("realisations")}
        </Link>
      </div>
    </section>
  );
}
