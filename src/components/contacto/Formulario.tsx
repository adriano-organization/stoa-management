"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  enviarPedidoDeContacto,
  type EstadoDoFormulario,
  type Falha,
} from "@/app/[locale]/contact/accoes";
import { CAMPO_CARIMBO, CAMPO_ISCO } from "@/lib/contacto/antispam";
import {
  LIMITES,
  TIPOS_DE_PROJETO,
  lerValores,
  validar,
  type Campo,
  type CodigoDeErro,
  type Erros,
  type TipoDeProjeto,
} from "@/lib/contacto/esquema";

export type TextosDoFormulario = {
  titulo: string;
  obrigatorio: string;
  facultativo: string;
  campos: Record<Campo, string>;
  tipoEscolher: string;
  tipos: Record<TipoDeProjeto, string>;
  localAjuda: string;
  mensagemAjuda: string;
  isco: string;
  enviar: string;
  aEnviar: string;
  erros: Record<CodigoDeErro, string> & { resumoUm: string; resumoVarios: string };
  sucesso: { titulo: string; texto: string };
  falhas: Record<Falha, string>;
  novo: string;
  dados: string;
};

const ESTADO_INICIAL: EstadoDoFormulario = { estado: "inicial" };

/**
 * O formulário de contacto.
 *
 * - **Etiquetas sempre visíveis**, obrigatório/facultativo escrito por
 *   extenso, erros por baixo de cada campo e um resumo no topo que recebe o
 *   foco quando algo falha.
 * - **Valida no browser com o mesmo esquema do servidor** (`esquema.ts`) — e
 *   o servidor valida outra vez, porque é ele que decide.
 * - **Funciona sem JavaScript**: o `action` é uma server action, e a página
 *   volta com o resultado.
 * - **Só diz "enviado" quando o servidor diz** que o serviço de email aceitou.
 */
