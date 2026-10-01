/*
  O mapa da página de contacto. O que se prova:

  - o escritório está no mesmo ponto no script que desenha o mapa e em
    `src/data/stoa.ts` (o script corre em Node puro e repete o valor);
  - os dois desenhos têm as medidas que a página e o CSS esperam: se alguém
    mudar `LARGURA`/`ALTURA` no script e se esquecer do resto, o alfinete
    deixa de cair em cima do escritório sem nenhum erro à vista;
  - o crédito do OpenStreetMap existe nas três línguas (é condição da licença).
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stoa } from "../src/data/stoa.ts";

const ler = (caminho) => readFileSync(new URL(`../${caminho}`, import.meta.url), "utf8");
const script = ler("scripts/desenhar-mapa.mjs");
const numero = (nome) => Number(script.match(new RegExp(`${nome}\\s*[:=]\\s*([\\d.]+)`))[1]);

test("o escritório está no mesmo ponto no script e nos dados", () => {
  assert.ok(stoa.coordenadas, "sem coordenadas, a página não mostra o mapa: tirar também este teste");
  assert.equal(numero("lat"), stoa.coordenadas.lat);
  assert.equal(numero("lon"), stoa.coordenadas.lon);
});

test("os desenhos têm as medidas da página", () => {
  const [largura, altura] = [numero("LARGURA"), numero("ALTURA")];
  const componente = ler("src/components/contacto/PlanoDoEscritorio.tsx");
  const css = ler("src/app/contact.css");

  for (const ficheiro of ["farvagny.svg", "farvagny-traco.svg"]) {
    assert.match(ler(`public/mapa/${ficheiro}`), new RegExp(`viewBox="0 0 ${largura} ${altura}"`), ficheiro);
  }
  assert.equal(componente.match(new RegExp(`width=\\{${largura}\\} height=\\{${altura}\\}`, "g"))?.length, 2);
  assert.match(css, new RegExp(`calc\\(${largura} \\* var\\(--escala\\)\\)`));

  // O escritório no desenho e o `--mapa-x`/`--mapa-y` do CSS.
  const [x, y] = script.match(/POSICAO = \{ x: ([\d.]+), y: ([\d.]+) \}/).slice(1).map(Number);
  assert.match(css, new RegExp(`--mapa-x: ${x * 100}%;`));
  assert.match(css, new RegExp(`--mapa-y: ${y * 100}%;`));
});

test("o crédito do OpenStreetMap está nas três línguas", () => {
  for (const lingua of ["fr-CH", "pt", "en"]) {
    const { contacto } = JSON.parse(ler(`messages/${lingua}.json`));
    assert.match(contacto.mapa.credito, /OpenStreetMap/, lingua);
  }
});
