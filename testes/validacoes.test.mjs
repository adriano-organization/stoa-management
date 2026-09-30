/*
  O conteúdo institucional e o modo de publicação. O que se prova:

  - nada aparece como aprovado sem a STOA o ter aprovado: hoje, tudo o que
    está em `src/data/validacoes.ts` é provisório (quem mudar isto tem de
    mudar também este teste, de propósito);
  - cada imagem da lista existe e tem texto alternativo;
  - em aperçu tudo sai; em publicação, nada provisório sai — nem o método,
    nem as fotografias do herói, nem uma imagem que não esteja na lista.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  IMAGENS_INSTITUCIONAIS,
  TEXTOS_INSTITUCIONAIS,
  imagemPublicavel,
  textoPublicavel,
} from "../src/data/validacoes.ts";
import { HEROI } from "../src/data/heroi.ts";
import { eImagem } from "../src/lib/medias.ts";

const RAIZ = new URL("..", import.meta.url).pathname;
const mensagens = JSON.parse(readFileSync(`${RAIZ}messages/fr-CH.json`, "utf8"));

test("nada institucional está marcado como aprovado sem confirmação da STOA", () => {
  for (const [chave, estado] of Object.entries({ ...TEXTOS_INSTITUCIONAIS, ...IMAGENS_INSTITUCIONAIS })) {
    assert.equal(estado, "provisorio", chave);
  }
});

test("cada imagem institucional existe e tem texto alternativo", () => {
  for (const id of Object.keys(IMAGENS_INSTITUCIONAIS)) {
    assert.ok(eImagem(id), id);
    assert.equal(typeof mensagens.medias[id], "string", id);
  }
});

test("as fotografias do herói estão na lista", () => {
  assert.ok(HEROI.paisagem.imagem in IMAGENS_INSTITUCIONAIS);
  assert.ok(HEROI.retrato.imagem in IMAGENS_INSTITUCIONAIS);
});

test("em aperçu (o modo destes testes), tudo sai", () => {
  assert.equal(textoPublicavel("metodo"), true);
  for (const id of Object.keys(IMAGENS_INSTITUCIONAIS)) assert.equal(imagemPublicavel(id), true, id);
});

test("em publicação, o provisório não sai — nem uma imagem fora da lista", () => {
  const codigo = `
    const v = await import("./src/data/validacoes.ts");
    console.log(JSON.stringify({
      metodo: v.textoPublicavel("metodo"),
      imagens: Object.keys(v.IMAGENS_INSTITUCIONAIS).map((id) => v.imagemPublicavel(id)),
      foraDaLista: v.imagemPublicavel("immeuble-e-grue"),
    }));
  `;
  const saida = execFileSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--import", "./testes/apoio/carregador.mjs", "--input-type=module", "-e", codigo],
    { cwd: RAIZ, env: { ...process.env, STOA_PUBLICATION: "1" }, encoding: "utf8" },
  );
  const { metodo, imagens, foraDaLista } = JSON.parse(saida.trim().split("\n").pop());
  assert.equal(metodo, false);
  assert.deepEqual([...new Set(imagens)], [false]);
  assert.equal(foraDaLista, false);
});