export function Formulario({ textos, lingua }: { textos: TextosDoFormulario; lingua: string }) {
  const [estado, accao, pendente] = useActionState(enviarPedidoDeContacto, ESTADO_INICIAL);
  const [errosDoCliente, setErrosDoCliente] = useState<Erros>({});
  const [carimbo, setCarimbo] = useState("");
  const resumo = useRef<HTMLDivElement>(null);
  const confirmacao = useRef<HTMLDivElement>(null);
  const falha = useRef<HTMLParagraphElement>(null);

  /* O carimbo de abertura: posto só no browser, e só quando o formulário
     monta — é ele que distingue uma pessoa de um robô que submete no instante
     em que a página abre (ver `antispam.ts`). */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarimbo(String(Date.now()));
  }, []);

  const erros: Erros = estado.estado === "invalido" ? { ...estado.erros, ...errosDoCliente } : errosDoCliente;
  const valores = "valores" in estado ? estado.valores : null;
  const quantos = Object.keys(erros).length;

  /* Depois de cada resposta do servidor, o foco vai para o que mudou: a
     confirmação, a falha ou o resumo dos erros. */
  useEffect(() => {
    if (estado.estado === "enviado") confirmacao.current?.focus();
    if (estado.estado === "falhou") falha.current?.focus();
    if (estado.estado === "invalido") resumo.current?.focus();
  }, [estado]);

  /* Com JavaScript, o envio é despachado aqui, numa transição, e não pelo
     `action` do `<form>`: quando é o React a despachar o `action`, repõe o
     formulário no fim — e o `<select>` voltava a "Choisir…" depois de cada
     resposta do servidor, obrigando a escolher outra vez. Sem JavaScript, o
     `action` continua a fazer o POST normal. */
  function aoSubmeter(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const verificado = validar(lerValores(dados));
    if (!verificado.ok) {
      setErrosDoCliente(verificado.erros);
      requestAnimationFrame(() => resumo.current?.focus());
      return;
    }
    setErrosDoCliente({});
    startTransition(() => accao(dados));
  }

  /* Ao corrigir um campo, o erro dele desaparece logo — não se espera pelo
     próximo envio para dizer que já está bem. */
  function aoMudar(campo: Campo) {
    if (errosDoCliente[campo]) {
      setErrosDoCliente((atuais) => {
        const novos = { ...atuais };
        delete novos[campo];
        return novos;
      });
    }
  }

  if (estado.estado === "enviado") {
    return (
      <div ref={confirmacao} tabIndex={-1} className="formulario__sucesso" role="status">
        <p className="legenda formulario__sinal" aria-hidden="true">
          ✓
        </p>
        <h2 className="texto-grande">{textos.sucesso.titulo}</h2>
        <p className="texto-medio suave">{textos.sucesso.texto}</p>
        <a href="" className="ligacao">
          {textos.novo}
        </a>
      </div>
    );
  }

  const idErro = (campo: Campo) => `erro-${campo}`;
  const idAjuda = (campo: Campo) => `ajuda-${campo}`;
  const descritoPor = (campo: Campo, ajuda?: boolean) =>
    [erros[campo] ? idErro(campo) : null, ajuda ? idAjuda(campo) : null].filter(Boolean).join(" ") || undefined;

  const erro = (campo: Campo) =>
    erros[campo] ? (
      <p id={idErro(campo)} className="campo__erro">
        {textos.erros[erros[campo]!]}
      </p>
    ) : null;

  const etiqueta = (campo: Campo, obrigatorio: boolean) => (
    <label htmlFor={`campo-${campo}`} className="campo__etiqueta">
      {textos.campos[campo]}{" "}
      <span className="campo__estatuto">{obrigatorio ? textos.obrigatorio : textos.facultativo}</span>
    </label>
  );

  return (
    <form action={accao} onSubmit={aoSubmeter} noValidate className="formulario" aria-describedby="formulario-dados">
      <input type="hidden" name="lingua" value={lingua} />
      <input type="hidden" name={CAMPO_CARIMBO} value={carimbo} />

      <div
        ref={resumo}
        tabIndex={-1}
        className="formulario__resumo"
        role={quantos ? "alert" : undefined}
        hidden={quantos === 0}
      >
        {quantos > 0 && (
          <>
            <p>{quantos === 1 ? textos.erros.resumoUm : textos.erros.resumoVarios.replace("{n}", String(quantos))}</p>
            <ul>
              {(Object.keys(erros) as Campo[]).map((campo) => (
                <li key={campo}>
                  <a href={`#campo-${campo}`}>{textos.campos[campo]}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="formulario__grelha">
        <div className="campo">
          {etiqueta("nome", true)}
          <input
            id="campo-nome"
            name="nome"
            type="text"
            autoComplete="name"
            required
            maxLength={LIMITES.nome}
            defaultValue={valores?.nome}
            aria-invalid={erros.nome ? true : undefined}
            aria-describedby={descritoPor("nome")}
            onChange={() => aoMudar("nome")}
          />
          {erro("nome")}
        </div>

        <div className="campo">
          {etiqueta("email", true)}
          <input
            id="campo-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={LIMITES.email}
            defaultValue={valores?.email}
            aria-invalid={erros.email ? true : undefined}
            aria-describedby={descritoPor("email")}
            onChange={() => aoMudar("email")}
          />
          {erro("email")}
        </div>

        <div className="campo">
          {etiqueta("telefone", false)}
          <input
            id="campo-telefone"
            name="telefone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={LIMITES.telefone}
            defaultValue={valores?.telefone}
            aria-invalid={erros.telefone ? true : undefined}
            aria-describedby={descritoPor("telefone")}
            onChange={() => aoMudar("telefone")}
          />
          {erro("telefone")}
        </div>

        <div className="campo">
          {etiqueta("tipo", true)}
          <div className="campo__seletor">
            <select
              id="campo-tipo"
              name="tipo"
              required
              defaultValue={valores?.tipo ?? ""}
              aria-invalid={erros.tipo ? true : undefined}
              aria-describedby={descritoPor("tipo")}
              onChange={() => aoMudar("tipo")}
            >
              <option value="" disabled>
                {textos.tipoEscolher}
              </option>
              {TIPOS_DE_PROJETO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {textos.tipos[tipo]}
                </option>
              ))}
            </select>
          </div>
          {erro("tipo")}
        </div>

        <div className="campo campo--largo">
          {etiqueta("local", false)}
          <input
            id="campo-local"
            name="local"
            type="text"
            autoComplete="address-level2"
            maxLength={LIMITES.local}
            defaultValue={valores?.local}
            aria-invalid={erros.local ? true : undefined}
            aria-describedby={descritoPor("local", true)}
            onChange={() => aoMudar("local")}
          />
          <p id={idAjuda("local")} className="campo__ajuda">
            {textos.localAjuda}
          </p>
          {erro("local")}
        </div>

        <div className="campo campo--largo">
          {etiqueta("mensagem", true)}
          <textarea
            id="campo-mensagem"
            name="mensagem"
            rows={7}
            required
            maxLength={LIMITES.mensagem}
            defaultValue={valores?.mensagem}
            aria-invalid={erros.mensagem ? true : undefined}
            aria-describedby={descritoPor("mensagem", true)}
            onChange={() => aoMudar("mensagem")}
          />
          <p id={idAjuda("mensagem")} className="campo__ajuda">
            {textos.mensagemAjuda}
          </p>
          {erro("mensagem")}
        </div>

        {/* O isco: fora do ecrã, fora da ordem de tabulação e escondido dos
            leitores de ecrã. Uma pessoa nunca o vê; um robô preenche-o. */}
        <div className="campo--isco" aria-hidden="true">
          <label htmlFor={`campo-${CAMPO_ISCO}`}>{textos.isco}</label>
          <input id={`campo-${CAMPO_ISCO}`} name={CAMPO_ISCO} type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {estado.estado === "falhou" && (
        <p ref={falha} tabIndex={-1} className="formulario__falha" role="alert">
          {textos.falhas[estado.motivo]}
        </p>
      )}

      <div className="formulario__envio">
        <button type="submit" className="botao" disabled={pendente} aria-disabled={pendente}>
          {pendente ? textos.aEnviar : textos.enviar}
          <span className="botao__seta" aria-hidden="true">
            →
          </span>
        </button>
        <p id="formulario-dados" className="formulario__dados suave">
          {textos.dados}
        </p>
      </div>
    </form>
  );
}
