/*
  O contorno que a construção do herói desenha: só a linha do edifício, nunca
  as bordas da fotografia (que o recorte usa para fechar o polígono).
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { HEROI, contorno } from "../src/data/heroi.ts";

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
