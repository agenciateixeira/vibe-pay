# Guia de Deploy - Vibe Pay

## 1. Deploy do Backend no Railway

### API Gateway (Porta 4000)

Variáveis de ambiente necessárias:

```env
# Portas dos serviços
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
PAYMENT_SERVICE_PORT=4002
WEBHOOK_SERVICE_PORT=4003

# URLs dos serviços internos (Railway fornece URLs privadas)
AUTH_SERVICE_URL=https://seu-auth-service.railway.app
PAYMENT_SERVICE_URL=https://seu-payment-service.railway.app
WEBHOOK_SERVICE_URL=https://seu-webhook-service.railway.app

# CORS origins
CORS_ORIGINS=https://seu-dominio-vercel.vercel.app

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# OpenPix
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
OPENPIX_WEBHOOK_SECRET=seu_webhook_secret_aqui

# Frontend URL
FRONTEND_URL=https://seu-dominio-vercel.vercel.app

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_min_32_caracteres
```

### Auth Service (Porta 4001)

Variáveis de ambiente necessárias:

```env
AUTH_SERVICE_PORT=4001

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_min_32_caracteres
```

### Payment Service (Porta 4002)

Variáveis de ambiente necessárias:

```env
PAYMENT_SERVICE_PORT=4002

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# OpenPix
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9

# Frontend URL
FRONTEND_URL=https://seu-dominio-vercel.vercel.app
```

### Webhook Service (Porta 4003)

Variáveis de ambiente necessárias:

```env
WEBHOOK_SERVICE_PORT=4003

# Supabase
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

# OpenPix
OPENPIX_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

## 2. Deploy do Frontend na Vercel

### Variáveis de ambiente necessárias:

```env
NEXT_PUBLIC_API_URL=https://vibe-payapi-gateway-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMjMsImV4cCI6MjA3NTkzOTIyM30.A1QqpvIbsblFq37BDiIQOtqQ1ftGFNPYGOwEEYetHIk
```

**IMPORTANTE**: Substitua `https://vibe-payapi-gateway-production.up.railway.app` pela URL real do seu API Gateway no Railway.

## 3. Configurar Webhook no OpenPix

Após o deploy do backend, configure o webhook no OpenPix:

1. Acesse o dashboard do OpenPix
2. Vá em Webhooks
3. Adicione o seguinte endpoint:

```
https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
```

4. Selecione os eventos:
   - `OPENPIX:CHARGE_COMPLETED`
   - `OPENPIX:TRANSACTION_RECEIVED`

5. Salve o webhook

## 4. Ordem de Deploy Recomendada

1. **Backend Services** (Railway):
   - Deploy Auth Service primeiro
   - Deploy Payment Service
   - Deploy Webhook Service
   - Deploy API Gateway por último (precisa das URLs dos outros serviços)

2. **Frontend** (Vercel):
   - Faça deploy após o API Gateway estar funcionando
   - Configure a variável `NEXT_PUBLIC_API_URL` com a URL do Gateway

3. **Webhook OpenPix**:
   - Configure após o backend estar 100% funcionando

## 5. Testes Pós-Deploy

Após o deploy, teste:

1. ✅ Acesse o frontend e faça login
2. ✅ Crie um produto
3. ✅ Crie um Payment Link
4. ✅ Gere um PIX
5. ✅ Pague o PIX (teste sandbox)
6. ✅ Verifique se o saldo foi atualizado
7. ✅ Verifique se a transação aparece no extrato
8. ✅ Teste um saque

## 6. Monitoramento

URLs para verificar saúde dos serviços:

- API Gateway: `https://seu-gateway.railway.app/health`
- Auth Service: `https://seu-auth.railway.app/health`
- Payment Service: `https://seu-payment.railway.app/health`
- Webhook Service: `https://seu-webhook.railway.app/health`

## 7. Troubleshooting

### Webhook retornando 500:
- Verifique se as variáveis `WEBHOOK_SERVICE_URL` estão configuradas corretamente
- Verifique os logs do Gateway e do Webhook Service

### Frontend não conecta ao backend:
- Verifique se `NEXT_PUBLIC_API_URL` está correto
- Verifique se o CORS está configurado com o domínio da Vercel

### Pagamentos não atualizam saldo:
- Verifique se o webhook foi configurado no OpenPix
- Verifique os logs em `/api/openpix/logs`
- Teste o webhook manualmente

### Erro JSON5 na Vercel:
- Certifique-se de que todas as variáveis de ambiente estão configuradas
- Limpe o cache da Vercel e faça redeploy
- Verifique se não há arquivos de configuração vazios
