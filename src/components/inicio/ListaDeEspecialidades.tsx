"use client";

import { useState, type ReactNode } from "react";
import { useConsultaDeMedia } from "@/lib/movimento/preferencia";

type Item = {
  chave: string;
  numero: string;
  titulo: string;
  resumo: string;
  detalhe: string;
  imagem: ReactNode | null;
};

/**
 * A lista das competências e o painel de imagem ao lado.
 *
 * No ecrã largo, o painel mostra a imagem do item ativo — o que tem o rato
 * por cima, o último tocado ou escolhido, ou o primeiro. No telemóvel não há
 * painel: cada item leva a sua imagem por baixo do texto. O texto nunca se
 * esconde.
 *
 * O título de cada item é um botão (Tab, Enter) só quando há painel para ele
 * mudar: no telemóvel, e sem JavaScript, seria um botão que não faz nada. O
 * painel expõe só a imagem ativa, para que escolher tenha efeito também para
 * quem não a vê.
 */
export function ListaDeEspecialidades({ itens }: { itens: Item[] }) {
  const [ativo, setAtivo] = useState(0);
  /* O mesmo limite do CSS (`.especialidades__painel`, `max-width: 899px`). */
  const ecraLargo = useConsultaDeMedia("(min-width: 900px)") === true;
  const temImagens = itens.some((item) => item.imagem !== null);
  const comPainel = temImagens && ecraLargo;

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
              <h3 className="especialidade__titulo">
                {comPainel ? (
                  <button
                    type="button"
                    className="especialidade__botao"
                    aria-pressed={ativo === i}
                    aria-controls="especialidades-painel"
                    onClick={() => setAtivo(i)}
                  >
                    {item.titulo}
                  </button>
                ) : (
                  item.titulo
                )}
              </h3>
              <p className="especialidade__resumo">{item.resumo}</p>
              <p className="especialidade__detalhe suave">{item.detalhe}</p>
            </div>
            {item.imagem && <div className="especialidade__imagem-estreito">{item.imagem}</div>}
          </li>
        ))}
      </ol>

      {temImagens && (
        <div id="especialidades-painel" className="especialidades__painel">
          {itens.map((item, i) => (
            <div
              key={item.chave}
              className="especialidades__imagem"
              data-ativo={ativo === i ? "" : undefined}
              aria-hidden={ativo === i ? undefined : true}
            >
              {item.imagem}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
