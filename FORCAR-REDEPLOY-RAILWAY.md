# 🔄 Forçar Redeploy Manual no Railway

## 🚨 Problema

O Railway não fez redeploy automático após o push do código novo com CORS.

Você precisa **forçar um redeploy manual** em TODOS os 4 serviços.

---

## ✅ ANTES DE FORÇAR REDEPLOY

### ⚠️ PRIMEIRO: Corrigir a chave do Supabase!

A `SUPABASE_SERVICE_ROLE_KEY` está **quebrada** (com quebra de linha no meio).

Isso está causando o erro: **"Invalid API key"**

**Siga o guia:** `CORRIGIR-CHAVE-SUPABASE-QUEBRADA.md`

**Resumo rápido:**

Para **CADA UM dos 4 serviços** (Auth, API Gateway, Payment, Webhook):

1. Railway → Serviço → **Variables**
2. Encontre: `SUPABASE_SERVICE_ROLE_KEY`
3. **DELETE** essa variável
4. Clique em **New Variable**
5. Nome: `SUPABASE_SERVICE_ROLE_KEY`
6. Valor (cole TUDO em UMA linha):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
```
7. Clique em **Add**

**Fazer em:**
- ✅ Auth Service
- ✅ API Gateway
- ✅ Payment Service
- ✅ Webhook Service

---

## 🔄 DEPOIS: Forçar Redeploy Manual

Após corrigir a chave em todos os serviços:

### 1. Auth Service

1. Railway → **vibe-payauth-service-production**
2. Vá na aba **Deployments**
3. Encontre o **último deployment** (o mais recente)
4. Clique nos **3 pontinhos** (...)
5. Clique em **"Redeploy"**
6. Aguarde ficar verde ✅

### 2. API Gateway

1. Railway → **vibe-payapi-gateway-production**
2. Vá na aba **Deployments**
3. Clique nos **3 pontinhos** (...)
4. Clique em **"Redeploy"**
5. Aguarde ficar verde ✅

### 3. Payment Service

1. Railway → **vibe-paypayment-service-production**
2. Vá na aba **Deployments**
3. Clique nos **3 pontinhos** (...)
4. Clique em **"Redeploy"**
5. Aguarde ficar verde ✅

### 4. Webhook Service

1. Railway → **vibe-paywebhook-service**
2. Vá na aba **Deployments**
3. Clique nos **3 pontinhos** (...)
4. Clique em **"Redeploy"**
5. Aguarde ficar verde ✅

---

## 📋 Checklist Completo

- [ ] ✅ **Auth Service** - Corrigir `SUPABASE_SERVICE_ROLE_KEY` (sem quebra de linha)
- [ ] ✅ **Auth Service** - Forçar redeploy manual
- [ ] ✅ **API Gateway** - Corrigir `SUPABASE_SERVICE_ROLE_KEY` (sem quebra de linha)
- [ ] ✅ **API Gateway** - Forçar redeploy manual
- [ ] ✅ **Payment Service** - Corrigir `SUPABASE_SERVICE_ROLE_KEY` (sem quebra de linha)
- [ ] ✅ **Payment Service** - Adicionar variáveis faltantes
- [ ] ✅ **Payment Service** - Forçar redeploy manual
- [ ] ✅ **Webhook Service** - Corrigir `SUPABASE_SERVICE_ROLE_KEY` (sem quebra de linha)
- [ ] ✅ **Webhook Service** - Adicionar variáveis faltantes
- [ ] ✅ **Webhook Service** - Forçar redeploy manual
- [ ] ✅ **Aguardar** - Todos os 4 serviços ficarem verdes (2-5 min cada)
- [ ] ✅ **Testar** - Login em https://vibep.com.br

---

## ⏱️ Tempo Estimado

- Corrigir variável em 4 serviços: 5-10 min
- Redeploy de 4 serviços: 8-20 min (2-5 min cada)
- **Total: 15-30 minutos**

---

## 🎯 Por Que Isso Resolve?

1. **Corrigir SUPABASE_SERVICE_ROLE_KEY**: Remove o erro "Invalid API key"
2. **Redeploy manual**: Aplica o código novo com CORS configurado
3. **Resultado**: CORS vai funcionar e autenticação também

---

## 🐛 Se Ainda Der Erro Depois

1. **Verifique os logs** de cada serviço:
   - Railway → Serviço → Deployments → Último deploy → **View logs**
   - Procure por erros em vermelho ❌

2. **Verifique se as variáveis estão corretas:**
   - Railway → Serviço → **Variables**
   - Confira se `SUPABASE_SERVICE_ROLE_KEY` está em **UMA linha só**

3. **Me envie:**
   - Print das variáveis (pode esconder valores sensíveis)
   - Logs com erros
   - Erro que aparece no frontend

---

## 💡 Alternativa: Deploy from GitHub (para próxima vez)

Para o Railway fazer redeploy automático quando você fizer push:

1. Railway → Serviço → **Settings**
2. Procure por **"Source"** ou **"GitHub"**
3. Conecte o repositório: `agenciateixeira/vibe-pay`
4. Configure o **Root Directory** para cada serviço:
   - Auth: `services/auth-service`
   - Gateway: `services/api-gateway`
   - Payment: `services/payment-service`
   - Webhook: `services/webhook-service`

Mas **POR AGORA**, faça redeploy manual mesmo!

---

Bora corrigir isso! 🚀
