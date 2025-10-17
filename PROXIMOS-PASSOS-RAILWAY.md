# 🚀 Próximos Passos - Railway Deploy

## ✅ O Que Foi Feito

1. ✅ Adicionado CORS explícito em **todos os serviços** (Auth, Payment, Webhook)
2. ✅ Configurado suporte a credenciais (`credentials: true`)
3. ✅ Incluído domínio `vibep.com.br` e subdomínios no CORS
4. ✅ Criados guias de correção para Railway
5. ✅ Código enviado para GitHub (commit `efd3530`)

**📦 Railway vai fazer redeploy automático** quando você corrigir as variáveis!

---

## 🔧 O Que Você Precisa Fazer Agora

### 1️⃣ CORRIGIR a chave do Supabase (URGENTE!)

**Problema:** A `SUPABASE_SERVICE_ROLE_KEY` está com **quebra de linha** no meio do valor.

#### Como Corrigir:

Siga as instruções em: **`CORRIGIR-CHAVE-SUPABASE-QUEBRADA.md`**

**Resumo:**
1. Vá no Railway → Cada serviço → Variables
2. **DELETE** a variável `SUPABASE_SERVICE_ROLE_KEY`
3. Adicione novamente com o valor correto **EM UMA SÓ LINHA**:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
```

**⚠️ Fazer isso em TODOS os 4 serviços:**
- Auth Service
- API Gateway
- Payment Service
- Webhook Service

---

### 2️⃣ Completar Variáveis do Payment Service

No Railway → **vibe-paypayment-service-production** → Variables

Adicione (se ainda não adicionou):

```
PAYMENT_SERVICE_PORT=4002
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<cole a chave correta acima>
OPENPIX_API_URL=https://api.openpix.com.br
OPENPIX_API_KEY=Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
FRONTEND_URL=https://vibep.com.br
```

---

### 3️⃣ Completar Variáveis do Webhook Service

No Railway → **vibe-paywebhook-service** → Variables

Adicione:

```
WEBHOOK_SERVICE_PORT=4003
SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<cole a chave correta acima>
OPENPIX_WEBHOOK_SECRET=vibe-pay-webhook-secret-2025
```

---

## 📋 Checklist Final

Depois de fazer as correções, verifique:

- [ ] ✅ **Auth Service** - Chave Supabase corrigida (sem quebra de linha)
- [ ] ✅ **API Gateway** - Chave Supabase corrigida (sem quebra de linha)
- [ ] ✅ **Payment Service** - Todas as 6 variáveis adicionadas + chave corrigida
- [ ] ✅ **Webhook Service** - Todas as 4 variáveis adicionadas + chave corrigida
- [ ] ✅ **Todos os serviços** - Aguardar redeploy (2-5 min cada)
- [ ] ✅ **Verificar no Railway** - Todos os 4 serviços ficaram **verdes** ✅
- [ ] ✅ **Testar login** - https://vibep.com.br

---

## 🎯 Ordem Recomendada

1. **Primeiro:** Corrigir `SUPABASE_SERVICE_ROLE_KEY` em **todos** os serviços
   - Auth Service
   - API Gateway
   - Payment Service
   - Webhook Service

2. **Segundo:** Adicionar variáveis faltantes
   - Payment Service (6 variáveis)
   - Webhook Service (4 variáveis)

3. **Terceiro:** Aguardar todos os deploys

4. **Quarto:** Testar login em https://vibep.com.br

---

## 🐛 Se Ainda Der Erro

Se após todas as correções o login ainda falhar:

1. **Verifique os logs** de cada serviço no Railway:
   - Railway → Serviço → Deployments → Último deploy → View logs
   - Procure por erros em vermelho ❌

2. **Tire prints** das variáveis de cada serviço (pode esconder os valores)

3. **Me envie:**
   - Prints das variáveis
   - Logs com erros
   - Mensagem de erro no frontend

---

## 📚 Documentação Criada

Todos os guias estão no repositório:

- ✅ `CORRIGIR-ERRO-API-GATEWAY.md` - Corrigir erro de URL inválida
- ✅ `CORRIGIR-CHAVE-SUPABASE-QUEBRADA.md` - Corrigir chave com quebra de linha
- ✅ `CHECKLIST-VARIAVEIS-RAILWAY.md` - Checklist completo de variáveis
- ✅ `VERIFICAR-VARIAVEIS-RAILWAY.md` - Guia de verificação detalhado
- ✅ `CONFIGURAR-SUBDOMINIOS-VERCEL.md` - Configurar subdomínios (próximo passo)

---

## 🚀 Após Tudo Funcionar

Quando o login estiver funcionando:

1. ✅ Configurar subdomínios (app.vibep.com.br, dashboard.vibep.com.br)
   - Veja: `CONFIGURAR-SUBDOMINIOS-VERCEL.md`

2. ✅ Configurar webhook OpenPix
   - URL: `https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix`
   - Veja: `COMO-CONFIGURAR-WEBHOOK-OPENPIX.md`

3. ✅ Fazer teste de pagamento completo

4. ✅ Adicionar seletor de produtos no formulário de Cobranças Recorrentes

---

## 💡 Dica Importante

**Sempre que copiar chaves de API:**
- Use Ctrl+C / Ctrl+V do editor de texto simples (VS Code, Notepad)
- NÃO copie de WhatsApp, Word ou outros apps que quebram linhas
- Verifique se a chave é **UMA LINHA SÓ** sem espaços ou quebras

---

Bom deploy! 🚀
