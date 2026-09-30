import { useSyncExternalStore } from "react";

/**
 * # Consultas de media que o React acompanha
 *
 * Ler `matchMedia(...).matches` uma vez, ao montar, não chega: a preferência
 * de movimento muda-se nas definições do sistema com a página aberta, e quem
 * a liga a meio da visita espera que o movimento pare logo, sem recarregar.
 * Por isso a consulta é uma fonte externa (`useSyncExternalStore`) e cada
 * componente volta a renderizar quando ela muda.
 *
 * **`null` quer dizer "ainda não se sabe"**: é o valor no servidor e durante a
 * hidratação, e os efeitos desse primeiro momento também o veem. Quem usa a
 * consulta não faz nada com `null` — nem liga, nem desliga — e espera pelo
 * valor real, que chega logo a seguir.
 */
export function useConsultaDeMedia(consulta: string): boolean | null {
  return useSyncExternalStore(
    (avisar) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", avisar);
      return () => lista.removeEventListener("change", avisar);
    },
    () => window.matchMedia(consulta).matches,
    () => null,
  );
}

export const useMenosMovimento = () => useConsultaDeMedia("(prefers-reduced-motion: reduce)");
