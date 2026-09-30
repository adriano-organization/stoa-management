/**
 * As verificações sobre o texto, que o `build` não faz.
 *
 * Uma chave em falta no `next-intl` **não parte o build**: a página sai com o
 * nome da chave à vista — `projetos.immeuble-village.titulo` no lugar de um
 * título — e quem costuma descobrir é o cliente.
 *
 * 1. **As línguas têm as mesmas chaves.** O francês é a referência; é isto
 *    que diz o que ficou por traduzir em `pt` e `en`.
 * 2. **Os dados têm texto.** Cada projeto tem título (e relato, se o tiver,
 *    sem lacunas quando está validado); cada imagem do
 *    manifesto e cada vídeo têm texto alternativo; cada missão e estado usados
 *    têm rótulo. Lido dos dados, e não de uma lista escrita à mão que ficaria
 *    para trás.
 * 3. **A tipografia.** Em todas as línguas, nada de travessão (—) no texto
 *    público nem apóstrofo reto. Em francês, o espaço antes de `; ! ? :` tem
 *    de ser o fino/inseparável, não um espaço normal — senão o sinal fica
 *    sozinho no início da linha seguinte.
 *
 * Corre com o carregador dos testes (ver `package.json`), para poder ler os
 * dados em TypeScript tal como estão.
 */
import { readFileSync } from "node:fs";

const RAIZ = new URL("..", import.meta.url).pathname;
const ler = (caminho) => readFileSync(`${RAIZ}${caminho}`, "utf8");

const routing = ler("src/i18n/routing.ts");
const linguas = JSON.parse(routing.match(/locales:\s*(\[[^\]]*\])/)[1].replace(/'/g, '"'));
const msgs = Object.fromEntries(linguas.map((l) => [l, JSON.parse(ler(`messages/${l}.json`))]));

const { TODOS_OS_PROJETOS } = await import("../src/data/projetos.ts");
const manifesto = JSON.parse(ler("src/data/medias.json"));

const problemas = [];

/* ---------------------------------------------------------- 1. paridade -- */

function chaves(objeto, prefixo = "") {
  return Object.entries(objeto).flatMap(([chave, valor]) =>
    valor && typeof valor === "object" && !Array.isArray(valor)
      ? chaves(valor, `${prefixo}${chave}.`)
      : [`${prefixo}${chave}`],
  );
}

const [principal, ...outras] = linguas;
const base = chaves(msgs[principal]);
for (const l of outras) {
  const destas = chaves(msgs[l]);
  for (const c of base.filter((c) => !destas.includes(c))) problemas.push(`falta em ${l}.json: ${c}`);
  for (const c of destas.filter((c) => !base.includes(c))) problemas.push(`falta em ${principal}.json: ${c}`);
}

/* ------------------------------------------------------ 2. os dados -- */

const seguir = (obj, caminho) => caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

function exigir(caminho, contexto) {
  for (const l of linguas) {
    const v = seguir(msgs[l], caminho);
    if (typeof v !== "string" || v.trim() === "") problemas.push(`${l}.json não tem ${contexto} (${caminho})`);
  }
}

for (const p of TODOS_OS_PROJETOS) {
  exigir(`projetos.${p.slug}.titulo`, `o título do projeto "${p.slug}"`);
  if (p.missao) exigir(`projeto.missoes.${p.missao}`, `o rótulo da missão "${p.missao}"`);
  if (p.estado) exigir(`projeto.estados.${p.estado}`, `o rótulo do estado "${p.estado}"`);
  if (p.relato) exigir(`projetos.${p.slug}.relato.projeto`, `o relato do projeto "${p.slug}"`);
  /* Um relato validado é um texto aprovado: uma lacuna esquecida lá dentro
     sairia em público como "<lacuna>date</lacuna>". */
  if (p.relato === "validado") {
    for (const l of linguas) {
      const relato = JSON.stringify(seguir(msgs[l], `projetos.${p.slug}.relato`) ?? {});
      if (relato.includes("<lacuna>")) problemas.push(`${l}.json: o relato validado de "${p.slug}" ainda tem lacunas`);
    }
  }
}

/* As chaves de `medias` levam hífenes (`chantier-g-etape1-a`): lê-se o objeto
   diretamente, e não pelo caminho com pontos. */
for (const l of linguas) {
  for (const imagem of manifesto.imagens) {
    const v = msgs[l].medias?.[imagem.id];
    if (typeof v !== "string" || v.trim() === "") {
      problemas.push(`${l}.json não tem texto alternativo para a imagem "${imagem.id}" (medias.${imagem.id})`);
    }
  }
  for (const video of manifesto.videos) {
    const v = msgs[l].medias?.videos?.[video.id];
    if (typeof v !== "string" || v.trim() === "") {
      problemas.push(`${l}.json não tem descrição para o vídeo "${video.id}" (medias.videos.${video.id})`);
    }
  }
}

/* ------------------------------------------------- 3. tipografia -- */

for (const l of linguas) {
  for (const caminho of chaves(msgs[l])) {
    const texto = seguir(msgs[l], caminho);
    if (typeof texto !== "string") continue;
    if (texto.includes("—")) problemas.push(`${l}.json: travessão (—) em ${caminho} — usar ponto, vírgula ou dois pontos`);
    if (texto.includes("'")) problemas.push(`${l}.json: apóstrofo reto (') em ${caminho} — usar ’`);
    /* Espaço normal antes de ; ! ? : (fora de um URL ou de uma hora). Só em
       francês: em português e inglês o sinal cola à palavra. */
    if (l.startsWith("fr") && / [;!?:](\s|$)/.test(texto)) {
      problemas.push(`${l}.json: espaço normal antes de ; ! ? : em ${caminho} — usar o espaço fino (U+202F) ou inseparável (U+00A0)`);
    }
    if (!l.startsWith("fr") && /[\u202F\u00A0][;!?:]/.test(texto)) {
      problemas.push(`${l}.json: espaço antes de ; ! ? : em ${caminho} — é regra do francês, não de ${l}`);
    }
  }
}

/* ------------------------------------------------------------- relatório -- */

if (problemas.length === 0) {
  console.log(
    `✓ ${base.length} chaves em ${linguas.join(", ")} · ${TODOS_OS_PROJETOS.length} projetos com título · ` +
      `${manifesto.imagens.length} imagens e ${manifesto.videos.length} vídeos com texto alternativo · tipografia em ordem`,
  );
  process.exit(0);
}

for (const p of problemas) console.error(`✖ ${p}`);
process.exit(1);
