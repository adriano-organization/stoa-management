/*
  Depois do `npm run build`: nada do que é do servidor foi parar ao browser.

  O `server-only` já faz o build rebentar se um módulo marcado for importado
  por um componente do browser, mas só protege os ficheiros que se lembraram
  de o importar. Isto olha para o **resultado** — o JavaScript em
  `.next/static` e o HTML e RSC que o build pré-gerou — e procura:

  1. **Valores de segredos.** O CI faz o build com valores sentinela nas
     variáveis sensíveis (ver `.github/workflows/ci.yml`). O build não as lê,
     e é isso que se prova: se uma aparecer aqui, alguém a pôs num sítio
     onde o Next a embute.
  2. **Código que só o servidor pode ter** — o endereço da API de email e o
     prefixo das chaves dos contadores. Um destes no browser quer dizer que um
     módulo de `src/lib/contacto/` foi parar ao cliente.

  Nunca imprime o valor de um segredo encontrado: só o nome da variável e o
  ficheiro.
*/
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const NEXT = join(RAIZ, ".next");

if (!existsSync(NEXT)) {
  console.error("✖ Falta o .next — correr `npm run build` primeiro.");
  process.exit(1);
}

function ficheiros(pasta, aceitar) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return ficheiros(caminho, aceitar);
    return aceitar(caminho) ? [caminho] : [];
  });
}

/* O que o browser pode receber: os pedaços de JavaScript e CSS, e o HTML e
   RSC das páginas pré-geradas. */
const PUBLICOS = [
  ...ficheiros(join(NEXT, "static"), () => true),
  ...ficheiros(join(NEXT, "server", "app"), (c) => /\.(html|rsc|body)$/.test(c)),
];

const SENSIVEIS = [
  "RESEND_API_KEY",
  "UPSTASH_REDIS_REST_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "KV_REST_API_TOKEN",
  "KV_REST_API_URL",
];

const SO_DO_SERVIDOR = ["api.resend.com", "contact:ligacao:", ...SENSIVEIS];

const problemas = [];
const relativo = (c) => c.slice(RAIZ.length);

for (const caminho of PUBLICOS) {
  const texto = readFileSync(caminho, "utf8");

  for (const nome of SENSIVEIS) {
    const valor = process.env[nome];
    if (valor && valor.length >= 8 && texto.includes(valor)) {
      problemas.push(`o valor de ${nome} está em ${relativo(caminho)}`);
    }
  }

  for (const marca of SO_DO_SERVIDOR) {
    if (texto.includes(marca)) problemas.push(`"${marca}" está em ${relativo(caminho)}`);
  }
}

if (problemas.length) {
  console.error("✖ Há coisas do servidor no que vai para o browser:");
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

const sentinelas = SENSIVEIS.filter((n) => process.env[n]).length;
console.log(
  `✓ ${PUBLICOS.length} ficheiros públicos sem segredos (${sentinelas} valores procurados) ` +
    `e sem código do servidor.`,
);
