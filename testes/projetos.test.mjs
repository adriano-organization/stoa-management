/*
  Os projetos e o modo de publicação. O que se prova:

  - todos os projetos têm título nas mensagens (um título em falta não parte o
    build — aparecia o nome da chave na página);
  - as referências mantêm as atribuições do site atual;
  - os projetos provisórios não afirmam nada (local, estado, missão, período)
    que ninguém confirmou;
  - em publicação, nada provisório sai — nem nas listas, nem nos destaques,
    nem na equipa, nem o relato de exemplo de um projeto já validado.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { TODOS_OS_PROJETOS, projetosEmDestaque, projetosVisiveis, relatoPublicavel } from "../src/data/projetos.ts";

const RAIZ = new URL("..", import.meta.url).pathname;
const mensagens = JSON.parse(readFileSync(`${RAIZ}messages/fr-CH.json`, "utf8"));

test("cada projeto tem título nas mensagens", () => {
  for (const p of TODOS_OS_PROJETOS) {
    assert.equal(typeof mensagens.projetos[p.slug]?.titulo, "string", p.slug);
  }
});

test("cada imagem usada por um projeto tem texto alternativo", () => {
  for (const p of TODOS_OS_PROJETOS) {
    const imagens = [
      p.capa,
      ...p.galeria.flatMap((b) => (b.tipo === "largo" ? [b.imagem] : b.tipo === "video" ? [] : b.imagens)),
    ];
    for (const id of imagens) assert.equal(typeof mensagens.medias[id], "string", `${p.slug}: ${id}`);
    for (const b of p.galeria) {
      if (b.tipo === "video") assert.equal(typeof mensagens.medias.videos[b.video], "string", b.video);
    }
  }
});

test("as referências são de colaboradores, validadas, e dizem com quem foram feitas", () => {
  const refs = TODOS_OS_PROJETOS.filter((p) => p.realizadoPor === "colaborador");
  assert.equal(refs.length, 4);
  for (const r of refs) {
    assert.equal(r.publicacao, "validado", r.slug);
    assert.ok(r.colaboracao?.empresa && r.colaboracao?.cidade, r.slug);
    assert.ok(r.missao && r.local && r.periodo, r.slug);
  }
});

test("um projeto provisório não afirma nada que ninguém confirmou", () => {
  for (const p of TODOS_OS_PROJETOS.filter((p) => p.publicacao === "provisorio")) {
    assert.equal(p.local, null, p.slug);
    assert.equal(p.estado, null, p.slug);
    assert.equal(p.missao, null, p.slug);
    assert.equal(p.periodo, null, p.slug);
    assert.equal(p.pessoa, null, p.slug);
  }
});

test("em aperçu (o modo destes testes), tudo está visível", () => {
  assert.equal(projetosVisiveis().length, TODOS_OS_PROJETOS.length);
  assert.equal(projetosEmDestaque().length, 4);
});

test("em publicação, nada provisório sai — nem nos destaques, nem na equipa", () => {
  const codigo = `
    const p = await import("./src/data/projetos.ts");
    const e = await import("./src/data/equipa.ts");
    console.log(JSON.stringify({
      visiveis: p.projetosVisiveis().map((x) => x.publicacao),
      destaque: p.projetosEmDestaque().map((x) => x.publicacao),
      equipa: e.perfisVisiveis().length,
      relatos: p.projetosVisiveis().filter(p.relatoPublicavel).map((x) => x.relato),
    }));
  `;
  const saida = execFileSync(
    process.execPath,
    ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--import", "./testes/apoio/carregador.mjs", "--input-type=module", "-e", codigo],
    { cwd: RAIZ, env: { ...process.env, STOA_PUBLICATION: "1" }, encoding: "utf8" },
  );
  const { visiveis, destaque, equipa, relatos } = JSON.parse(saida.trim().split("\n").pop());
  assert.ok(visiveis.length > 0);
  assert.ok(visiveis.every((v) => v === "validado"), JSON.stringify(visiveis));
  assert.ok(destaque.every((v) => v === "validado"), JSON.stringify(destaque));
  assert.equal(equipa, 0);
  /* As referências já estão validadas, mas o relato delas ainda é exemplo. */
  assert.ok(relatos.every((r) => r === "validado"), JSON.stringify(relatos));
});

test("em aperçu, o relato de exemplo aparece", () => {
  assert.ok(TODOS_OS_PROJETOS.filter((p) => p.relato === "exemplo").every(relatoPublicavel));
});
