import "server-only";
import type { Pedido } from "./esquema";

/*
  O envio do pedido de contacto, pela API do Resend (só `fetch`, sem SDK).

  ## As variáveis — todas da STOA, nenhuma herdada de outro projeto

  | variável | o quê |
  |---|---|
  | `RESEND_API_KEY` | a chave da conta Resend **da STOA** |
  | `CONTACT_FROM` | o remetente, num domínio verificado nessa conta, à letra (ex.: `Site STOA <site@stoa-management.ch>`) |
  | `CONTACT_TO` | quem recebe (a confirmar com a STOA; o site atual indica `dt@stoa-management.ch`) |

  Passo a passo em `docs/formulaire-contact.md`.

  ## Nunca "enviado" sem envio

  Sem configuração, isto **atira** — também em desenvolvimento. O visitante vê
  que o formulário não está ligado e recebe o email e o telefone diretos. Em
  desenvolvimento, o conteúdo do pedido sai também no terminal, para se poder
  experimentar o formulário de ponta a ponta sem conta de email.

  ## O que o email leva

  Texto simples, com o `reply_to` no email de quem escreveu: responder no
  cliente de email responde à pessoa. Não há resposta automática ao visitante —
  um formulário público que manda emails a qualquer endereço que lá se escreva
  é uma ferramenta de spam.
*/

export type MotivoDaFalha = "configuracao" | "servico";

export class ErroDeEnvio extends Error {
  readonly motivo: MotivoDaFalha;
  constructor(motivo: MotivoDaFalha, detalhe: string) {
    super(detalhe);
    this.name = "ErroDeEnvio";
    this.motivo = motivo;
  }
}

const VARIAVEIS = ["RESEND_API_KEY", "CONTACT_FROM", "CONTACT_TO"] as const;

export function variaveisEmFalta(): string[] {
  return VARIAVEIS.filter((nome) => !process.env[nome]?.trim());
}

export type Rotulos = { tipo: string; campos: Record<"nome" | "email" | "telefone" | "tipo" | "local" | "mensagem", string> };

export function corpoDoEmail(pedido: Pedido, rotulos: Rotulos): { assunto: string; texto: string } {
  const linha = (rotulo: string, valor: string) => (valor ? `${rotulo} : ${valor}` : null);
  const texto = [
    "Nouvelle demande envoyée depuis le formulaire du site.",
    "",
    linha(rotulos.campos.nome, pedido.nome),
    linha(rotulos.campos.email, pedido.email),
    linha(rotulos.campos.telefone, pedido.telefone),
    linha(rotulos.campos.tipo, rotulos.tipo),
    linha(rotulos.campos.local, pedido.local),
    "",
    `${rotulos.campos.mensagem} :`,
    pedido.mensagem,
    "",
    "—",
    "Répondre à ce message répond directement à la personne.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  /* O nome vai sem quebras de linha: um cabeçalho de email com `\n` lá dentro
     é a forma clássica de injetar cabeçalhos. O Resend já recusa, mas não se
     conta com isso. */
  const nome = pedido.nome.replace(/[\r\n]+/g, " ").slice(0, 80);
  return { assunto: `Demande de contact · ${rotulos.tipo} · ${nome}`, texto };
}

export async function enviarPedido(pedido: Pedido, rotulos: Rotulos): Promise<void> {
  const { assunto, texto } = corpoDoEmail(pedido, rotulos);
  const faltam = variaveisEmFalta();

  if (faltam.length) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        [
          "",
          `── DÉVELOPPEMENT — formulaire non relié (${faltam.join(", ")}) ──`,
          `Sujet : ${assunto}`,
          texto,
          "── rien n'a été envoyé ──",
          "",
        ].join("\n"),
      );
    } else {
      console.error(`[contact] envio impossível: ${faltam.join(", ")} em falta.`);
    }
    throw new ErroDeEnvio("configuracao", `${faltam.join(", ")} em falta`);
  }

  let resposta: Response;
  try {
    resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM!.trim(),
        to: process.env
          .CONTACT_TO!.split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        reply_to: pedido.email,
        subject: assunto,
        text: texto,
      }),
      cache: "no-store",
    });
  } catch (erro) {
    console.error(`[contact] o Resend não respondeu: ${(erro as Error).message}`);
    throw new ErroDeEnvio("servico", "sem resposta");
  }

  if (!resposta.ok) {
    /* O corpo da resposta do Resend não leva o conteúdo do pedido — pode ir
       para o registo sem expor quem escreveu. */
    console.error(`[contact] o Resend recusou (${resposta.status}): ${(await resposta.text()).slice(0, 300)}`);
    throw new ErroDeEnvio("servico", `estado ${resposta.status}`);
  }
}
