/**
 * A marca, em composição tipográfica **provisória**.
 *
 * O logótipo oficial (a folha com riscas, verde) só existe em PNG pequeno, com
 * gradiente e sombra incorporados, e sem versão para fundo escuro: não aguenta
 * nem o tamanho nem as fotografias por baixo do cabeçalho. Até chegar o
 * original vetorial, a marca é esta: STOA em Archivo expandida e "Management"
 * no registo das legendas. É sóbria de propósito — é para ser trocada.
 *
 * `aria-hidden` porque quem a usa (o link do cabeçalho, o rodapé) já diz o
 * nome por extenso a quem lê com leitor de ecrã.
 */
export function Marca({ className }: { className?: string }) {
  return (
    <span className={`marca ${className ?? ""}`} aria-hidden="true">
      <span className="marca__nome">STOA</span>
      <span className="marca__segundo">Management</span>
    </span>
  );
}
