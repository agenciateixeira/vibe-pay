# Configuração Railway - Vibe Pay

## Domínios dos Serviços

```
✅ API Gateway:      vibe-payapi-gateway-production.up.railway.app
✅ Auth Service:     vibe-payauth-service-production.up.railway.app
✅ Payment Service:  vibe-paypayment-service-production.up.railway.app
✅ Webhook Service:  vibe-paywebhook-service.railway.internal
```

---

## Variáveis de Ambiente - API Gateway

Configure estas variáveis no **API Gateway** do Railway:

```env
# Portas
API_GATEWAY_PORT=4000

# URLs dos Serviços Internos
AUTH_SERVICE_URL=https://vibe-payauth-service-production.up.railway.app
PAYMENT_SERVICE_URL=https://vibe-paypayment-service-production.up.railway.app
WEBHOOK_SERVICE_URL=https://vibe-paywebhook-service.railway.internal

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# OpenPix
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
OPENPIX_WEBHOOK_SECRET=seu_webhook_secret_aqui

# Frontend URL (coloque a URL da Vercel depois do deploy)
FRONTEND_URL=https://seu-dominio.vercel.app

# JWT
JWT_SECRET=sua_chave_jwt_super_segura_min_32_caracteres
```

---

## Variáveis de Ambiente - Auth Service

Configure estas variáveis no **Auth Service** do Railway:

```env
# Porta
AUTH_SERVICE_PORT=4001

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# JWT
JWT_SECRET=sua_chave_jwt_super_segura_min_32_caracteres
```

---

## Variáveis de Ambiente - Payment Service

Configure estas variáveis no **Payment Service** do Railway:

```env
# Porta
PAYMENT_SERVICE_PORT=4002

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# OpenPix
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9

# Frontend URL (coloque a URL da Vercel depois do deploy)
FRONTEND_URL=https://seu-dominio.vercel.app
```

---

## Variáveis de Ambiente - Webhook Service

Configure estas variáveis no **Webhook Service** do Railway:

```env
# Porta
WEBHOOK_SERVICE_PORT=4003

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# OpenPix
OPENPIX_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

---

## URLs para Testar

Depois de configurar as variáveis, teste esses endpoints:

### 1. API Gateway Health
```
https://vibe-payapi-gateway-production.up.railway.app/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "service": "vibe-pay-api-gateway",
  "timestamp": "...",
  "uptime": 123
}
```

### 2. Webhook OpenPix GET
```
https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Webhook endpoint is ready",
  "service": "Vibe Pay OpenPix Webhook"
}
```

### 3. Auth Service Health
```
https://vibe-payauth-service-production.up.railway.app/health
```

### 4. Payment Service Health
```
https://vibe-paypayment-service-production.up.railway.app/health
```

Se todos retornarem 200 OK, os serviços estão funcionando! ✅

---

## Configuração da Vercel

Na Vercel, configure estas variáveis de ambiente:

```env
NEXT_PUBLIC_API_URL=https://vibe-payapi-gateway-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMjMsImV4cCI6MjA3NTkzOTIyM30.A1QqpvIbsblFq37BDiIQOtqQ1ftGFNPYGOwEEYetHIk
```

---

## Configuração do Webhook no OpenPix

URL para configurar no OpenPix:

```
https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
```

### Passo a passo:

1. Acesse: https://app.openpix.com/
2. Vá em **Webhooks**
3. Clique em **"Novo Webhook"**
4. Preencha:
   - **Nome**: Vibe Pay - Produção
   - **URL**: `https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix`
   - **Método**: POST
   - **Eventos**:
     - ✅ OPENPIX:CHARGE_COMPLETED
     - ✅ OPENPIX:TRANSACTION_RECEIVED
5. Clique em **"Salvar"**

O OpenPix vai testar o endpoint e deve retornar **200 OK** ✅

---

## Checklist Final

Antes de usar em produção, verifique:

### Railway:
- ✅ Todas as variáveis de ambiente configuradas nos 4 serviços
- ✅ Todos os serviços rodando (status verde)
- ✅ Endpoints `/health` respondendo 200 OK
- ✅ Webhook endpoint respondendo 200 OK no GET

### Vercel:
- ✅ Variáveis de ambiente configuradas
- ✅ Deploy concluído com sucesso
- ✅ Frontend carregando corretamente
- ✅ Console do navegador sem erros

### OpenPix:
- ✅ Webhook criado e ativo
- ✅ Status: Validado ✅
- ✅ Eventos: CHARGE_COMPLETED e TRANSACTION_RECEIVED

### Teste Final:
1. ✅ Login no dashboard funciona
2. ✅ Criar produto funciona
3. ✅ Criar payment link funciona
4. ✅ Gerar PIX funciona
5. ✅ Fazer pagamento PIX
6. ✅ Aguardar 30 segundos
7. ✅ Verificar se saldo foi atualizado
8. ✅ Verificar se transação aparece no extrato

Se tudo funcionar, o sistema está pronto para produção! 🚀

---

## Troubleshooting

### Erro: "Cannot connect to AUTH_SERVICE_URL"

Verifique se a variável `AUTH_SERVICE_URL` no API Gateway está correta:
```
https://vibe-payauth-service-production.up.railway.app
```

### Erro: "Webhook 500"

1. Verifique logs do API Gateway
2. Verifique logs do Webhook Service
3. Verifique se `WEBHOOK_SERVICE_URL` está correto

### Erro: "Payment not found"

1. Verifique se o pagamento foi salvo na tabela `payments`
2. Verifique logs do Payment Service quando gerar o PIX
3. Verifique se o `correlation_id` está correto

---

## Observação sobre o Webhook Service

O domínio do Webhook Service é `.railway.internal`, o que significa que ele é acessível apenas **dentro da rede interna do Railway**.

Isso está correto! O API Gateway (que é público) faz proxy das requisições para o Webhook Service interno.

Fluxo:
```
OpenPix → API Gateway (público) → Webhook Service (interno) → Supabase
```

---

## Próximos Passos

1. Configure as variáveis no Railway (se ainda não fez)
2. Faça deploy na Vercel
3. Configure o webhook no OpenPix
4. Teste com um pagamento real
5. Se funcionar, está pronto! 🎉

Se tiver qualquer erro, veja o arquivo `COMO-CONFIGURAR-WEBHOOK-OPENPIX.md` para troubleshooting detalhado.
