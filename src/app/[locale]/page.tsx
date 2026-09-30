import { setRequestLocale } from "next-intl/server";
import { ChamadaContacto } from "@/components/ChamadaContacto";
import { Apresentacao } from "@/components/inicio/Apresentacao";
import { Equipa } from "@/components/inicio/Equipa";
import { Especialidades } from "@/components/inicio/Especialidades";
import { Heroi } from "@/components/inicio/Heroi";
import { Metodo } from "@/components/inicio/Metodo";
import { ProjetosEmDestaque } from "@/components/inicio/ProjetosEmDestaque";
import type { Locale } from "@/i18n/routing";
import "../inicio.css";

/**
 * A página inicial, pela ordem do brief:
 *
 *   herói → a empresa → projetos em destaque → expertises → método → equipa
 *   → "Parlons de votre projet." → rodapé
 *
 * Três momentos de movimento (o herói, a pilha de projetos, a entrada da
 * equipa e da marca no fecho); o resto só aparece, uma vez, sem insistir.
 * A metadata é a do layout (`metadata.inicio`).
 */
export default async function Inicio({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);

  return (
    <>
      <Heroi locale={locale} />
      <Apresentacao locale={locale} />
      <ProjetosEmDestaque locale={locale} />
      <Especialidades locale={locale} />
      <Metodo locale={locale} />
      <Equipa locale={locale} />
      <ChamadaContacto locale={locale} />
    </>
  );
}
