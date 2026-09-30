# Revisão do site e das animações — 30 setembro 2026

## Parecer

A linguagem visual está bem estabelecida: arquitetura em primeiro plano, tipografia expressiva, tons minerais e uma composição própria. O movimento tem intenção e não depende de bibliotecas concorrentes. A base merece ser afinada, não refeita.

Ainda não considero o site pronto para publicação: há interações invisíveis no herói, lacunas no tratamento de movimento reduzido e conteúdo editorial que pode perder a marca de provisório sem ter sido validado.

Esta revisão não alterou código da aplicação nem publicou o site.

## Âmbito e evidência

Inspeção do código do movimento, componentes, estilos, publicação e formulário; observação no browser local em desenvolvimento. Desktop 1440 × 900; mobile 390 × 844 e verificações de largura mínima a 320 × 740. Foram observados herói, apresentação, pilha de projetos, vídeos, serviços, método, equipa, chamada final, rodapé, portefólio, um projeto com galeria e contacto. Navegação portefólio → projeto → voltar e menu → âncora testados.

Não corresponde a uma certificação de todos os dispositivos ou a uma inspeção visual individual das 14 páginas de projeto. O template foi examinado e uma página representativa percorrida. Não foram medidos FPS, Lighthouse ou Core Web Vitals. Não houve teste em telemóvel físico, Safari ou Firefox. Movimento reduzido e ausência de JavaScript foram avaliados no código; não foram emulados nesta revisão. Não foi enviado email real.

## Problemas a corrigir

### 1. P2 — Botões invisíveis continuam interativos durante o scroll do herói

**Confirmado no browser e no código.** A 1440 × 900, com scroll aproximado de 953 px, o conteúdo do herói tinha opacidade 0, mas os dois links mantinham `tabIndex=0` e a sua área continuava dentro do ecrã (topo aproximado de 555 px). A opacidade não remove foco nem interação.

Causa: `src/app/inicio.css:145`, especialmente a opacidade na linha 149. O desaparecimento completa-se antes do fim da sequência, quando `--p` atinge cerca de 0,588.

Impacto: quem navega por teclado pode chegar a ações que não consegue ver; existe também uma área clicável invisível sobre a fotografia.

Correção proposta: coordenar visibilidade e interatividade com a saída do conteúdo, incluindo o caso de um botão já ter foco. Ao regressar ao topo, restaurar ambos. Testar Tab/Shift+Tab durante toda a sequência.

### 2. P2 — Movimento reduzido não acompanha alterações feitas com a página aberta

**Confirmado por leitura do código; ainda sem reprodução por emulação.** O script do layout, o registo de progresso e o vídeo consultam a preferência ao iniciar, mas não subscrevem alterações. Ligar a redução de movimento depois de abrir a página não desliga o mecanismo de scroll já registado nem garante a paragem do vídeo. A regra global que reduz durações não neutraliza transformações diretamente calculadas a partir do scroll.

Locais: `src/app/[locale]/layout.tsx:54`, `src/lib/movimento/progresso.ts:106`, `src/components/VideoMudo.tsx:42`, `src/app/globals.css:374`.

Correção proposta: uma preferência reativa partilhada; limpar progressos, parar vídeos e garantir todo o conteúdo visível quando a preferência muda. Verificar nos dois sentidos sem recarregar a página.

### 3. P2 — Herói mantém uma zona fixa longa na alternativa sem movimento

**Confirmado no CSS; efeito visual previsto, não emulado.** O herói desktop mantém 190svh e o palco sticky. Com redução de movimento desde o carregamento, o progresso não é registado, mas essa geometria mantém-se. A fotografia fica parada durante aproximadamente 0,9 ecrã adicional de scroll. O mesmo princípio afeta a alternativa sem JavaScript.

Local: `src/app/inicio.css:12`. Os projetos já têm uma alternativa sem sticky com movimento reduzido; o herói não tem uma equivalente.

