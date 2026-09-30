/*
  As defesas baratas contra formulários automáticos. Nenhuma é infalível; as
  três juntas, mais os limites de `limites.ts`, tiram quase todo o lixo sem
  pedir nada a quem escreve (nada de CAPTCHA, que também seria um terceiro a
  carregar na página).

  Sem imports, para os testes em `testes/` a carregarem com o `node --test`.

  | defesa | apanha | o que a pessoa vê |
  |---|---|---|
  | isco | robôs que preenchem todos os campos | a mesma mensagem de falha que um erro de serviço — nunca um "enviado" que não foi |
  | tempo mínimo | robôs que submetem no instante em que a página abre | "enviado depressa demais, envie outra vez" |
  | ligações | mensagens que são só links | pedido para tirar links |
*/

/* O nome do campo-isco: não pode ser um que o preenchimento automático do
   browser reconheça (`website`, `url`, `company`…), senão apanha pessoas. */
export const CAMPO_ISCO = "reference_interne";
export const CAMPO_CARIMBO = "ouvert_le";

/* Ninguém lê o formulário, escreve um nome, um email e uma mensagem de dez
   caracteres em menos de três segundos. */
export const TEMPO_MINIMO_MS = 3000;
export const MAXIMO_DE_LIGACOES = 3;

export type Suspeita = "isco" | "rapido" | "ligacoes";

export function contarLigacoes(texto: string): number {
  return (texto.match(/https?:\/\/|www\./gi) ?? []).length;
}

export function suspeita({
  isco,
  carimbo,
  agora,
  mensagem,
}: {
  isco: string;
  carimbo: string;
  agora: number;
  mensagem: string;
}): Suspeita | null {
  if (isco.trim() !== "") return "isco";

  /* O carimbo é posto pelo browser quando o formulário monta. Sem JavaScript
     não há carimbo — e quem não tem JavaScript não é, por isso, suspeito. Um
     carimbo presente e recente demais, é. */
  const aberto = Number(carimbo);
  if (carimbo !== "" && Number.isFinite(aberto) && agora - aberto < TEMPO_MINIMO_MS) return "rapido";

  if (contarLigacoes(mensagem) > MAXIMO_DE_LIGACOES) return "ligacoes";

  return null;
}
