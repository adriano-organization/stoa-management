# Formulário de contacto

O formulário usa uma Server Action, validação Zod no servidor e envio em texto simples pela API Resend. O endereço do visitante é `reply_to`; não se enviam respostas automáticas a endereços introduzidos no formulário.

## Configurar

1. Criar ou escolher uma conta Resend exclusiva da STOA.
2. Verificar o domínio remetente nessa conta.
3. Definir `RESEND_API_KEY`, `CONTACT_FROM` e `CONTACT_TO` apenas no servidor. Confirmar o destinatário com a empresa; o site existente indica dt@stoa-management.ch.
4. Configurar um Redis Upstash próprio com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
5. Fazer um envio autorizado para uma caixa controlada e confirmar receção e resposta ao visitante antes de publicar.

Sem configuração, a resposta é uma falha explícita, nunca sucesso. Em desenvolvimento, pedidos de teste podem aparecer no terminal; não usar dados pessoais reais nesses testes. Um 2xx do fornecedor significa aceitação do envio, não comprova entrega na caixa de entrada.

## Proteção e limites

Isco invisível, tempo mínimo de preenchimento e limites de conteúdo complementam 5 tentativas por ligação/hora e 40 por dia. IPv6 é agrupado por /64. Confirmar que o alojamento reescreve os cabeçalhos de IP antes de confiar neles.

Sem Redis, os contadores vivem no processo e reiniciam com ele. Se o Redis falhar, o código permite o envio e regista a falha. São decisões de disponibilidade, não uma proteção distribuída garantida. Não configurar credenciais do projeto anterior.

A página explica a utilização dos dados para responder. Retenção, prestadores e eventual texto jurídico devem ser validados pela STOA.
