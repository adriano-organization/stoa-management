"use client";

import { useState, type ReactNode } from "react";

type Item = {
  chave: string;
  numero: string;
  titulo: string;
  resumo: string;
  detalhe: string;
  imagem: ReactNode;
};

/**
 * A lista das competências e o painel de imagem ao lado.
 *
 * No ecrã largo, o painel mostra a imagem do item ativo — o que tem o rato
 * por cima, o último tocado, ou o primeiro. No telemóvel não há painel: cada
 * item leva a sua imagem por baixo do texto. O texto nunca se esconde.
 */
export function ListaDeEspecialidades({ itens }: { itens: Item[] }) {
  const [ativo, setAtivo] = useState(0);

  return (
    <div className="especialidades__corpo">
      <ol className="especialidades__lista">
        {itens.map((item, i) => (
          <li
            key={item.chave}
            className="especialidade"
            data-ativo={ativo === i ? "" : undefined}
            data-revelar=""
            style={{ "--atraso": `${i * 90}ms` } as React.CSSProperties}
            onPointerEnter={(e) => e.pointerType === "mouse" && setAtivo(i)}
            onClick={() => setAtivo(i)}
          >
            <p className="legenda especialidade__numero">{item.numero}</p>
            <div className="especialidade__texto">
              <h3 className="especialidade__titulo">{item.titulo}</h3>
              <p className="especialidade__resumo">{item.resumo}</p>
              <p className="especialidade__detalhe suave">{item.detalhe}</p>
            </div>
            <div className="especialidade__imagem-estreito">{item.imagem}</div>
          </li>
        ))}
      </ol>

      <div className="especialidades__painel" aria-hidden="true">
        {itens.map((item, i) => (
          <div key={item.chave} className="especialidades__imagem" data-ativo={ativo === i ? "" : undefined}>
            {item.imagem}
          </div>
        ))}
      </div>
    </div>
  );
}