Correção proposta: herói estático com altura natural ou aproximadamente um ecrã nestes modos. Preservar título e ações.

### 4. P2 — Interação visual dos serviços não está disponível por teclado

**Confirmado no DOM e no código.** As linhas respondem a rato e clique, mas são elementos de lista sem foco ou operação por teclado. Não é possível escolher a imagem lateral com Tab/Enter. Os textos continuam todos disponíveis, pelo que não há perda da informação principal.

Local: `src/components/inicio/ListaDeEspecialidades.tsx:34`.

Correção proposta: tornar a seleção um controlo semântico acessível, com foco visível e estado ativo, ou assumir as imagens apenas como decoração sem interação de seleção. Em mobile a apresentação vertical já resolve bem o acesso à informação.

### 5. P1 antes de publicar — O modo de publicação não valida todo o conteúdo da homepage

**Confirmado no código.** A filtragem de projetos e perfis existe, mas não se estende a todos os conteúdos. O método é explicitamente descrito como proposta editorial por validar; o texto continua a ser renderizado em publicação, enquanto `SeloProvisorio` desaparece. A fotografia do herói e a imagem de partilha também são escolhidas independentemente da validação dos projetos.

Locais: `src/components/inicio/Metodo.tsx:15`, `src/components/SeloProvisorio.tsx:9`, `src/components/inicio/Heroi.tsx:55`, `src/lib/metadata.ts:59`.

Impacto: ativar publicação pode apresentar como definitivo um método ainda não aprovado e imagens cujos direitos/contexto continuam dependentes de confirmação. Isto é uma lacuna de preparação, não prova de que algo já tenha sido publicado sem autorização.

Correção proposta: validar explicitamente método e imagens institucionais, ou excluí-los/substituí-los até aprovação. A imagem de partilha genérica também merece atenção nas referências históricas para não sugerir que o edifício ilustrado pertence à referência.

### 6. P2 visual — Ampliação da fotografia desktop merece revisão

**Confirmado no CSS.** O original do herói tem 1280 px e a caixa permite 1920 px, antes do zoom adicional de até 10%. O limite potencial é portanto cerca de 1,65 vezes a largura original; não é um limite de 1,25 vezes. Não há necessariamente essa ampliação em todos os ecrãs: depende da geometria disponível.

Local: `src/app/inicio.css:35` e transformação da fotografia a partir da linha 66.

Correção proposta: testar a nitidez no tamanho final, sobretudo em ecrãs densos; preferir original maior ou limitar composição/zoom se a imagem perder definição. A escolha de uma fotografia vertical de maior resolução para mobile é acertada.

## O que está bem

- **Herói:** profundidade convincente entre marca e edifício, atividade compreensível e ações imediatamente acessíveis no estado inicial. O enquadramento mobile tem identidade própria.
- **Sistema de movimento:** um só mecanismo de progresso, scroll natural, listeners partilhados e limpeza dos registos. Não encontrei motores concorrentes a controlar os mesmos elementos.
- **Projetos em destaque:** alternância de composição e escala, entrada das imagens e sobreposição dos cartões funcionaram no desktop observado. O conteúdo deixa de depender da pilha no mobile.
- **Vídeos:** reprodução observada ao entrar no ecrã; pausa e repetição funcionaram sem abrir acidentalmente o projeto. Existem posters e alternativa estática.
- **Transições de página:** a passagem do portefólio para o projeto foi observada com transição da imagem; regressar ao portefólio funcionou. Não encontrei erro de navegação nesse percurso.
- **Método, equipa e rodapé:** hierarquia consistente; entradas discretas; marca final chega a uma composição completa. Os placeholders da equipa estão identificados, sem pessoas inventadas.
- **Mobile:** hero e serviços legíveis; menu coloca foco no botão de fechar; ligação para Expertises fecha o menu e posiciona a secção abaixo do cabeçalho. Sem overflow horizontal medido na homepage a 390 px e nas páginas de portefólio/contacto a 320 px.
- **Contacto:** etiquetas visíveis, telefone/local facultativos e resumo dos quatro erros obrigatórios em francês. O foco foi encaminhado para esse resumo após submissão vazia.
- **Dados e publicação:** projetos provisórios separados das referências de colaboradores; atribuições preservadas; dados desconhecidos podem ser omitidos. O controlo de publicação de projetos/equipa é uma boa base, apesar da lacuna institucional acima.
- **Console:** a consulta final dos avisos/erros capturados não devolveu entradas. Isto não substitui uma monitorização exaustiva de todas as rotas.

