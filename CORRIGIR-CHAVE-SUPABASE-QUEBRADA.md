# 🚨 CORREÇÃO URGENTE - Chave Supabase com Quebra de Linha

## ❌ Erro Identificado

```
Headers.append: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...sjpPkAvXzAcE6wGvyKR9
oe7qqsFmyVWQ7Mv43iKYxYU" is an invalid header value
```

**Problema:** A `SUPABASE_SERVICE_ROLE_KEY` está com uma **quebra de linha** no meio do valor!

Veja que depois de `sjpPkAvXzAcE6wGvyKR9` tem uma quebra, e continua na linha de baixo com `oe7qqsFmyVWQ7Mv43iKYxYU`.

---

## ✅ Solução

A chave **DEVE SER UMA LINHA ÚNICA**, sem espaços, quebras ou caracteres extras.

### Valor CORRETO (copie exatamente como está):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
```

---

## 🔧 Como Corrigir no Railway

### Passo 1: Auth Service

1. Vá em: https://railway.app/
2. Clique em: **vibe-payauth-service-production**
3. Vá na aba: **Variables**
4. Encontre: `SUPABASE_SERVICE_ROLE_KEY`
5. **DELETE essa variável** (remova completamente)
6. Clique em: **New Variable**
7. **Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`
8. **Value:** Cole o valor correto (linha única acima) - **NÃO PRESSIONE ENTER ao colar!**
9. Clique em **Add**

⚠️ **IMPORTANTE:**
- Cole o valor INTEIRO em UMA SÓ LINHA
- NÃO aperte Enter no meio
- NÃO deixe espaços antes ou depois
- NÃO quebre em múltiplas linhas

---

### Passo 2: API Gateway

Repita o mesmo processo para o **API Gateway**:

1. Clique em: **vibe-payapi-gateway-production**
2. Vá na aba: **Variables**
3. Encontre: `SUPABASE_SERVICE_ROLE_KEY`
4. **DELETE** e recrie conforme acima

---

### Passo 3: Payment Service

1. Clique em: **vibe-paypayment-service-production**
2. Vá na aba: **Variables**
3. Se já tem `SUPABASE_SERVICE_ROLE_KEY`, DELETE e recrie
4. Se não tem, adicione nova variável

---

### Passo 4: Webhook Service

1. Clique em: **vibe-paywebhook-service**
2. Vá na aba: **Variables**
3. Se já tem `SUPABASE_SERVICE_ROLE_KEY`, DELETE e recrie
4. Se não tem, adicione nova variável

---

## 🎯 Valor Correto - Copie Daqui

**SUPABASE_SERVICE_ROLE_KEY** (TODA EM UMA LINHA):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
```

**Como verificar se está correto:**
- A chave tem exatamente **3 partes** separadas por `.` (ponto)
- Começa com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
- Termina com: `.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU`
- **NÃO TEM quebras de linha, espaços ou caracteres especiais**

---

## 📋 Depois de Corrigir

1. ✅ Aguarde o **redeploy automático** de todos os serviços (2-5 min cada)
2. ✅ Verifique se todos ficaram **verdes** no Railway
3. ✅ Teste o login em: https://vibep.com.br

---

## 💡 Por que isso aconteceu?

Ao copiar a chave do Supabase ou do documento, pode ter sido colada em um editor que quebrou a linha automaticamente (como WhatsApp, Word, etc).

**Sempre copie valores de API keys direto da fonte (Supabase Dashboard) ou de um editor de texto simples (Notepad, VS Code).**

---

## ⚠️ Se o Erro Persistir

Se após corrigir ainda der erro de CORS, verifique:

1. Todos os 4 serviços fizeram redeploy?
2. Todos estão verdes (rodando)?
3. O frontend está usando a URL correta do API Gateway?

Me envie os logs do **Auth Service** no Railway:
- Railway → vibe-payauth-service-production → Deployments → Último deploy → View logs
