# STOA — ajustar a entrada: desenho da cena inteira para fotografia completa

Quero corrigir a direção visual da introdução atual da homepage. Não estou a dizer que a animação está tecnicamente avariada: o problema é a composição de uma das fases.

## O que gosto e o que quero mudar

Gosto da entrada com linhas e do desenho arquitetónico. Atualmente vemos o desenho, depois aparece apenas a fotografia recortada do prédio sobre um fundo vazio, e só depois entra o resto da fotografia. Esse momento intermédio do prédio isolado parece sem vida e quebra a ligação à cena.

**Quero eliminar essa fase. A sequência deve ser: desenho da imagem inteira → fotografia inteira no mesmo enquadramento → hero pronto.**

## Resultado pretendido

- Preservar o desenho arquitetónico do prédio que já existe.
- Acrescentar um desenho simplificado do envolvente da própria fotografia: principais contornos do terreno, estrada, edifícios vizinhos, vegetação e horizonte, conforme o que está realmente visível.
- Dar maior definição ao prédio principal e usar linhas mais leves e menos numerosas no contexto. O objetivo é reconhecer a composição inteira, sem desenhar todas as folhas, janelas ou nuvens.
- Fazer as linhas aparecerem progressivamente, com um ritmo arquitetónico cuidado.
- Revelar depois a fotografia completa, de forma contínua, sob esse desenho. Durante um breve instante, as linhas e a fotografia coincidem; o desenho desaparece suavemente e fica a imagem real.
- Não voltar a mostrar a fotografia do prédio isolada enquanto o contexto ainda está vazio. Prédio e envolvente fotográficos entram juntos.
- Preservar exatamente a perspetiva, escala e posição durante a passagem. Nada de saltos de enquadramento ou de um desenho genérico que não coincide com a imagem.
- Integrar a marca STOA atrás do prédio e a entrada do título/botões na mesma passagem, evitando uma sucessão de apresentações independentes. O fim deve coincidir com o hero existente.

Uma dissolução coordenada da cena completa é um bom ponto de partida. O critério principal é sentir que o desenho se torna naquela fotografia, não que várias camadas sem relação estão a ser ligadas uma de cada vez.

## Como trabalhar

Lê o AGENTS.md e analisa a implementação atual antes de alterar. Confirma a geometria existente e observa a fotografia original. Usa os contornos já medidos quando forem úteis; mede os do contexto na mesma imagem. Não inventes edifícios, não alteres a arquitetura e não uses uma imagem gerada para substituir uma obra real.

O mobile usa outra fotografia: adapta o desenho à imagem efetivamente apresentada ou usa uma passagem mais simples da cena completa. Nunca sobreponhas os contornos da fotografia desktop à fotografia mobile.

Reutiliza a infraestrutura de animação existente, sem introduzir um segundo motor a controlar os mesmos elementos. Mantém scroll natural, respeito por movimento reduzido, alternativa sem JavaScript, interrupção da introdução por interação e comportamento correto ao regressar de uma página interior. Evita controlos invisíveis que continuem clicáveis ou focáveis.

Trata esta alteração como uma afinação visual localizada. Não redesenhes o resto do site nem alteres conteúdos, validações de projetos ou configurações de produção. Trabalha numa branch normal, sem worktrees; não publiques.

## Verificação

Observa no browser a sequência completa em desktop e mobile, incluindo o instante entre desenho e fotografia. Confirma que nunca surge o prédio fotografado sozinho, que os traços coincidem com a cena e que o estado final não dá um salto. Verifica também scroll durante a introdução, teclado, movimento reduzido e regresso de uma página interior. Executa as verificações exigidas pelo repositório.

Implementa a alteração e entrega um resumo curto do resultado e de qualquer limitação que não tenhas conseguido verificar. A prioridade é a continuidade visual entre o desenho da cena e a fotografia completa.
