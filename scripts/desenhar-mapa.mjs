/**
 * Desenha o mapa da página de contacto a partir do OpenStreetMap.
 *
 *   npm run mapa            descarrega as ruas e desenha
 *   npm run mapa -- --cache desenha outra vez a partir do que já foi descarregado
 *
 * ## Porque é que o mapa é um SVG nosso e não um `<iframe>`
 *
 * ⚠️ Um mapa embebido (Google, OpenStreetMap, Mapbox) faz pedidos a terceiros
 * em **cada visita**, mesmo de quem nunca olha para ele: obrigava a abrir a
 * CSP (`src/lib/cabecalhos.ts`) e fazia mentir o texto sobre dados pessoais da
 * página de contacto. E não deixa pôr o mapa nas cores do site.
 *
 * Assim, as ruas descarregam-se **uma vez**, aqui, e o site serve dois
 * ficheiros seus. Nenhum pedido sai do browser de quem visita. O custo é o
 * mapa não se arrastar nem fazer zoom; para isso há o botão do itinerário,
 * que é um link normal.
 *
 * ## Os dois desenhos
 *
 * - `farvagny.svg`, o mapa inteiro, pintado;
 * - `farvagny-traco.svg`, só os contornos, em linha fina: o mesmo registo do
 *   desenho técnico do herói. A página mostra-o primeiro e o mapa pintado
 *   abre-se por cima, a partir do escritório, ao rolar.
 *
 * Os dois partilham o mesmo enquadramento ao píxel: é isso que deixa um
 * cobrir o outro sem saltos.
 *
 * ## Licença
 *
 * Os dados são © contribuidores do OpenStreetMap, sob ODbL. **O crédito tem de
 * estar visível junto ao mapa**: está na página, em `contacto.mapa.credito`.
 * Tirá-lo não é uma questão de gosto, é uma condição da licença.
 *
 * ## O ponto do escritório
 *
 * Não vem do OpenStreetMap, que não tem o número 31 desta rua. Vem de
 * `src/data/stoa.ts` (`coordenadas`), que diz de onde saiu. Se o escritório
 * mudar de sítio, muda lá e corre-se isto outra vez.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";

/* ---------------------------------------------------------- o enquadramento */

/* O mesmo valor de `stoa.coordenadas`. Repetido aqui porque este script corre
   em Node puro, sem o carregador de TypeScript; o teste `contacto.test.mjs`
   confirma que os dois batem certo. */
const ESCRITORIO = { lat: 46.725418, lon: 7.081749 };

/**
 * Tamanho do desenho em unidades SVG, e quantos metros vale cada uma.
 *
 * A página mostra o desenho **a escala fixa** (0,9 px por unidade no ecrã
 * largo, ver `--escala` em `contact.css`) e não esticado para cobrir: um ecrã
 * maior vê mais terreno, em vez de ver as mesmas ruas mais grossas. Por isso o
 * desenho é muito mais largo do que alto: a 0,9 px tem de cobrir um ecrã de
 * 2560 px com o escritório a 64 %, e a altura máxima do mapa (52rem).
 * ⚠️ Mudar estes números é mudar também o `width`/`height` das `<img>` em
 * `PlanoDoEscritorio.tsx` e a conta de `--escala`.
 */
const LARGURA = 2850;
const ALTURA = 940;
const METROS_POR_UNIDADE = 1.6;

/**
 * Onde o escritório fica no desenho. **Não é ao centro**: no ecrã largo o
 * cartão com a morada tapa a parte da esquerda, e o alfinete tem de ficar à
 * vista ao lado dele. O mesmo valor está em `--mapa-x`/`--mapa-y`, em
 * `contact.css`.
 */
const POSICAO = { x: 0.64, y: 0.5 };

const M_POR_GRAU_LAT = 111_132;
const M_POR_GRAU_LON = 111_320 * Math.cos((ESCRITORIO.lat * Math.PI) / 180);

const lonOeste = ESCRITORIO.lon - (LARGURA * POSICAO.x * METROS_POR_UNIDADE) / M_POR_GRAU_LON;
const latNorte = ESCRITORIO.lat + (ALTURA * POSICAO.y * METROS_POR_UNIDADE) / M_POR_GRAU_LAT;
const lonEste = lonOeste + (LARGURA * METROS_POR_UNIDADE) / M_POR_GRAU_LON;
const latSul = latNorte - (ALTURA * METROS_POR_UNIDADE) / M_POR_GRAU_LAT;