## Melhorias de direção visual — não são erros funcionais

1. **Encurtar ligeiramente o percurso dos destaques.** Quatro cartões com grande ocupação vertical tornam a chegada aos serviços lenta. Ajustaria espaçamentos e duração percebida antes de acrescentar efeitos.
2. **Reservar as entradas mais demoradas para momentos-chave.** A marca entra em cerca de 1,3 s, os serviços podem transitar durante 1,4 s e a equipa durante cerca de 1,1 s. Individualmente são coerentes; em conjunto podem dar uma sensação demasiado cerimonial. A hierarquia deve continuar centrada no herói, projetos e fecho.
3. **Rever o desfoque na transição entre projetos.** Funciona, mas pode fazer uma fotografia de resolução limitada parecer ainda mais suave durante a navegação. É uma escolha estética a comparar com uma transição sem blur.
4. **Completar o conteúdo para avaliar o ritmo final.** A equipa sem retratos e as páginas sem missão confirmada ainda não permitem julgar a força editorial pretendida. O esqueleto é bom, mas fotografias e informação real terão mais impacto do que novas animações.

## Pontos a medir, sem os tratar como bugs já reproduzidos

- O observador dos vídeos deteta interseção geométrica, não o facto de um cartão estar coberto por outro. Vale verificar se vídeos continuam a reproduzir por trás da pilha durante scroll rápido. Não foi isolada uma reprodução conclusiva deste caso nesta revisão.
- O motor alterna medições de geometria e escritas de estilos por elemento. Se aparecerem quebras de fluidez em dispositivos modestos, medir primeiro e considerar separar leitura/escrita. Não foi demonstrado um problema de FPS.
- Revalidar o estado das revelações após navegação rápida, voltar/avançar repetidos e mudança de preferência de movimento.

## Verificações técnicas

Reexecutadas nesta revisão: lint, TypeScript, mensagens e testes. Todas passaram; 28 testes aprovados. O verificador confirmou 250 chaves fr-CH, 14 projetos com título e alternativas textuais para 41 imagens e 4 vídeos.

Os testes automatizados confirmam que a ausência de configuração de email falha sem chamar o serviço, e que uma recusa do serviço não produz sucesso. Não equivalem a um email entregue nem a um teste end-to-end de todos os estados no browser.

Na etapa anterior desta mesma sessão passaram os builds de pré-visualização/publicação, a verificação de segredos e as verificações HTTP de rotas, incluindo 404 de projeto provisório em publicação. Não foram repetidos os builds nesta revisão porque o código da aplicação não foi alterado.

## Ordem de intervenção recomendada

1. Corrigir foco/interação dos botões durante a saída do herói.
2. Completar movimento reduzido e alternativa estática do herói.
3. Tornar a seleção dos serviços operável por teclado.
4. Fechar validação de método, imagens institucionais e partilha antes de ativar publicação.
5. Afinar ritmo dos projetos e nitidez do herói.
6. Inserir equipa/projetos aprovados, configurar email e testar entrega real; depois repetir QA em dispositivos reais e build de produção.

## Dependências externas

Retratos, nomes, funções e apresentações dos três perfis; validação dos agrupamentos, nomes, locais, missões e direitos das imagens; aprovação do método; original do logótipo se existir; configuração do serviço de email e teste de receção. Estas dependências não se resolvem com animação ou com inferências a partir das fotografias.
