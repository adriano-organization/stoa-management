/*
  A cortina com a folha só cobre uma navegação que vai mesmo acontecer nesta
  aba, para outra página do site. Tudo o resto — outro separador, outro site,
  uma âncora, um projeto (que tem o morph) — passa sem cortina, porque uma
  cortina que tapa uma página que não muda fica presa.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { deveCobrir } from "../src/lib/movimento/cortina.ts";

const CLIQUE = { botao: 0, modificador: false, prevenido: false };
const LIGACAO = { href: "/contact", target: null, download: false, semCortina: false };
const LOCAL = { href: "https://stoa.ch/realisations", movimento: true };

test("um link interno para outra página cobre", () => {
  assert.equal(deveCobrir(CLIQUE, LIGACAO, LOCAL), true);
});

test("mudar de língua cobre (o caminho muda)", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/pt/realisations" }, LOCAL), true);
});

test("sem movimento (sem JavaScript no arranque ou menos movimento) não cobre", () => {
  assert.equal(deveCobrir(CLIQUE, LIGACAO, { ...LOCAL, movimento: false }), false);
});

test("botão do meio ou com Ctrl/⌘/Shift/Alt não cobre (abre noutro sítio)", () => {
  assert.equal(deveCobrir({ ...CLIQUE, botao: 1 }, LIGACAO, LOCAL), false);
  assert.equal(deveCobrir({ ...CLIQUE, modificador: true }, LIGACAO, LOCAL), false);
});

test("um clique já tratado por outro código não cobre", () => {
  assert.equal(deveCobrir({ ...CLIQUE, prevenido: true }, LIGACAO, LOCAL), false);
});

test("target e download não cobrem; target _self cobre", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, target: "_blank" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, download: true }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, target: "_self" }, LOCAL), true);
});

test("outro site, mailto e tel não cobrem", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "https://exemplo.ch/" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "mailto:info@stoa.ch" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "tel:+41260000000" }, LOCAL), false);
});

test("a mesma página (âncora ou outra query) não cobre", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations#lista" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "#conteudo" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations?p=2" }, LOCAL), false);
});

test("a âncora de uma secção da inicial, vinda de outra página, cobre", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/#expertises" }, LOCAL), true);
});

test("um projeto (data-sem-cortina) não cobre: fica o morph", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, semCortina: true }, LOCAL), false);
});

test("um href que não é URL não cobre e não rebenta", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "http://[" }, LOCAL), false);
});

/* O morph dos projetos (a fotografia que voa do cartão para a abertura, e de
   volta) só se vê sem cortina. Qualquer link que abre um projeto tem esse
   morph — os cartões, os destaques, o "projeto seguinte" — e o regresso de um
   projeto à lista tem o inverso. */
test("abrir um projeto não cobre (fica o morph), em qualquer língua", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations/immeuble-a" }, LOCAL), false);
  assert.equal(
    deveCobrir(CLIQUE, { ...LIGACAO, href: "/pt/realisations/immeuble-a" }, { ...LOCAL, href: "https://stoa.ch/pt" }),
    false,
  );
});

test("de um projeto para o seguinte não cobre", () => {
  const noProjeto = { ...LOCAL, href: "https://stoa.ch/en/realisations/immeuble-a" };
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/en/realisations/immeuble-b" }, noProjeto), false);
});

test("de um projeto de volta à lista não cobre (o morph inverso)", () => {
  const noProjeto = { ...LOCAL, href: "https://stoa.ch/realisations/immeuble-a" };
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations" }, noProjeto), false);
});

test("da inicial para a lista de projetos cobre (não há morph)", () => {
  assert.equal(
    deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations" }, { ...LOCAL, href: "https://stoa.ch/" }),
    true,
  );
});

test("de um projeto para outra secção cobre", () => {
  const noProjeto = { ...LOCAL, href: "https://stoa.ch/realisations/immeuble-a" };
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/contact" }, noProjeto), true);
});
