import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cabecalho, type TextosDoCabecalho } from "@/components/Cabecalho";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Revelacoes } from "@/components/movimento/Revelacoes";
import { Rodape } from "@/components/Rodape";
import { routing, type Locale } from "@/i18n/routing";
import { metadataDaPagina } from "@/lib/metadata";
import { fontes } from "../fontes";
import "../globals.css";
import "../site.css";

/** As línguas geram-se no `build`; não há renderização a pedido. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.inicio" });
  const marca = await getTranslations({ locale, namespace: "marca" });

  const base = await metadataDaPagina({
    locale: locale as Locale,
    rota: "/",
    titulo: t("titulo"),
    descricao: t("descricao"),
  });

  return {
    ...base,
    /* O `%s` é o título de cada página; a inicial usa o `default`. */
    title: { default: t("titulo"), template: `%s · ${marca("nome")}` },
  };
}

export const viewport: Viewport = {
  themeColor: "#f2eee7",
};

/**
 * Marca o `<html>` com `data-movimento` **antes da primeira pintura**, a quem
 * não pediu menos movimento. É isso que permite ao CSS esconder o que vai ser
 * revelado sem nunca esconder nada a quem não tem JavaScript ou não quer
 * animações. Texto fixo, sem dados de fora — ver `src/lib/cabecalhos.ts`.
 */
const SCRIPT_DE_MOVIMENTO = `try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches)document.documentElement.setAttribute("data-movimento","")}catch(e){}`;

export default async function LayoutDoSite({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  /* Sem isto, qualquer componente que peça traduções obriga a página a passar
     a dinâmica — e perde-se a geração estática. */
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "metadata.inicio" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  /* Os textos vão como props, já traduzidos, e não pelo `useTranslations` do
     cliente: assim o cabeçalho não obriga a mandar as mensagens todas para o
     browser. */
  const textosDoCabecalho: TextosDoCabecalho = {
    inicio: nav("inicio"),
    principal: nav("principal"),
    realisations: nav("realisations"),
    expertises: nav("expertises"),
    aPropos: nav("aPropos"),
    contact: nav("contact"),
    menu: nav("menu"),
    fechar: nav("fechar"),
  };

  return (
    <html lang={locale} className={fontes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DE_MOVIMENTO }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <a href="#conteudo" className="saltar">
            {nav("saltar")}
          </a>
          <Cabecalho textos={textosDoCabecalho} />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <Rodape locale={locale} />
          <Revelacoes />
        </NextIntlClientProvider>
        <DadosEstruturados descricao={t("descricao")} />
      </body>
    </html>
  );
}
