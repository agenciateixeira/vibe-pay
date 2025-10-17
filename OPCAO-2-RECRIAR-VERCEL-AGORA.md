# 🚀 Opção 2 - Recriar Projeto Vercel (AGORA!)

## ❌ Erro Atual

```
The specified Root Directory "frontend/dashboard" does not exist
```

**Causa:** A Vercel não está vendo o diretório correto no repositório.

---

## ✅ Solução: Recriar Projeto Corretamente

### PASSO 1: Deletar Projeto Atual

1. Vá em: https://vercel.com/dashboard
2. Clique no projeto **dashboard** (ou o nome que você deu)
3. Clique em: **Settings** (menu superior)
4. **Role TODA a página até o FINAL**
5. Encontre: **"Delete Project"** (Danger Zone - fundo vermelho)
6. Clique em: **Delete Project**
7. Digite o nome do projeto para confirmar
8. Clique: **Delete**

✅ Projeto deletado!

---

### PASSO 2: Criar Novo Projeto

1. Vá em: https://vercel.com/dashboard
2. Clique em: **Add New...** → **Project**
3. Procure o repositório: **agenciateixeira/vibe-pay**
4. Clique em: **Import**

---

### PASSO 3: Configurar ANTES de Deploy

**⚠️ NÃO CLIQUE EM "DEPLOY" AINDA!**

Primeiro configure tudo:

#### 1. Framework Preset
- Deve detectar automaticamente: **Next.js**
- Se não detectar, selecione manualmente: **Next.js**

#### 2. Root Directory
- Clique em: **Edit** (ao lado de Root Directory)
- Digite: `frontend/dashboard`
- Clique: **Continue**

#### 3. Build & Output Settings
**Deixe tudo como está** (padrão):
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### 4. Environment Variables

Clique em: **Add** (ou **Environment Variables**)

Adicione as **3 variáveis** (uma por vez):

**Variável 1:**
```
Key: NEXT_PUBLIC_API_URL
Value: https://vibe-payapi-gateway-production.up.railway.app
```
- Marque: **Production**, **Preview**, **Development**
- Clique: **Add**

**Variável 2:**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://qezisnsimohayznblmwj.supabase.co
```
- Marque: **Production**, **Preview**, **Development**
- Clique: **Add**

**Variável 3:**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMjMsImV4cCI6MjA3NTkzOTIyM30.A1QqpvIbsblFq37BDiIQOtqQ1ftGFNPYGOwEEYetHIk
```
⚠️ **IMPORTANTE:** Cole SEM espaços! Copie direto daqui!
- Marque: **Production**, **Preview**, **Development**
- Clique: **Add**

---

### PASSO 4: Deploy

Agora que **TUDO** está configurado:

1. Clique em: **Deploy**
2. Aguarde 3-5 minutos
3. Você vai ver:
   - Building...
   - Deploying...
   - ✅ **Ready** (pronto!)

---

### PASSO 5: Adicionar Domínio

Depois que o deploy completar com sucesso:

1. Clique no projeto
2. **Settings** → **Domains**
3. Clique: **Add**
4. Digite: `vibep.com.br`
5. Clique: **Add**
6. A Vercel vai mostrar configurações DNS
7. **Já deve estar configurado** (você já fez isso antes)

---

### PASSO 6: Testar!

1. Vá em: https://vibep.com.br
2. Veja se o site carrega ✅
3. Tente fazer **login**
4. **DEVE FUNCIONAR AGORA!** 🎉

---

## 📋 Checklist Rápido

- [ ] Deletar projeto antigo da Vercel
- [ ] Criar novo projeto
- [ ] Importar repositório: **agenciateixeira/vibe-pay**
- [ ] **ANTES DE DEPLOY:**
  - [ ] Root Directory: `frontend/dashboard`
  - [ ] Adicionar 3 variáveis de ambiente
- [ ] Clicar em **Deploy**
- [ ] Aguardar completar (3-5 min)
- [ ] Adicionar domínio: `vibep.com.br`
- [ ] Testar login

---

## ⏱️ Tempo Total: 10-15 minutos

- 2 min: Deletar projeto
- 5 min: Criar e configurar novo
- 5 min: Aguardar deploy
- 2 min: Adicionar domínio e testar

---

## 💡 Por Que Isso Resolve?

Quando você criou o projeto da primeira vez, a Vercel fez cache da configuração errada. Deletar e recriar limpa TODO o cache e configura do zero.

---

**Comece AGORA!** Me avise quando:
1. Deletar o projeto antigo
2. Terminar de configurar o novo
3. O deploy completar
4. Testar o login!

🚀
