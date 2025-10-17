# 🔧 Reconfigurar Projeto Vercel - Solução Definitiva

## 🎯 Problema

A Vercel continua tentando fazer build da raiz mesmo após configurar Root Directory.

## ✅ Solução: Recriar o Projeto Corretamente

### Opção 1: Editar Root Directory Novamente (TENTE PRIMEIRO)

1. Vercel → Projeto **dashboard** → **Settings**
2. **General** → Role até **Root Directory**
3. Clique em **Edit**
4. **APAGUE** tudo que está lá
5. Digite novamente: `frontend/dashboard`
6. Clique em **Save**
7. Volte para **Deployments**
8. Último deploy com erro → **3 pontinhos** (...)
9. Clique: **Redeploy**

**Aguarde 3-5 min e veja se funcionou**

Se AINDA der erro JSON5, vá para Opção 2 ↓

---

### Opção 2: Recriar o Projeto na Vercel (SE OPÇÃO 1 NÃO FUNCIONAR)

#### Passo 1: Deletar Projeto Atual

1. Vercel → Projeto **dashboard** → **Settings**
2. Role até o FINAL da página
3. **Danger Zone** → **Delete Project**
4. Digite o nome do projeto para confirmar
5. Clique: **Delete**

#### Passo 2: Criar Novo Projeto

1. Vercel Dashboard → **Add New** → **Project**
2. Selecione o repositório: **agenciateixeira/vibe-pay**
3. **⚠️ ANTES DE CLICAR EM DEPLOY:**

**Configure PRIMEIRO:**

**Framework Preset:** Next.js

**Root Directory:** Clique em **Edit** → Digite: `frontend/dashboard` → **Continue**

**Build Settings:**
- Build Command: `npm run build` (deixe como está)
- Output Directory: `.next` (deixe como está)
- Install Command: `npm install` (deixe como está)

**Environment Variables:** Clique em **Add**

Adicione as 3 variáveis:

```
Key: NEXT_PUBLIC_API_URL
Value: https://vibe-payapi-gateway-production.up.railway.app
Environments: Production, Preview, Development
```

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://qezisnsimohayznblmwj.supabase.co
Environments: Production, Preview, Development
```

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMjMsImV4cCI6MjA3NTkzOTIyM30.A1QqpvIbsblFq37BDiIQOtqQ1ftGFNPYGOwEEYetHIk
Environments: Production, Preview, Development
```

⚠️ **COPIE O ANON_KEY SEM ESPAÇOS!** Cole direto daqui, NÃO aperte Enter!

4. Depois de configurar TUDO, clique: **Deploy**
5. Aguarde 3-5 min

#### Passo 3: Adicionar Domínio

Depois que o deploy completar:

1. Projeto → **Settings** → **Domains**
2. Clique: **Add**
3. Digite: `vibep.com.br`
4. Clique: **Add**
5. A Vercel vai mostrar as configurações DNS
6. Já deve estar configurado (você já fez antes)

---

## 📋 Checklist

- [ ] **Root Directory** configurado: `frontend/dashboard`
- [ ] **Environment Variables** adicionadas (3 variáveis)
- [ ] **Deploy** completou com sucesso ✅
- [ ] **Domínio** vibep.com.br adicionado
- [ ] **Teste** - Acesse https://vibep.com.br e veja se carrega

---

## 🧪 Depois que Deploy Completar

1. Vá em: https://vibep.com.br
2. Tente fazer login
3. **DEVE FUNCIONAR!** ✅

---

## 💡 Por que Recriar Resolve?

Quando você cria o projeto na Vercel SEM configurar Root Directory primeiro, ela faz cache da estrutura errada. Recriar o projeto limpa todo o cache e configura corretamente desde o início.

---

**TENTE A OPÇÃO 1 PRIMEIRO!** Se não funcionar, vá para Opção 2.

Me avise qual opção você vai fazer e o resultado! 🚀
