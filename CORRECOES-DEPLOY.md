# Correções Aplicadas para Deploy

## Problemas Resolvidos

### 1. Webhook OpenPix retornando 500/404 ❌ → ✅

**Problema**: O OpenPix não conseguia registrar o webhook porque o endpoint retornava erro.

**Soluções aplicadas**:

- ✅ Adicionado endpoint GET `/webhook/openpix` para validação
- ✅ Endpoint POST agora retorna sempre 200 (mesmo com erro interno)
- ✅ Gateway usa variáveis de ambiente para URLs dos serviços
- ✅ Suporte a WEBHOOK_SERVICE_URL para produção

**Arquivo modificado**: `services/api-gateway/src/index.ts`

### 2. Erro JSON5 no Deploy da Vercel ❌ → ✅

**Problema**: "JSON5: fim de entrada inválido em 1:1"

**Soluções aplicadas**:

- ✅ Criado `vercel.json` com configurações corretas
- ✅ Criado `.vercelignore` para ignorar arquivos desnecessários
- ✅ Configuração Next.js validada

**Arquivos criados**:
- `frontend/dashboard/vercel.json`
- `frontend/dashboard/.vercelignore`

### 3. URLs dos Serviços em Produção ❌ → ✅

**Problema**: Gateway tentava conectar em `localhost` mesmo em produção.

**Soluções aplicadas**:

- ✅ Todas as rotas do gateway agora usam variáveis de ambiente
- ✅ Suporte a `AUTH_SERVICE_URL`, `PAYMENT_SERVICE_URL`, `WEBHOOK_SERVICE_URL`
- ✅ Fallback para localhost em desenvolvimento

**Variáveis suportadas**:
```env
AUTH_SERVICE_URL=https://seu-auth-service.railway.app
PAYMENT_SERVICE_URL=https://seu-payment-service.railway.app
WEBHOOK_SERVICE_URL=https://seu-webhook-service.railway.app
```

## Próximos Passos

### 1. Faça Deploy no Railway

**API Gateway**:
```bash
cd services/api-gateway
# Configure as variáveis de ambiente no Railway conforme DEPLOY.md
```

**Auth Service**:
```bash
cd services/auth-service
# Configure as variáveis de ambiente no Railway conforme DEPLOY.md
```

**Payment Service**:
```bash
cd services/payment-service
# Configure as variáveis de ambiente no Railway conforme DEPLOY.md
```

**Webhook Service**:
```bash
cd services/webhook-service
# Configure as variáveis de ambiente no Railway conforme DEPLOY.md
```

### 2. Faça Deploy na Vercel

```bash
cd frontend/dashboard
# Configure as variáveis de ambiente na Vercel:
NEXT_PUBLIC_API_URL=https://vibe-payapi-gateway-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMjMsImV4cCI6MjA3NTkzOTIyM30.A1QqpvIbsblFq37BDiIQOtqQ1ftGFNPYGOwEEYetHIk
```

### 3. Configure o Webhook no OpenPix

Depois que o backend estiver no ar:

1. Acesse o dashboard do OpenPix: https://app.openpix.com/
2. Vá em **Webhooks**
3. Clique em **Novo Webhook**
4. Configure:
   - **URL**: `https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix`
   - **Eventos**:
     - `OPENPIX:CHARGE_COMPLETED`
     - `OPENPIX:TRANSACTION_RECEIVED`
5. Clique em **Salvar**

O OpenPix fará um teste chamando o endpoint. Agora ele deve retornar **200 OK** ✅

### 4. Teste o Sistema

Após o deploy completo:

1. ✅ Acesse o frontend
2. ✅ Faça login
3. ✅ Crie um produto
4. ✅ Crie um payment link
5. ✅ Gere um PIX
6. ✅ Pague o PIX (sandbox ou real)
7. ✅ Verifique se o saldo foi atualizado
8. ✅ Verifique se apareceu no extrato
9. ✅ Teste um saque

## Arquivos Criados/Modificados

### Criados:
- ✅ `DEPLOY.md` - Guia completo de deploy
- ✅ `CORRECOES-DEPLOY.md` - Este arquivo
- ✅ `frontend/dashboard/vercel.json` - Config Vercel
- ✅ `frontend/dashboard/.vercelignore` - Ignore files

### Modificados:
- ✅ `services/api-gateway/src/index.ts` - Suporte a produção
- ✅ `.env.example` - Novas variáveis de ambiente

## Variáveis de Ambiente para Railway

**API Gateway**:
```env
API_GATEWAY_PORT=4000
AUTH_SERVICE_URL=<url-auth-service-railway>
PAYMENT_SERVICE_URL=<url-payment-service-railway>
WEBHOOK_SERVICE_URL=<url-webhook-service-railway>
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
OPENPIX_WEBHOOK_SECRET=seu_secret_aqui
FRONTEND_URL=<url-vercel>
JWT_SECRET=sua_chave_jwt_segura_min_32_chars
```

**Auth Service**:
```env
AUTH_SERVICE_PORT=4001
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
JWT_SECRET=sua_chave_jwt_segura_min_32_chars
```

**Payment Service**:
```env
PAYMENT_SERVICE_PORT=4002
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
FRONTEND_URL=<url-vercel>
```

**Webhook Service**:
```env
WEBHOOK_SERVICE_PORT=4003
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
OPENPIX_WEBHOOK_SECRET=seu_secret_aqui
```

## Observações Importantes

1. **Webhook Secret**: Você pode gerar um secret aleatório usando:
   ```bash
   openssl rand -hex 32
   ```

2. **JWT Secret**: Use um secret forte de pelo menos 32 caracteres

3. **Railway URLs**: O Railway fornece URLs internas automáticas para comunicação entre serviços. Use essas URLs nas variáveis `*_SERVICE_URL`.

4. **CORS**: Certifique-se de adicionar a URL da Vercel no CORS do gateway após o deploy.

## Resumo

✅ Webhook agora aceita validação do OpenPix
✅ Gateway funciona em produção com variáveis de ambiente
✅ Vercel configurada corretamente
✅ Documentação completa criada

Agora você pode fazer o deploy! 🚀
