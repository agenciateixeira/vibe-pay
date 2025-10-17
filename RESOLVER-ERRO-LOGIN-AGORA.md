# 🚨 RESOLVER ERRO DE LOGIN - Passo a Passo

## ❌ Erro Atual

```
Access to fetch blocked by CORS policy
Invalid API key
```

## 🎯 Causa

1. **SUPABASE_SERVICE_ROLE_KEY** está com **quebra de linha** no meio do valor
2. Railway **não fez redeploy** do código novo com CORS

## ✅ Solução (30 minutos)

### IMPORTANTE: Faça na ORDEM correta!

---

## 🔧 PARTE 1: Corrigir Chave do Supabase (10 min)

### Valor CORRETO (copie daqui):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
```

⚠️ **COPIE DIRETO DAQUI!** Não copie de outro lugar!

---

### 1.1 Auth Service

1. Vá em: https://railway.app/
2. Clique em: **vibe-payauth-service-production**
3. Aba: **Variables**
4. Encontre: **SUPABASE_SERVICE_ROLE_KEY**
5. Clique no **X** vermelho para **DELETAR**
6. Clique em: **New Variable**
7. **Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
8. **Value:** Cole o valor acima (CTRL+V) - **NÃO aperte Enter!**
9. Clique em: **Add**
10. ✅ Pronto! Vai fazer redeploy automático

---

### 1.2 API Gateway

1. Clique em: **vibe-payapi-gateway-production**
2. Aba: **Variables**
3. Encontre: **SUPABASE_SERVICE_ROLE_KEY**
4. Clique no **X** vermelho para **DELETAR**
5. Clique em: **New Variable**
6. **Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
7. **Value:** Cole o valor acima (CTRL+V) - **NÃO aperte Enter!**
8. Clique em: **Add**
9. ✅ Pronto! Vai fazer redeploy automático

---

### 1.3 Payment Service

**ANTES:** Adicione as variáveis faltantes (se ainda não adicionou):

```
PAYMENT_SERVICE_PORT=4002
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
FRONTEND_URL=https://vibep.com.br
```

**DEPOIS:**

1. Clique em: **vibe-paypayment-service-production**
2. Aba: **Variables**
3. Se já tem **SUPABASE_SERVICE_ROLE_KEY**, DELETE e recrie
4. Se não tem, adicione nova variável:
5. **Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
6. **Value:** Cole o valor acima (CTRL+V) - **NÃO aperte Enter!**
7. Clique em: **Add**
8. ✅ Pronto! Vai fazer redeploy automático

---

### 1.4 Webhook Service

**ANTES:** Adicione as variáveis faltantes (se ainda não adicionou):

```
WEBHOOK_SERVICE_PORT=4003
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
OPENPIX_WEBHOOK_SECRET=vibe-pay-webhook-secret-2025
```

**DEPOIS:**

1. Clique em: **vibe-paywebhook-service**
2. Aba: **Variables**
3. Se já tem **SUPABASE_SERVICE_ROLE_KEY**, DELETE e recrie
4. Se não tem, adicione nova variável:
5. **Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
6. **Value:** Cole o valor acima (CTRL+V) - **NÃO aperte Enter!**
7. Clique em: **Add**
8. ✅ Pronto! Vai fazer redeploy automático

---

## ⏳ PARTE 2: Aguardar Redeploy (10-20 min)

Agora **AGUARDE** todos os 4 serviços fazerem redeploy:

1. Railway vai mostrar **"Building..."** ou **"Deploying..."**
2. Aguarde até ficar **verde** ✅ em todos os 4 serviços
3. Isso pode levar **2-5 minutos por serviço** (total: 10-20 min)

**Como verificar:**
- Vá em: Railway → Dashboard
- Veja se todos os 4 serviços estão com **status verde** ✅

---

## 🧪 PARTE 3: Testar Login (2 min)

Depois que **TODOS os 4 serviços** estiverem verdes ✅:

1. Vá em: https://vibep.com.br
2. Faça login
3. **Deve funcionar!** ✅

---

## ❌ Se AINDA der erro de CORS

Significa que o Railway não pegou o código novo do GitHub.

**Solução: Forçar redeploy manual**

Para cada serviço:

1. Railway → Serviço → **Deployments**
2. Clique nos **3 pontinhos** (...) do último deploy
3. Clique em: **"Redeploy"**
4. Aguarde ficar verde ✅

Faça isso em **TODOS os 4 serviços**.

---

## 📋 Resumo do que você vai fazer

```
✅ Auth Service
   └─ Corrigir SUPABASE_SERVICE_ROLE_KEY (deletar e recriar)
   └─ Aguardar redeploy (2-5 min)

✅ API Gateway
   └─ Corrigir SUPABASE_SERVICE_ROLE_KEY (deletar e recriar)
   └─ Aguardar redeploy (2-5 min)

✅ Payment Service
   └─ Adicionar variáveis faltantes (se não tiver)
   └─ Corrigir SUPABASE_SERVICE_ROLE_KEY (deletar e recriar)
   └─ Aguardar redeploy (2-5 min)

✅ Webhook Service
   └─ Adicionar variáveis faltantes (se não tiver)
   └─ Corrigir SUPABASE_SERVICE_ROLE_KEY (deletar e recriar)
   └─ Aguardar redeploy (2-5 min)

✅ Testar login em https://vibep.com.br
```

---

## 💡 Dica

Abra **4 abas** do navegador, uma para cada serviço no Railway. Assim você faz tudo mais rápido!

---

## 🎯 Depois que funcionar

1. ✅ Configurar subdomínios (www, app, dashboard)
2. ✅ Configurar webhook OpenPix
3. ✅ Fazer teste de pagamento completo

---

**Bora resolver isso de uma vez! Qualquer erro me avisa.** 🚀
