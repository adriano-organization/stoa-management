/*
  O contorno que a construção do herói desenha: só a linha do edifício, nunca
  as bordas da fotografia (que o recorte usa para fechar o polígono).
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { HEROI, contorno, plantaDe } from "../src/data/heroi.ts";

/** Lê "M1 2L3 4..." como troços de pontos. */
function trocos(d) {
  return d
    .split("M")
    .filter(Boolean)
    .map((troco) => troco.split("L").map((p) => p.trim().split(" ").map(Number)));
}

const naBorda = ([x1, y1], [x2, y2], { largura, altura }) =>
  (x1 === x2 && (x1 === 0 || x1 === largura)) || (y1 === y2 && (y1 === 0 || y1 === altura));

for (const [nome, composicao] of Object.entries(HEROI)) {
  test(`contorno (${nome}): nenhum segmento sobre a borda da imagem`, () => {
    for (const troco of trocos(contorno(composicao))) {
      for (let i = 1; i < troco.length; i++) {
        assert.ok(!naBorda(troco[i - 1], troco[i], composicao), `${troco[i - 1]} → ${troco[i]}`);
      }
    }
  });

  test(`contorno (${nome}): todos os outros segmentos do recorte estão lá`, () => {
    const { recorte } = composicao;
    const esperados = recorte
      .map((p, i) => [p, recorte[(i + 1) % recorte.length]])
      .filter(([a, b]) => !naBorda(a, b, composicao));
    const desenhados = trocos(contorno(composicao)).flatMap((troco) =>
      troco.slice(1).map((p, i) => [troco[i], p]),
    );
    assert.equal(desenhados.length, esperados.length);
    for (const [a, b] of esperados) {
      assert.ok(
        desenhados.some(([c, d]) => c[0] === a[0] && c[1] === a[1] && d[0] === b[0] && d[1] === b[1]),
        `${a} → ${b}`,
      );
    }
  });
}

test("contorno da paisagem: um só traço, da fachada esquerda à direita", () => {
  const d = contorno(HEROI.paisagem);
  assert.equal(trocos(d).length, 1);
  assert.ok(d.startsWith("M287 720L287 306.5"), d.slice(0, 40));
  assert.ok(d.endsWith("L923 720"), d.slice(-40));
});

test("contorno do retrato: um só traço, do topo ao fundo da fachada", () => {
  const d = contorno(HEROI.retrato);
  assert.equal(trocos(d).length, 1);
  assert.ok(d.startsWith("M1252 0L1252 22"), d.slice(0, 40));
  assert.ok(d.endsWith("L2780 4032"), d.slice(-40));
});

/*
  A planta da entrada: o desenho técnico que se transforma na fotografia. As
  linhas foram lidas na própria fotografia (ver `heroi.ts`); aqui prova-se que
  vivem no referencial dela e que terminam exatamente na composição final.
*/
const dentro = ([x, y], { largura, altura }) => x >= 0 && x <= largura && y >= 0 && y <= altura;

for (const [nome, composicao] of Object.entries(HEROI)) {
  test(`planta (${nome}): todos os pontos dentro da fotografia`, () => {
    const p = plantaDe(composicao);
    const todos = [...p.guias.flat(), ...p.tracos.flat(), ...p.superficies.flatMap((s) => s.pontos), ...p.silhueta];
    assert.ok(todos.length > 0);
    for (const ponto of todos) assert.ok(dentro(ponto, composicao), `${ponto}`);
  });

  test(`planta (${nome}): cada linha de construção atravessa o enquadramento`, () => {
    const naBordaDaImagem = ([x, y]) => x === 0 || y === 0 || x === composicao.largura || y === composicao.altura;
    for (const guia of plantaDe(composicao).guias) {
      assert.ok(naBordaDaImagem(guia[0]) && naBordaDaImagem(guia.at(-1)), `${guia[0]} → ${guia.at(-1)}`);
    }
  });

  test(`planta (${nome}): a silhueta começa na platibanda do recorte (sem costura com a marca)`, () => {
    const { silhueta } = plantaDe(composicao);
    const topo = composicao.recorte.filter(([, y]) => y < composicao.altura && y > 0).slice(0, 5);
    assert.ok(topo.length > 0);
    for (const ponto of topo) {
      assert.ok(
        silhueta.some(([x, y]) => x === ponto[0] && y === ponto[1]),
        `${ponto} do recorte não está na silhueta`,
      );
    }
  });
}

test("planta da paisagem: desenho completo (telhado, verticais, lajes) e três superfícies", () => {
  const p = plantaDe(HEROI.paisagem);
  assert.ok(p.guias.length >= 3);
  assert.ok(p.tracos.length >= 10);
  assert.equal(p.superficies.length, 3);
  /* O primeiro traço é a platibanda do fundo, ponto a ponto a do recorte. */
  assert.deepEqual(p.tracos[0], HEROI.paisagem.recorte.slice(0, p.tracos[0].length));
});

test("planta do retrato: só a aresta da fachada — nada do desenho da paisagem", () => {
  const p = plantaDe(HEROI.retrato);
  assert.equal(p.guias.length, 0);
  assert.equal(p.tracos.length, 1);
  assert.deepEqual(p.silhueta, HEROI.retrato.recorte);
  assert.equal(`M${p.tracos[0].map(([x, y]) => `${x} ${y}`).join("L")}`, contorno(HEROI.retrato));
});