const x = (lon) => ((lon - lonOeste) * M_POR_GRAU_LON) / METROS_POR_UNIDADE;
const y = (lat) => ((latNorte - lat) * M_POR_GRAU_LAT) / METROS_POR_UNIDADE;

/* ------------------------------------------------------------- os dados --- */

const CACHE = "sources/osm/farvagny.json";
const DESTINO = "public/mapa";

async function descarregar() {
  // Uma margem à volta, para as ruas não acabarem a direito na borda.
  const m = 0.003;
  const bbox = [latSul - m, lonOeste - m, latNorte + m, lonEste + m].join(",");
  const consulta = `[out:json][timeout:90];
(
  way[highway](${bbox});
  way[building](${bbox});
  way[landuse~"^(forest|grass|meadow|recreation_ground|cemetery|village_green|orchard)$"](${bbox});
  way[leisure~"^(park|garden|pitch|playground)$"](${bbox});
  way[natural~"^(water|wood|scrub)$"](${bbox});
  way[waterway~"^(river|stream)$"](${bbox});
  node[place~"^(village|hamlet|town)$"](${bbox});
);
out geom;`;
  /* O Overpass é um serviço público e gratuito, e responde 504 ou 406 com
     frequência. Tenta-se em dois servidores antes de desistir. */
  const servidores = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
  let dados = null;
  for (let tentativa = 0; tentativa < 6 && !dados; tentativa++) {
    const servidor = servidores[tentativa % servidores.length];
    try {
      const resposta = await fetch(servidor, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "stoa-management-site/1.0 (mapa estatico, uma vez)",
        },
        body: new URLSearchParams({ data: consulta }),
      });
      if (!resposta.ok) throw new Error(`respondeu ${resposta.status}`);
      dados = await resposta.json();
    } catch (erro) {
      console.warn(`${servidor}: ${erro.message}; a tentar outra vez…`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  if (!dados) throw new Error("O Overpass não respondeu. Tentar mais tarde.");
  await mkdir("sources/osm", { recursive: true });
  await writeFile(CACHE, JSON.stringify(dados));
  return dados;
}

const dados = process.argv.includes("--cache")
  ? JSON.parse(await readFile(CACHE, "utf8"))
  : await descarregar();

/* ------------------------------------------------------------ o desenho --- */

const r = (n) => Math.round(n);
const pontos = (geom) => geom.map((p) => [x(p.lon), y(p.lat)]);
const caminho = (pts, fechar = false) =>
  "M" + pts.map(([a, b]) => `${r(a)} ${r(b)}`).join("L") + (fechar ? "Z" : "");

/** Fora do desenho por completo? Então não vale os bytes. */
const fora = (pts) =>
  pts.every(([a]) => a < -50) || pts.every(([a]) => a > LARGURA + 50) ||
  pts.every(([, b]) => b < -50) || pts.every(([, b]) => b > ALTURA + 50);

/** As classes de rua, da mais importante para a menos. */
const RUAS = [
  { classe: "autoestrada", tipos: ["motorway", "motorway_link", "trunk", "trunk_link"] },
  { classe: "principal", tipos: ["primary", "primary_link", "secondary", "secondary_link"] },
  { classe: "secundaria", tipos: ["tertiary", "tertiary_link"] },
  { classe: "local", tipos: ["residential", "unclassified", "living_street", "road"] },
  { classe: "servico", tipos: ["service", "track"] },
  { classe: "pe", tipos: ["pedestrian", "footway", "path", "steps", "cycleway"] },
];

const camadas = { mata: [], verde: [], agua: [], rios: [], predios: [] };
const ruas = Object.fromEntries(RUAS.map((c) => [c.classe, []]));
const nomes = [];
const lugares = [];
const autoestradas = [];

for (const el of dados.elements) {
  const t = el.tags ?? {};
  if (el.type === "node") {
    const [a, b] = [x(el.lon), y(el.lat)];
    if (t.name && a > 80 && a < LARGURA - 80 && b > 60 && b < ALTURA - 60) {
      lugares.push({ nome: t.name, x: a, y: b, aldeia: t.place !== "hamlet" });
    }
    continue;
  }
  if (el.type !== "way" || !el.geometry) continue;
  const pts = pontos(el.geometry);
  if (fora(pts)) continue;

  if (t.highway) {
    const tipo = RUAS.find((c) => c.tipos.includes(t.highway));
    if (!tipo) continue;
    ruas[tipo.classe].push(caminho(pts));
    if (t.highway === "motorway" && t.ref) autoestradas.push({ ref: t.ref, pts });
    if (t.name && ["principal", "secundaria", "local"].includes(tipo.classe)) {
      nomes.push({ nome: t.name, pts, classe: tipo.classe });
    }
  } else if (t.building) {
    camadas.predios.push(caminho(pts, true));
  } else if (t.waterway) {
    camadas.rios.push(caminho(pts));
  } else if (t.natural === "water") {
    camadas.agua.push(caminho(pts, true));
  } else if (t.landuse === "forest" || t.natural === "wood" || t.natural === "scrub") {
    camadas.mata.push(caminho(pts, true));
  } else {
    camadas.verde.push(caminho(pts, true));
  }
}

/* ------------------------------------------------------------- os nomes --- */

const comprimento = (pts) =>
  pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/**
 * As ruas vêm no OpenStreetMap partidas em troços curtos, e nenhum sozinho tem
 * comprimento para o nome. Os troços com o mesmo nome **encadeiam-se** pelas
 * pontas antes de se medir.
 */
const perto = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1;

function encadear(trocos) {
  const livres = trocos.map((t) => [...t]);
  const cadeias = [];
  while (livres.length) {
    let cadeia = livres.shift();
    for (let juntou = true; juntou; ) {
      juntou = false;
      for (let i = 0; i < livres.length; i++) {
        const t = livres[i];
        const [ini, fim] = [cadeia[0], cadeia[cadeia.length - 1]];
        if (perto(fim, t[0])) cadeia = [...cadeia, ...t.slice(1)];
        else if (perto(fim, t[t.length - 1])) cadeia = [...cadeia, ...[...t].reverse().slice(1)];
        else if (perto(ini, t[t.length - 1])) cadeia = [...t, ...cadeia.slice(1)];
        else if (perto(ini, t[0])) cadeia = [...[...t].reverse(), ...cadeia.slice(1)];
        else continue;
        livres.splice(i, 1);
        juntou = true;
        break;
      }
    }
    cadeias.push(cadeia);
  }
  return cadeias;
}

const agrupados = new Map();
for (const n of nomes) {
  if (!agrupados.has(n.nome)) agrupados.set(n.nome, { classe: n.classe, trocos: [] });
  agrupados.get(n.nome).trocos.push(n.pts);
}

const porNome = new Map();
for (const [nome, { classe, trocos }] of agrupados) {
  // Só a parte dentro do desenho conta para o comprimento e para o meio.
  const dentro = encadear(trocos).map((c) =>
    c.filter(([a, b]) => a > 0 && a < LARGURA && b > 0 && b < ALTURA),
  );
  const maior = dentro.sort((a, b) => comprimento(b) - comprimento(a))[0];
  if (maior && maior.length > 1) porNome.set(nome, { nome, classe, pts: maior, c: comprimento(maior) });
}

const TAMANHO = { principal: 17, secundaria: 15, local: 13 };
const PESO = { principal: 0, secundaria: 1, local: 2 };
const [ex, ey] = [LARGURA * POSICAO.x, ALTURA * POSICAO.y];

/* Os nomes das aldeias ficam por cima de tudo e reservam o seu espaço antes
   das ruas: é por eles que alguém de fora se orienta. */
const ocupados = [[ex, ey]];
const aldeias = [];
for (const l of lugares.sort((a, b) => Number(b.aldeia) - Number(a.aldeia))) {
  if (ocupados.some(([a, b]) => Math.hypot(a - l.x, b - l.y) < 160)) continue;
  ocupados.push([l.x, l.y]);
  aldeias.push(l);
}

/**
 * A rua da morada leva sempre nome, e vai à frente de todas: é a que está
 * escrita no cartão ao lado. ⚠️ O escritório **não fica em cima dela**: o
 * ponto oficial está a uns 260 m da linha da rua (no OpenStreetMap e no
 * registo de ruas do swisstopo), num acesso interior. Por isso o nome fica
 * onde a rua passa, e não colado ao alfinete.
 */
const RUA_DO_ESCRITORIO = "Chemin de la Longivue";
const daCasa = porNome.get(RUA_DO_ESCRITORIO);
if (daCasa) daCasa.casa = true;

const rotulos = [];
for (const n of [...porNome.values()].sort(
  (a, b) => (b.casa ? 1 : 0) - (a.casa ? 1 : 0) || PESO[a.classe] - PESO[b.classe] || b.c - a.c,
)) {
  const precisa = n.nome.length * TAMANHO[n.classe] * 0.55 + 50;
  if (n.c < precisa) continue;
  // Numa curva apertada as letras amontoam-se; só leva nome o troço quase direito.
  const corda = Math.hypot(n.pts.at(-1)[0] - n.pts[0][0], n.pts.at(-1)[1] - n.pts[0][1]);
  if (corda / n.c < 0.8) continue;
  let pts = n.pts;
  // O texto vai sempre da esquerda para a direita, senão lia-se de pernas para o ar.
  if (pts[pts.length - 1][0] < pts[0][0]) pts = [...pts].reverse();
  const meio = pts[Math.floor(pts.length / 2)];
  if (meio[0] < 40 || meio[0] > LARGURA - 40 || meio[1] < 30 || meio[1] > ALTURA - 30) continue;
  if (!n.casa && ocupados.some(([a, b], i) => Math.hypot(a - meio[0], b - meio[1]) < (i === 0 ? 70 : 120))) continue;
  ocupados.push(meio);
  rotulos.push({ id: `r${rotulos.length}`, d: caminho(pts), nome: n.nome, classe: n.classe, casa: n.casa });
  if (rotulos.length >= 22) break;
}

/* O número da autoestrada, numa placa verde como as da estrada: é o que
   quem vem de longe procura. Um por número, a um quinto da altura e a menos de
   350 unidades do escritório na horizontal, para se ver também num ecrã
   estreito; escolhido entre os pontos de **todos** os troços (a autoestrada
   vem partida em muitos). */
const placas = [];
for (const ref of new Set(autoestradas.map((a) => a.ref))) {
  const candidato = autoestradas
    .filter((a) => a.ref === ref)
    .flatMap((a) => a.pts)
    .filter(([px, py]) => Math.abs(px - ex) < 350 && py > 60 && py < ALTURA - 60)
    .sort((p, q) => Math.abs(p[1] - ALTURA * 0.2) - Math.abs(q[1] - ALTURA * 0.2))[0];
  if (!candidato) continue;
  if (ocupados.some(([px, py]) => Math.hypot(px - candidato[0], py - candidato[1]) < 90)) continue;
  ocupados.push(candidato);
  placas.push({ ref, x: candidato[0], y: candidato[1] });
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ------------------------------------------------------------ as cores --- */

/* As de `globals.css`, escritas por extenso: um SVG servido como `<img>` não
   vê as variáveis da página. */
const COR = {
  calcario: "#f2eee7",
  pedra: "#e4ded3",
  molassa: "#c9c1b3",
  mineral: "#5f5c56",
  mineralClaro: "#a8a39a",
  grafite: "#2a2a27",
  verde: "#476b2f",
  verdeMarca: "#629641",
};

const cabecalho = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}" preserveAspectRatio="xMidYMid slice">
<!-- Dados © contribuidores do OpenStreetMap, ODbL. Gerado por scripts/desenhar-mapa.mjs; não editar à mão. -->`;

const g = (atributos, lista) => `<g ${atributos}>${lista.map((d) => `<path d="${d}"/>`).join("")}</g>`;

const textos = (fundo) => `
<g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" stroke="${fundo}" stroke-width="4" paint-order="stroke">
${rotulos.map((l) => `<text font-size="${TAMANHO[l.classe]}" fill="${l.casa ? COR.verde : COR.mineral}" dy="4.5"${l.casa ? ' font-weight="600"' : ""}><textPath href="#${l.id}" startOffset="50%" text-anchor="middle">${esc(l.nome)}</textPath></text>`).join("\n")}
${aldeias.map((l) => `<text x="${r(l.x)}" y="${r(l.y)}" text-anchor="middle" font-size="${l.aldeia ? 22 : 16}" letter-spacing="${l.aldeia ? 3 : 1.5}" fill="${COR.grafite}" font-weight="600">${esc(l.nome.toUpperCase())}</text>`).join("\n")}
</g>
${placas.map((p) => `<g transform="translate(${r(p.x)} ${r(p.y)})"><rect x="-26" y="-15" width="52" height="30" fill="${COR.verde}" stroke="${fundo}" stroke-width="2.5"/><text y="6.5" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="17" font-weight="700" fill="#fff">${esc(p.ref)}</text></g>`).join("")}`;

/* O mapa pintado: calcário, matas e prados num verde muito lavado, prédios em
   pedra com o contorno da molassa, ruas em grafite por hierarquia e a
   autoestrada no verde da marca. */
const pintado = `${cabecalho}
<defs>${rotulos.map((l) => `<path id="${l.id}" d="${l.d}"/>`).join("")}</defs>
<rect width="100%" height="100%" fill="${COR.calcario}"/>
${g('fill="#e1e5d3"', camadas.mata)}
${g('fill="#e8eadc"', camadas.verde)}
${g('fill="#d5dfe0"', camadas.agua)}
${g('fill="none" stroke="#b8cbd0" stroke-width="3"', camadas.rios)}
${g(`fill="${COR.pedra}" stroke="${COR.molassa}" stroke-width="1"`, camadas.predios)}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${g(`stroke="${COR.molassa}" stroke-width="1.2" stroke-dasharray="3 4"`, ruas.pe)}
${g(`stroke="${COR.molassa}" stroke-width="2"`, ruas.servico)}
${g(`stroke="${COR.mineralClaro}" stroke-width="3.5"`, ruas.local)}
${g(`stroke="${COR.mineral}" stroke-width="5"`, ruas.secundaria)}
${g(`stroke="${COR.grafite}" stroke-width="6.5"`, ruas.principal)}
${g(`stroke="${COR.verdeMarca}" stroke-width="9"`, ruas.autoestrada)}
</g>${textos(COR.calcario)}
</svg>
`;

/* O traço: só contornos, numa espessura, sem preenchimentos nem nomes de rua.
   Lê-se como uma planta, e deixa o mapa pintado chegar com alguma coisa de
   novo (a cor, os nomes). As aldeias ficam, para o traço não ser abstrato. */
const traco = `${cabecalho}
<rect width="100%" height="100%" fill="${COR.calcario}"/>
<g fill="none" stroke="${COR.mineralClaro}" stroke-width="0.8" stroke-linejoin="round" stroke-linecap="round">
${[...camadas.mata, ...camadas.agua, ...camadas.predios].map((d) => `<path d="${d}"/>`).join("")}
${[...ruas.servico, ...ruas.local].map((d) => `<path d="${d}"/>`).join("")}
</g>
${g(`fill="none" stroke="${COR.mineral}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`, [...ruas.secundaria, ...ruas.principal, ...ruas.autoestrada])}
<g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="${COR.mineral}" font-weight="600">
${aldeias.map((l) => `<text x="${r(l.x)}" y="${r(l.y)}" text-anchor="middle" font-size="${l.aldeia ? 22 : 16}" letter-spacing="${l.aldeia ? 3 : 1.5}">${esc(l.nome.toUpperCase())}</text>`).join("\n")}
</g>
</svg>
`;

await mkdir(DESTINO, { recursive: true });
await writeFile(`${DESTINO}/farvagny.svg`, pintado);
await writeFile(`${DESTINO}/farvagny-traco.svg`, traco);
console.log(
  `${DESTINO}/farvagny.svg: ${(pintado.length / 1024).toFixed(0)} KB · ` +
    `farvagny-traco.svg: ${(traco.length / 1024).toFixed(0)} KB · ` +
    `${camadas.predios.length} prédios · ${Object.values(ruas).flat().length} troços de rua · ` +
    `${rotulos.length} nomes (${rotulos.map((l) => l.nome).join(", ")}) · ` +
    `aldeias: ${aldeias.map((l) => l.nome).join(", ")}`,
);
