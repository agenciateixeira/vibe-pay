# 🔧 Corrigir Erro de Deploy na Vercel

## ❌ Erro Atual

```
Error: JSON5: invalid end of input at 1:1
```

## 🎯 Causa

A Vercel está tentando fazer build da **raiz do repositório** (`vibe-pay/`) ao invés do diretório correto (`frontend/dashboard/`).

---

## ✅ Solução - Configurar Root Directory

### Passo 1: Acessar Configurações do Projeto

1. Vá em: https://vercel.com/dashboard
2. Clique no projeto **dashboard** (ou o nome que você deu)
3. Clique em: **Settings** (no menu superior)

---

### Passo 2: Configurar Root Directory

1. No menu lateral esquerdo, clique em: **General**
2. Role até encontrar: **"Root Directory"**
3. Clique em: **Edit**
4. No campo que aparece, digite: `frontend/dashboard`
5. Clique em: **Save**

---

### Passo 3: Fazer Redeploy

1. Volte para o Dashboard da Vercel
2. Clique no projeto **dashboard**
3. Vá na aba: **Deployments**
4. No deploy que deu erro (o mais recente):
   - Clique nos **3 pontinhos** (...)
5. Clique em: **"Redeploy"**
6. Aguarde o build completar (2-5 min)

---

## 📋 Configuração Completa da Vercel

Depois de configurar o Root Directory, verifique se está assim:

**Settings → General:**

```
Root Directory: frontend/dashboard
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Environment Variables:**

```
NEXT_PUBLIC_API_URL=https://vibe-payapi-gateway-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://qezisnsimohayznblmwj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMjMsImV4cCI6MjA3NTkzOTIyM30.A1QqpvIbsblFq37BDiIQOtqQ1ftGFNPYGOwEEYetHIk
```

---

## ⚠️ IMPORTANTE

**NÃO** crie um arquivo `vercel.json` na raiz do projeto!

A Vercel detecta Next.js automaticamente quando o Root Directory está correto.

---

## 🧪 Testar Depois do Deploy

Depois que o deploy completar com sucesso:

1. Acesse: https://vibep.com.br (ou seu domínio Vercel)
2. Verifique se o site carrega
3. Tente fazer login

---

## 🐛 Se Ainda Der Erro

Se mesmo após configurar o Root Directory ainda der erro, me envie:

1. **Print** da tela de configurações (Settings → General)
2. **Print** ou **copie** os logs do último deployment
3. Qual é o novo erro que aparece

---

## 💡 Resumo Rápido

1. ✅ Vercel → Projeto → **Settings** → **General**
2. ✅ **Root Directory:** `frontend/dashboard`
3. ✅ **Save**
4. ✅ **Deployments** → **Redeploy** (3 pontinhos)
5. ✅ Aguardar 2-5 min
6. ✅ Testar em vibep.com.br

---

Faça isso agora e me avise se funcionou! 🚀
