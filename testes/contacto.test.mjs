/*
  O formulário de contacto: o esquema (o mesmo no browser e no servidor), as
  defesas contra robôs e o envio — com o `fetch` simulado, para provar a regra
  que mais importa: **nunca há sucesso sem o serviço de email aceitar**.
*/
import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { LIMITES, lerValores, validar } from "../src/lib/contacto/esquema.ts";
import { MAXIMO_DE_LIGACOES, TEMPO_MINIMO_MS, contarLigacoes, suspeita } from "../src/lib/contacto/antispam.ts";
import { ErroDeEnvio, corpoDoEmail, enviarPedido, variaveisEmFalta } from "../src/lib/contacto/envio.ts";

const VALIDO = {
  nome: "Marie Test",
  email: "marie@example.ch",
  telefone: "+41 79 000 00 00",
  tipo: "renovation",
  local: "Bulle",
  mensagem: "Rénovation d’une maison de 1970, début souhaité au printemps.",
};

const ROTULOS = {
  tipo: "Rénovation ou transformation",
  campos: {
    nome: "Nom",
    email: "E-mail",
    telefone: "Téléphone",
    tipo: "Type de projet",
    local: "Localisation du chantier",
    mensagem: "Votre message",
  },
};

/* ------------------------------------------------------------- esquema -- */

test("um pedido completo passa, com os espaços à volta tirados", () => {
  const lido = validar({ ...VALIDO, nome: "  Marie Test  " });
  assert.equal(lido.ok, true);
  assert.equal(lido.pedido.nome, "Marie Test");
});

test("os obrigatórios em falta dão o código de cada campo, e só desses", () => {
  const lido = validar(lerValores({}));
  assert.equal(lido.ok, false);
  assert.deepEqual(lido.erros, { nome: "nome", email: "email", tipo: "tipo", mensagem: "mensagem" });
});

test("telefone e local são facultativos, mas o telefone tem de parecer um número", () => {
  assert.equal(validar({ ...VALIDO, telefone: "", local: "" }).ok, true);
  for (const bom of ["026 411 00 00", "+41 26 411 00 00", "(026) 411-00-00", "0041/26/4110000"]) {
    assert.equal(validar({ ...VALIDO, telefone: bom }).ok, true, bom);
  }
  for (const mau of ["abc", "12", "+41 abc 00", "appelez-moi"]) {
    assert.deepEqual(validar({ ...VALIDO, telefone: mau }).erros, { telefone: "telefone" }, mau);
  }
});

test("um tipo de projeto que não é da lista é recusado", () => {
  assert.deepEqual(validar({ ...VALIDO, tipo: "piscine" }).erros, { tipo: "tipo" });
});

test("texto acima dos limites dá 'longo', e uma mensagem curta dá 'mensagem'", () => {
  assert.deepEqual(validar({ ...VALIDO, nome: "a".repeat(LIMITES.nome + 1) }).erros, { nome: "longo" });
  assert.deepEqual(validar({ ...VALIDO, mensagem: "x".repeat(LIMITES.mensagem + 1) }).erros, {
    mensagem: "longo",
  });
  assert.deepEqual(validar({ ...VALIDO, mensagem: "court" }).erros, { mensagem: "mensagem" });
});

test("lerValores devolve sempre texto, venha de um FormData ou não", () => {
  const dados = new FormData();
  dados.set("nome", "Marie");
  dados.set("intrus", "x");
  const valores = lerValores(dados);
  assert.equal(valores.nome, "Marie");
  assert.equal(valores.email, "");
  assert.equal("intrus" in valores, false);
});

/* ------------------------------------------------------------ antispam -- */

const limpo = { isco: "", carimbo: "", agora: 1_000_000, mensagem: VALIDO.mensagem };

test("o isco preenchido é suspeito", () => {
  assert.equal(suspeita({ ...limpo, isco: "http://spam.example" }), "isco");
});

test("um carimbo recente demais é suspeito; sem carimbo (sem JavaScript) não é", () => {
  assert.equal(suspeita({ ...limpo, carimbo: String(limpo.agora - 500) }), "rapido");
  assert.equal(suspeita({ ...limpo, carimbo: String(limpo.agora - TEMPO_MINIMO_MS - 1) }), null);
  assert.equal(suspeita(limpo), null);
});

