# 🔧 CORREÇÃO URGENTE - API Gateway

## ❌ Erro Identificado

```
TypeError: Invalid URL
code: 'ERR_INVALID_URL',
input: 'vibe-pay-super-secret-key-2025-production-do-not-share'
```

## 🎯 Causa do Problema

Uma das variáveis de URL do API Gateway foi **acidentalmente preenchida com o valor do JWT_SECRET** ao invés da URL correta.

## ✅ Como Corrigir

### Passo 1: Acesse o API Gateway no Railway

1. Vá em: https://railway.app/
2. Clique em: **vibe-payapi-gateway-production**
3. Vá na aba: **Variables**

### Passo 2: Verifique ESTAS 3 Variáveis

Procure por estas variáveis e **VERIFIQUE SE OS VALORES ESTÃO CORRETOS**:

#### ⚠️ AUTH_SERVICE_URL
**Valor CORRETO:**
```
https://vibe-payauth-service-production.up.railway.app
```

**❌ NÃO PODE SER:** `vibe-pay-super-secret-key-2025-production-do-not-share`

---

#### ⚠️ PAYMENT_SERVICE_URL
**Valor CORRETO:**
```
https://vibe-paypayment-service-production.up.railway.app
```

**❌ NÃO PODE SER:** `vibe-pay-super-secret-key-2025-production-do-not-share`

---

#### ⚠️ WEBHOOK_SERVICE_URL
**Valor CORRETO:**
```
https://vibe-paywebhook-service.railway.internal
```

**❌ NÃO PODE SER:** `vibe-pay-super-secret-key-2025-production-do-not-share`

---

### Passo 3: Corrija a Variável Errada

1. Encontre qual dessas 3 variáveis está com o valor **"vibe-pay-super-secret-key-2025-production-do-not-share"**
2. Clique nela para editar
3. Substitua pelo valor **CORRETO** (URL completa conforme acima)
4. Salve

### Passo 4: Confirme JWT_SECRET

Certifique-se que a variável **JWT_SECRET** também está correta:

```
vibe-pay-super-secret-key-2025-production-do-not-share
```

(Este valor está CORRETO para JWT_SECRET, mas estava ERRADO em uma variável de URL)

---

## 📋 Checklist Completo - API Gateway

Depois de corrigir, confirme que TODAS as variáveis estão assim:

```
✅ API_GATEWAY_PORT=4000

✅ SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co

✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU

✅ JWT_SECRET=vibe-pay-super-secret-key-2025-production-do-not-share

✅ AUTH_SERVICE_URL=https://vibe-payauth-service-production.up.railway.app

✅ PAYMENT_SERVICE_URL=https://vibe-paypayment-service-production.up.railway.app

✅ WEBHOOK_SERVICE_URL=https://vibe-paywebhook-service.railway.internal

✅ OPENPIX_API_URL=https://api.openpix.com.br

✅ OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9

✅ OPENPIX_WEBHOOK_SECRET=vibe-pay-webhook-secret-2025

✅ FRONTEND_URL=https://vibep.com.br
```

---

## 🚀 Próximos Passos

1. ✅ Corrigir a variável com valor errado
2. ✅ Aguardar redeploy automático (2-5 min)
3. ✅ Verificar se o API Gateway ficou verde ✅
4. ✅ Continuar configurando Payment Service e Webhook Service

---

## 💡 Dica

**Como identificar qual variável está errada:**

No Railway, procure por qualquer variável de URL que tenha o valor:
```
vibe-pay-super-secret-key-2025-production-do-not-share
```

Essa variável NÃO é JWT_SECRET - é uma das 3 URLs (AUTH, PAYMENT ou WEBHOOK).

Substitua pelo valor correto da URL!
