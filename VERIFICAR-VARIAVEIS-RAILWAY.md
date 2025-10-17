# Checklist - Variáveis de Ambiente no Railway

## ❌ Erro 500 no Login - Causa Provável

O erro 500 geralmente acontece quando:
1. **SUPABASE_URL** não está configurada
2. **SUPABASE_SERVICE_ROLE_KEY** não está configurada
3. As variáveis estão com valores errados

---

## ✅ Como Verificar e Corrigir

### 1. Auth Service (MAIS IMPORTANTE!)

Acesse: https://railway.app/ → **vibe-payauth-service-production** → **Variables**

**Variáveis OBRIGATÓRIAS:**

```env
AUTH_SERVICE_PORT=4001

SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

JWT_SECRET=sua_chave_jwt_super_segura_min_32_caracteres
```

**⚠️ ATENÇÃO:**
- O **SUPABASE_SERVICE_ROLE_KEY** é a chave **service_role**, NÃO a chave **anon**
- Copie e cole EXATAMENTE como está acima
- NÃO adicione espaços antes ou depois

---

### 2. API Gateway

Acesse: https://railway.app/ → **vibe-payapi-gateway-production** → **Variables**

```env
API_GATEWAY_PORT=4000

AUTH_SERVICE_URL=https://vibe-payauth-service-production.up.railway.app
PAYMENT_SERVICE_URL=https://vibe-paypayment-service-production.up.railway.app
WEBHOOK_SERVICE_URL=https://vibe-paywebhook-service.railway.internal

SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
OPENPIX_WEBHOOK_SECRET=seu_secret_aqui

FRONTEND_URL=https://vibep.com.br

JWT_SECRET=sua_chave_jwt_super_segura_min_32_caracteres
```

---

### 3. Payment Service

Acesse: https://railway.app/ → **vibe-paypayment-service-production** → **Variables**

```env
PAYMENT_SERVICE_PORT=4002

SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9

FRONTEND_URL=https://vibep.com.br
```

---

### 4. Webhook Service

Acesse: https://railway.app/ → **vibe-paywebhook-service** → **Variables**

```env
WEBHOOK_SERVICE_PORT=4003

SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

OPENPIX_WEBHOOK_SECRET=seu_secret_aqui
```

---

## 🔧 Como Adicionar/Editar Variáveis no Railway

1. Clique no serviço (ex: **vibe-payauth-service-production**)
2. Vá na aba **"Variables"**
3. Para cada variável:
   - Clique em **"New Variable"**
   - **Variable Name:** (nome da variável, ex: `SUPABASE_URL`)
   - **Value:** (valor da variável)
   - Clique em **"Add"**
4. Depois de adicionar TODAS as variáveis, o Railway vai fazer **redeploy automaticamente**

---

## ⚠️ IMPORTANTE - JWT_SECRET

O `JWT_SECRET` deve ser o MESMO em todos os serviços que o usam (Auth Service e API Gateway).

Você pode gerar um secret forte:
```bash
openssl rand -hex 32
```

Ou use este exemplo (troque em produção):
```
vibe-pay-super-secret-key-2025-production-do-not-share
```

---

## 📝 Depois de Adicionar as Variáveis

1. **Aguarde o redeploy** (demora 2-5 minutos)
2. **Verifique os logs**:
   - Vá em **Deployments** → último deployment → **View logs**
   - Procure por `✓ Build successful` ou `Started on port 4001`
3. **Teste o login** novamente em `https://vibep.com.br`

---

## 🐛 Se Ainda Der Erro

Me envie os logs do **Auth Service**:
1. Railway → vibe-payauth-service-production → **Deployments**
2. Clique no último deployment
3. **View logs**
4. Copie as últimas 30-50 linhas e cole aqui

Ou tire um print da tela de logs e me envie.

---

## ✅ Checklist Final

- [ ] **Auth Service** - Todas as variáveis configuradas
- [ ] **API Gateway** - Todas as variáveis configuradas
- [ ] **Payment Service** - Todas as variáveis configuradas
- [ ] **Webhook Service** - Todas as variáveis configuradas
- [ ] **Aguardei o redeploy** (todos ficaram verdes ✅)
- [ ] **Testei o login** em https://vibep.com.br

---

## 🎯 Resumo Rápido

O erro 500 está acontecendo porque o **Auth Service não consegue conectar no Supabase**.

**Solução:**
1. Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no Auth Service
2. Aguarde redeploy (2-5 min)
3. Teste novamente

**É isso! O resto já está funcionando (CORS, frontend, etc).** 🚀
