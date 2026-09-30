"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
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
};

/**
 * O cabeçalho fixo.
 *
 * - **Sobre a fotografia** do herói é transparente e claro; depois ganha fundo.
 *   A página diz onde há fotografia por baixo com `data-sob-cabecalho`.
 * - **Esconde-se a descer e volta a subir**, para as imagens terem o ecrã
 *   inteiro. Nunca se esconde enquanto tem o foco do teclado.
 * - **No telemóvel** o menu é um `<dialog>` modal: o browser trata do foco
 *   preso, da tecla Esc e de pôr o resto da página inerte.
 *
 * `Expertises` e `À propos` são secções da página inicial (`/#expertises`,
 * `/#a-propos`): a partir de uma página interior, o link navega para a
 * inicial e o browser desce até à secção.
 */
export function Cabecalho({ textos }: { textos: TextosDoCabecalho }) {
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

      const foto = document.querySelector("[data-sob-cabecalho]");
      setSobreFoto(foto ? foto.getBoundingClientRect().bottom > altura : false);

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
        <Link href="/" className="cabecalho__marca" aria-label={textos.inicio}>
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
      </dialog>
    </header>
  );
}
