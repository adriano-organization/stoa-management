/*
  O script do `<head>` que decide a entrada do herói antes da primeira
  pintura. Corre como texto dentro do HTML — um erro de sintaxe (uma barra
  perdida num template literal) apagava também o `data-movimento` do site
  inteiro. Aqui corre-se o texto verdadeiro contra um browser mínimo.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { CHAVE_DA_ENTRADA, pedirEntrada, scriptDeArranque } from "../src/lib/movimento/entrada.ts";

const INICIOS = ["", "/pt", "/en"];

function correr({ caminho = "/", hash = "", menosMovimento = false, vista = false } = {}) {
  const atributos = new Map();
  const temporizadores = [];
  const html = {
    setAttribute: (n, v) => atributos.set(n, v),
    removeAttribute: (n) => atributos.delete(n),
    hasAttribute: (n) => atributos.has(n),
  };
  const globais = {
    matchMedia: () => ({ matches: !menosMovimento }),
    document: { documentElement: html },
    location: { pathname: caminho, hash },
    sessionStorage: { getItem: (k) => (vista && k === CHAVE_DA_ENTRADA ? "1" : null) },
    setTimeout: (f, ms) => temporizadores.push({ f, ms }),
  };
  new Function(...Object.keys(globais), scriptDeArranque(INICIOS))(...Object.values(globais));
  return { atributos, temporizadores };
}

test("o script compila", () => {
  assert.doesNotThrow(() => new Function(scriptDeArranque(INICIOS)));
});

test("na inicial, primeira vez: movimento e entrada", () => {
  for (const caminho of ["/", "/pt", "/en", "/pt/"]) {
    const { atributos } = correr({ caminho });
    assert.ok(atributos.has("data-movimento"), caminho);
    assert.ok(atributos.has("data-intro"), caminho);
  }
});

test("noutra página, com âncora ou já vista na sessão: movimento sem entrada", () => {
  for (const caso of [{ caminho: "/contact" }, { caminho: "/", hash: "#expertises" }, { vista: true }]) {
    const { atributos } = correr(caso);
    assert.ok(atributos.has("data-movimento"), JSON.stringify(caso));
    assert.ok(!atributos.has("data-intro"), JSON.stringify(caso));
  }
});

test("com menos movimento: nada", () => {
  const { atributos } = correr({ menosMovimento: true });
  assert.equal(atributos.size, 0);
});

test("sem a fotografia a tempo, a entrada sai sozinha (mesmo sem React)", () => {
  const { atributos, temporizadores } = correr();
  assert.equal(temporizadores.length, 1);
  temporizadores[0].f();
  assert.ok(!atributos.has("data-intro"));
  assert.ok(atributos.has("data-movimento"));
});

test("com a fotografia a tempo, o limite não mexe", () => {
  const { atributos, temporizadores } = correr();
  atributos.set("data-intro-foto", "");
  temporizadores[0].f();
  assert.ok(atributos.has("data-intro"));
});

/* O logótipo pede a entrada outra vez: esquece que já se viu nesta sessão. */
test("depois de pedir a entrada (logótipo), a sessão volta a tê-la", () => {
  const guardado = new Map([[CHAVE_DA_ENTRADA, "1"]]);
  const anterior = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    getItem: (k) => guardado.get(k) ?? null,
    removeItem: (k) => guardado.delete(k),
  };
  try {
    pedirEntrada();
  } finally {
    globalThis.sessionStorage = anterior;
  }
  const { atributos } = correr({ vista: guardado.has(CHAVE_DA_ENTRADA) });
  assert.ok(atributos.has("data-intro"));
});

test("pedir a entrada sem sessionStorage (bloqueado) não rebenta", () => {
  const anterior = globalThis.sessionStorage;
  globalThis.sessionStorage = {
    removeItem: () => {
      throw new Error("bloqueado");
    },
  };
  try {
    assert.doesNotThrow(() => pedirEntrada());
  } finally {
    globalThis.sessionStorage = anterior;
  }
});
