"use server";

import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { CAMPO_CARIMBO, CAMPO_ISCO, suspeita } from "@/lib/contacto/antispam";
import { ErroDeEnvio, enviarPedido } from "@/lib/contacto/envio";
import { lerValores, validar, type Erros, type Valores } from "@/lib/contacto/esquema";
import { ligacaoDoPedido, podeEnviar } from "@/lib/contacto/limites";

/*
  A ação do formulário de contacto. Corre sempre no servidor — é aqui, e não
  no browser, que se decide o que é válido e o que sai.

  Uma server action e não uma rota: o formulário funciona sem JavaScript (o
  browser faz um POST normal e a página volta com o resultado), e o Next já
  verifica que o pedido vem do próprio site (cabeçalho `Origin`). A CSP tem
  `form-action 'self'`.

  | estado | quando | o visitante vê |
  |---|---|---|
  | `enviado` | o Resend aceitou o email (2xx) | a confirmação |
  | `invalido` | o esquema recusou um campo | os erros, campo a campo |
  | `falhou` | isco, pressa, links, limite, serviço ou falta de configuração | o motivo e os contactos diretos |
*/

export type Falha = "servico" | "configuracao" | "limite" | "rapido" | "ligacoes";

export type EstadoDoFormulario =
  | { estado: "inicial" }
  | { estado: "invalido"; erros: Erros; valores: Valores }
  | { estado: "falhou"; motivo: Falha; valores: Valores }
  | { estado: "enviado" };

export async function enviarPedidoDeContacto(
  _anterior: EstadoDoFormulario,
  dados: FormData,
): Promise<EstadoDoFormulario> {
  const valores = lerValores(dados);
  const texto = (nome: string) => {
    const v = dados.get(nome);
    return typeof v === "string" ? v : "";
  };

  const pedidaLingua = texto("lingua");
  const locale = hasLocale(routing.locales, pedidaLingua) ? pedidaLingua : routing.defaultLocale;

  const suspeito = suspeita({
    isco: texto(CAMPO_ISCO),
    carimbo: texto(CAMPO_CARIMBO),
    agora: Date.now(),
    mensagem: valores.mensagem,
  });
  /* O isco responde como uma falha de serviço: nunca um "enviado" que não
     foi, e nada que ensine o robô a não preencher o campo. */
  if (suspeito === "isco") return { estado: "falhou", motivo: "servico", valores };
  if (suspeito === "rapido") return { estado: "falhou", motivo: "rapido", valores };

  const validado = validar(valores);
  if (!validado.ok) return { estado: "invalido", erros: validado.erros, valores };

  if (suspeito === "ligacoes") return { estado: "falhou", motivo: "ligacoes", valores };

  if (!(await podeEnviar(await ligacaoDoPedido()))) {
    return { estado: "falhou", motivo: "limite", valores };
  }

  const t = await getTranslations({ locale, namespace: "contacto.formulario" });
  try {
    await enviarPedido(validado.pedido, {
      tipo: t(`tipos.${validado.pedido.tipo}`),
      campos: {
        nome: t("nome"),
        email: t("email"),
        telefone: t("telefone"),
        tipo: t("tipo"),
        local: t("local"),
        mensagem: t("mensagem"),
      },
    });
  } catch (erro) {
    if (erro instanceof ErroDeEnvio) return { estado: "falhou", motivo: erro.motivo, valores };
    throw erro;
  }

  return { estado: "enviado" };
}
