import { z } from "zod";

/*
  O formulário de contacto: o que se pede, com que limites, e o que conta como
  erro. **O mesmo esquema corre no browser e no servidor** — o browser dá o
  aviso depressa, o servidor é quem decide.

  Sem imports além do `zod`, para os testes em `testes/` o carregarem com o
  `node --test`.

  Os erros são códigos (`"nome"`, `"email"`…) e não frases: a frase vive em
  `messages/fr-CH.json` (`contacto.formulario.erros`), porque muda com a língua.
*/

export const TIPOS_DE_PROJETO = ["renovation", "maison", "immeuble", "autre"] as const;
export type TipoDeProjeto = (typeof TIPOS_DE_PROJETO)[number];

export const LIMITES = {
  nome: 120,
  email: 254,
  telefone: 40,
  local: 120,
  mensagemMinimo: 10,
  mensagem: 4000,
} as const;

export const CAMPOS = ["nome", "email", "telefone", "tipo", "local", "mensagem"] as const;
export type Campo = (typeof CAMPOS)[number];
export type CodigoDeErro = "nome" | "email" | "telefone" | "tipo" | "mensagem" | "longo";

/* Um telefone suíço ou estrangeiro, escrito como as pessoas o escrevem:
   algarismos, espaços, `+`, parênteses, pontos, barras e hífenes. Não se tenta
   validar o plano de numeração — só apanhar o que claramente não é um número. */
const TELEFONE = /^\+?[0-9][0-9 ().\-/]{5,}$/;

export const EsquemaDoPedido = z.object({
  nome: z.string().trim().min(1, { error: "nome" }).max(LIMITES.nome, { error: "longo" }),
  email: z
    .string()
    .trim()
    .max(LIMITES.email, { error: "longo" })
    .pipe(z.email({ error: "email" })),
  telefone: z
    .string()
    .trim()
    .max(LIMITES.telefone, { error: "longo" })
    .refine((v) => v === "" || TELEFONE.test(v), { error: "telefone" }),
  tipo: z.enum(TIPOS_DE_PROJETO, { error: "tipo" }),
  local: z.string().trim().max(LIMITES.local, { error: "longo" }),
  mensagem: z
    .string()
    .trim()
    .min(LIMITES.mensagemMinimo, { error: "mensagem" })
    .max(LIMITES.mensagem, { error: "longo" }),
});

export type Pedido = z.infer<typeof EsquemaDoPedido>;
export type Erros = Partial<Record<Campo, CodigoDeErro>>;

/** Os valores tal como vieram do formulário, sempre texto, para os voltar a
    mostrar se o envio falhar (e o visitante não ter de escrever tudo outra vez). */
export type Valores = Record<Campo, string>;

export function lerValores(dados: FormData | Record<string, unknown>): Valores {
  const ler = (campo: Campo) => {
    const valor = dados instanceof FormData ? dados.get(campo) : dados[campo];
    return typeof valor === "string" ? valor.slice(0, LIMITES.mensagem + 100) : "";
  };
  return Object.fromEntries(CAMPOS.map((c) => [c, ler(c)])) as Valores;
}

export function validar(valores: Valores): { ok: true; pedido: Pedido } | { ok: false; erros: Erros } {
  const lido = EsquemaDoPedido.safeParse(valores);
  if (lido.success) return { ok: true, pedido: lido.data };

  const erros: Erros = {};
  for (const problema of lido.error.issues) {
    const campo = problema.path[0];
    if (typeof campo === "string" && (CAMPOS as readonly string[]).includes(campo) && !(campo in erros)) {
      erros[campo as Campo] = problema.message as CodigoDeErro;
    }
  }
  return { ok: false, erros };
}
