import "server-only";
import { headers } from "next/headers";
import { redeDe } from "@/lib/rede";

/*
  Quantos pedidos de contacto o formulário aceita.

  | limite | quanto | porquê |
  |---|---|---|
  | por ligação | 5 por hora | uma pessoa que se engana e reenvia passa; um script não |
  | ao todo | 40 por dia | o teto que o de cima não vê (muitas ligações diferentes) |

  "Por ligação" é por IPv4, ou por bloco /64 em IPv6 — ver `src/lib/rede.ts`.
  O endereço nunca é guardado: a chave é um hash com prazo.

  ## Onde se conta

  Com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (a integração do
  Upstash na Vercel põe-nas sozinha), num Redis — que é o único sítio onde um
  contador sobrevive entre invocações de uma função serverless.

  Sem elas, conta-se na memória do processo, com um aviso no registo. Em
  serverless isso é um limite fraco (cada instância nova começa do zero), mas
  **o formulário continua a funcionar**: bloquear os pedidos de contacto de
  uma empresa porque falta configurar um contador seria trocar um incómodo
  (algum spam) por um prejuízo (clientes sem resposta). O isco e o tempo
  mínimo (`antispam.ts`) continuam a valer.
*/

const HORA_S = 60 * 60;
const DIA_S = 24 * HORA_S;
export const POR_LIGACAO = 5;
export const TETO_DIARIO = 40;

async function hash(texto: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(bytes).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A ligação de onde veio o pedido, pelos cabeçalhos que a plataforma escreve. */
export async function ligacaoDoPedido(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  return redeDe(ip);
}

function upstash(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

const memoria = new Map<string, { valor: number; expira: number }>();
let avisou = false;

function somarEmMemoria(chave: string, prazo: number): number {
  if (!avisou) {
    avisou = true;
    console.warn(
      "[contact] Sem Upstash configurado: os limites de envio contam na memória deste processo. " +
        "Ver docs/formulaire-contact.md.",
    );
  }
  const agora = Date.now();
  const atual = memoria.get(chave);
  const valor = atual && atual.expira > agora ? atual.valor + 1 : 1;
  memoria.set(chave, { valor, expira: atual && atual.expira > agora ? atual.expira : agora + prazo * 1000 });
  return valor;
}

/** Soma 1 à chave e devolve o total; a chave expira `prazo` segundos depois
    do primeiro incremento. */
async function somar(chave: string, prazo: number): Promise<number> {
  const ligado = upstash();
  if (!ligado) return somarEmMemoria(chave, prazo);

  const resposta = await fetch(`${ligado.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ligado.token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", chave],
      ["EXPIRE", chave, String(prazo), "NX"],
    ]),
    cache: "no-store",
  });
  if (!resposta.ok) throw new Error(`Upstash respondeu ${resposta.status}`);
  const [incremento] = (await resposta.json()) as [{ result?: number; error?: string }];
  if (typeof incremento?.result !== "number") throw new Error(`Upstash: ${incremento?.error ?? "resposta inesperada"}`);
  return incremento.result;
}

/**
 * `true` se ainda pode enviar. Se o contador falhar (Upstash em baixo), deixa
 * passar e regista: pela mesma razão de cima, um contador avariado não pode
 * calar o formulário.
 */
export async function podeEnviar(ligacao: string): Promise<boolean> {
  try {
    const [porLigacao, noDia] = await Promise.all([
      somar(`contact:ligacao:${await hash(ligacao)}`, HORA_S),
      somar(`contact:dia:${new Date().toISOString().slice(0, 10)}`, DIA_S),
    ]);
    if (porLigacao > POR_LIGACAO || noDia > TETO_DIARIO) {
      console.warn(`[contact] limite atingido (ligação ${porLigacao}/${POR_LIGACAO}, dia ${noDia}/${TETO_DIARIO})`);
      return false;
    }
    return true;
  } catch (erro) {
    console.error(`[contact] contador indisponível, pedido aceite sem limite: ${(erro as Error).message}`);
    return true;
  }
}