test(`mais de ${MAXIMO_DE_LIGACOES} ligações na mensagem é suspeito`, () => {
  const muitas = "https://a.ch www.b.ch http://c.ch https://d.ch";
  assert.equal(contarLigacoes(muitas), 4);
  assert.equal(suspeita({ ...limpo, mensagem: muitas }), "ligacoes");
  assert.equal(suspeita({ ...limpo, mensagem: "voir https://a.ch" }), null);
});

/* --------------------------------------------------------------- envio -- */

const ENV = ["RESEND_API_KEY", "CONTACT_FROM", "CONTACT_TO"];
let fetchOriginal;
let consoleOriginal;
let chamadas;

beforeEach(() => {
  fetchOriginal = globalThis.fetch;
  consoleOriginal = { log: console.log, error: console.error };
  console.log = () => {};
  console.error = () => {};
  chamadas = [];
  for (const nome of ENV) delete process.env[nome];
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  Object.assign(console, consoleOriginal);
  for (const nome of ENV) delete process.env[nome];
});

const simularFetch = (estado, corpo = "{}") => {
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes, corpo: JSON.parse(opcoes.body) });
    return new Response(corpo, { status: estado });
  };
};

const configurar = () => {
  process.env.RESEND_API_KEY = "re_teste_123456";
  process.env.CONTACT_FROM = "Site STOA <site@stoa-management.ch>";
  process.env.CONTACT_TO = "dt@stoa-management.ch";
};

test("sem configuração: atira 'configuracao' e não chega a chamar o serviço", async () => {
  simularFetch(200);
  assert.deepEqual(variaveisEmFalta(), ENV);
  await assert.rejects(
    enviarPedido(validar(VALIDO).pedido, ROTULOS),
    (e) => e instanceof ErroDeEnvio && e.motivo === "configuracao",
  );
  assert.equal(chamadas.length, 0);
});

test("configurado: um só pedido ao Resend, com reply_to no visitante e sem cópia para ele", async () => {
  configurar();
  simularFetch(200, '{"id":"abc"}');
  await enviarPedido(validar(VALIDO).pedido, ROTULOS);

  assert.equal(chamadas.length, 1);
  const [{ url, opcoes, corpo }] = chamadas;
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(opcoes.headers.Authorization, "Bearer re_teste_123456");
  assert.deepEqual(corpo.to, ["dt@stoa-management.ch"]);
  assert.equal(corpo.reply_to, "marie@example.ch");
  assert.equal(corpo.to.includes("marie@example.ch"), false);
  assert.match(corpo.subject, /Rénovation ou transformation/);
  assert.match(corpo.text, /début souhaité au printemps/);
});

test("se o Resend recusar, atira 'servico' — nunca devolve sucesso", async () => {
  configurar();
  for (const estado of [401, 403, 422, 500]) {
    simularFetch(estado, '{"message":"no"}');
    await assert.rejects(
      enviarPedido(validar(VALIDO).pedido, ROTULOS),
      (e) => e instanceof ErroDeEnvio && e.motivo === "servico",
      String(estado),
    );
  }
});

test("se o Resend nem responder, atira 'servico'", async () => {
  configurar();
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };
  await assert.rejects(enviarPedido(validar(VALIDO).pedido, ROTULOS), (e) => e.motivo === "servico");
});

test("o assunto nunca leva quebras de linha, venha o nome como vier", () => {
  const pedido = { ...validar(VALIDO).pedido, nome: "Marie\r\nBcc: todos@exemplo.ch" };
  const { assunto } = corpoDoEmail(pedido, ROTULOS);
  assert.equal(/[\r\n]/.test(assunto), false);
});

test("o email diz em que língua a pessoa escreveu, e só quando não é o francês", () => {
  const pedido = validar(VALIDO).pedido;
  assert.equal(corpoDoEmail(pedido, ROTULOS).texto.includes("Langue"), false);
  assert.match(corpoDoEmail(pedido, { ...ROTULOS, lingua: "Português" }).texto, /^Langue : Português$/m);
});
