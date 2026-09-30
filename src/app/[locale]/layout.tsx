import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cabecalho, type TextosDoCabecalho } from "@/components/Cabecalho";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { CortinaDeNavegacao } from "@/components/movimento/CortinaDeNavegacao";
import { Revelacoes } from "@/components/movimento/Revelacoes";
import { Rodape } from "@/components/Rodape";
import { ScriptInline } from "@/components/ScriptInline";
import { marcaPublicavel } from "@/data/validacoes";
import { caminhoLocalizado, routing, type Locale } from "@/i18n/routing";
import { metadataDaPagina } from "@/lib/metadata";
import { scriptDeArranque } from "@/lib/movimento/entrada";
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
 * O script do `<head>` (`data-movimento` e a decisão da entrada do herói),
 * com a inicial de cada língua sem a barra final: "", "/pt", "/en".
 */
const SCRIPT_DE_MOVIMENTO = scriptDeArranque(
  routing.locales.map((l) => caminhoLocalizado("/", l).replace(/\/$/, "")),
);

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
    lingua: nav("lingua"),
  };

  return (
    <html lang={locale} className={fontes} suppressHydrationWarning>
      <head>
        <ScriptInline codigo={SCRIPT_DE_MOVIMENTO} />
      </head>
      <body>
        {/* `messages={null}`: sem isto, o provider serializa o catálogo inteiro
            no HTML de cada página — e com ele, em publicação, o método por
            validar e os títulos dos projetos provisórios. Nenhum componente
            cliente lê mensagens: recebem os textos já traduzidos. */}
        <NextIntlClientProvider messages={null}>
          <a href="#conteudo" className="saltar">
            {nav("saltar")}
          </a>
          <Cabecalho textos={textosDoCabecalho} locale={locale} />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <Rodape locale={locale} />
          <Revelacoes />
          <CortinaDeNavegacao comFolha={marcaPublicavel("folha")} />
        </NextIntlClientProvider>
        <DadosEstruturados descricao={t("descricao")} />
      </body>
    </html>
  );
}
