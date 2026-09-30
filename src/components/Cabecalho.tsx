"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { NOMES_DAS_LINGUAS, caminhoLocalizado, routing, type Locale } from "@/i18n/routing";
import { EVENTO_DA_ENTRADA, pedirEntrada } from "@/lib/movimento/entrada";
import { Marca } from "./Marca";

export type TextosDoCabecalho = {
  inicio: string;
  principal: string;
  realisations: string;
  expertises: string;
  aPropos: string;
  contact: string;
  menu: string;
  fechar: string;
  lingua: string;
};

/**
 * O cabeçalho fixo.
 *
 * - **Sobre a fotografia** do herói é transparente e claro; depois ganha fundo.
 *   A página diz onde há fotografia por baixo com `data-sob-cabecalho` (o
 *   herói, e cada projeto em destaque, que é uma fotografia de ponta a ponta).
 * - **Esconde-se a descer e volta a subir**, para as imagens terem o ecrã
 *   inteiro. Nunca se esconde enquanto tem o foco do teclado.
 * - **No telemóvel** o menu é um `<dialog>` modal: o browser trata do foco
 *   preso, da tecla Esc e de pôr o resto da página inerte.
 *
 * `Expertises` e `À propos` são secções da página inicial (`/#expertises`,
 * `/#a-propos`): a partir de uma página interior, o link navega para a
 * inicial e o browser desce até à secção.
 *
 * O seletor de língua leva à **mesma página** na outra língua: os *slugs* são
 * iguais em todas (ver `i18n/routing.ts`), por isso basta mudar o prefixo. Usa
 * o `Link` do Next e não o do `next-intl`, que para o francês gerava
 * `/fr-CH/...` (o prefixo serve-lhe para gravar o cookie de língua, que aqui
 * está desligado) e obrigava a um redirecionamento.
 */
export function Cabecalho({ textos, locale }: { textos: TextosDoCabecalho; locale: Locale }) {
  const caminho = usePathname();
  const [sobreFoto, setSobreFoto] = useState(false);
  const [escondido, setEscondido] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const cabecalho = useRef<HTMLElement>(null);

  const ligacoes = [
    { href: "/realisations", texto: textos.realisations, ativo: caminho.startsWith("/realisations") },
    { href: "/#expertises", texto: textos.expertises, ativo: false },
    { href: "/#a-propos", texto: textos.aPropos, ativo: false },
  ];

  useEffect(() => {
    let ultimoY = window.scrollY;
    let pedido = 0;

    const medir = () => {
      pedido = 0;
      const y = window.scrollY;
      const altura = cabecalho.current?.offsetHeight ?? 72;

      const fotos = document.querySelectorAll("[data-sob-cabecalho]");
      setSobreFoto(
        Array.from(fotos).some((foto) => {
          const caixa = foto.getBoundingClientRect();
          return caixa.top <= 0 && caixa.bottom > altura;
        }),
      );

      const focado = cabecalho.current?.contains(document.activeElement) ?? false;
      if (y < 240 || focado) setEscondido(false);
      else if (y > ultimoY + 6) setEscondido(true);
      else if (y < ultimoY - 6) setEscondido(false);
      ultimoY = y;
    };
    const agendar = () => {
      if (!pedido) pedido = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      if (pedido) cancelAnimationFrame(pedido);
    };
  }, [caminho]);

  /* Mudou de página: o menu fecha-se. */
  useEffect(() => {
    menu.current?.close();
  }, [caminho]);

  return (
    <header
      ref={cabecalho}
      className="cabecalho"
      data-sobre-foto={sobreFoto ? "" : undefined}
      data-escondido={escondido ? "" : undefined}
      onFocus={() => setEscondido(false)}
      style={{ viewTransitionName: "cabecalho" }}
    >
      <div className="cabecalho__barra envelope">
        <Link href="/" className="cabecalho__marca" aria-label={textos.inicio} onClick={aoClicarNaMarca}>
          <Marca />
        </Link>

        <nav aria-label={textos.principal} className="cabecalho__nav">
          <ul>
            {ligacoes.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={l.ativo ? "page" : undefined}>
                  {l.texto}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="cabecalho__contacto"
                aria-current={caminho.startsWith("/contact") ? "page" : undefined}
              >
                {textos.contact}
              </Link>
            </li>
          </ul>
        </nav>

        <SeletorDeLingua
          className="cabecalho__linguas"
          caminho={caminho}
          atual={locale}
          rotulo={textos.lingua}
          formato="curto"
        />

        <button
          type="button"
          className="cabecalho__menu"
          aria-haspopup="dialog"
          onClick={() => menu.current?.showModal()}
        >
          {textos.menu}
        </button>
      </div>

      <dialog ref={menu} className="menu-movel" aria-label={textos.principal}>
        <div className="menu-movel__topo envelope">
          <Marca />
          <button type="button" className="menu-movel__fechar" onClick={() => menu.current?.close()}>
            {textos.fechar}
          </button>
        </div>
        <nav aria-label={textos.principal} className="menu-movel__nav envelope">
          <ol>
            {[...ligacoes, { href: "/contact", texto: textos.contact, ativo: caminho.startsWith("/contact") }].map(
              (l, i) => (
                <li key={l.href}>
                  <span className="legenda" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={l.href}
                    aria-current={l.ativo ? "page" : undefined}
                    onClick={() => menu.current?.close()}
                  >
                    {l.texto}
                  </Link>
                </li>
              ),
            )}
          </ol>
        </nav>
        <SeletorDeLingua
          className="menu-movel__linguas envelope"
          caminho={caminho}
          atual={locale}
          rotulo={textos.lingua}
          formato="nome"
        />
      </dialog>
    </header>
  );
}

function SeletorDeLingua({
  className,
  caminho,
  atual,
  rotulo,
  formato,
}: {
  className: string;
  caminho: string;
  atual: Locale;
  rotulo: string;
  formato: "curto" | "nome";
}) {
  return (
    <nav aria-label={rotulo} className={className}>
      <ul>
        {routing.locales.map((l) => {
          const { nome, curto } = NOMES_DAS_LINGUAS[l];
          return (
            <li key={l}>
              {/* `lang` para o leitor de ecrã dizer "Português" com a pronúncia
                  certa; no formato curto, o nome inteiro vai no `aria-label`
                  porque "PT" lido letra a letra não diz nada. */}
              <NextLink
                href={caminhoLocalizado(caminho, l)}
                lang={l}
                hrefLang={l}
                aria-label={formato === "curto" ? nome : undefined}
                aria-current={l === atual ? "true" : undefined}
              >
                {formato === "curto" ? curto : nome}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * O logótipo leva à inicial **com a entrada do herói**, mesmo que já se tenha
 * visto nesta sessão (`pedirEntrada`). Se já se está na inicial não há página
 * nova: sobe-se ao topo e a entrada recomeça ali. Ctrl/⌘/Shift ou o botão do
 * meio abrem noutro sítio e não mexem na página atual.
 */
function aoClicarNaMarca(evento: React.MouseEvent<HTMLAnchorElement>) {
  if (evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
  pedirEntrada();
  const inicios = routing.locales.map((l) => caminhoLocalizado("/", l).replace(/\/$/, ""));
  if (inicios.includes(window.location.pathname.replace(/\/$/, ""))) {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event(EVENTO_DA_ENTRADA));
  }
}
