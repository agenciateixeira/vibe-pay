# 🚀 Guia de Deploy - Vibe Pay

## ✅ Pré-requisitos Concluídos
- [x] Banco de dados criado no Supabase
- [x] Todas as tabelas configuradas
- [x] Código commitado no GitHub

---

## 📋 Próximos Passos

### 1. Testar Localmente (5-10 min)

#### 1.1 Iniciar os serviços backend

```bash
# Terminal 1 - API Gateway
cd C:\Users\guilh\Documents\vibe-pay\services\api-gateway
npm install
npm run dev
```

```bash
# Terminal 2 - Auth Service
cd C:\Users\guilh\Documents\vibe-pay\services\auth-service
npm install
npm run dev
```

```bash
# Terminal 3 - Payment Service
cd C:\Users\guilh\Documents\vibe-pay\services\payment-service
npm install
npm run dev
```

```bash
# Terminal 4 - Webhook Service
cd C:\Users\guilh\Documents\vibe-pay\services\webhook-service
npm install
npm run dev
```

#### 1.2 Iniciar o frontend

```bash
# Terminal 5 - Dashboard
cd C:\Users\guilh\Documents\vibe-pay\frontend\dashboard
npm install
npm run dev
```

#### 1.3 Testar no navegador

Abra: http://localhost:3000

**Teste básico:**
1. ✅ Criar conta (Register)
2. ✅ Fazer login
3. ✅ Acessar dashboard
4. ✅ Criar um produto
5. ✅ Criar um link de pagamento
6. ✅ Ver extrato (deve estar vazio ainda)

**Se tudo funcionar localmente, prossiga para o deploy!**

---

### 2. Deploy na Vercel (10-15 min)

#### 2.1 Deploy do Dashboard

1. Acesse https://vercel.com/dashboard
2. Clique em **New Project**
3. Importe o repositório: `agenciateixeira/vibe-pay`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend/dashboard`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### 2.2 Variáveis de Ambiente na Vercel

Adicione estas variáveis em **Settings → Environment Variables:**

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# IMPORTANTE: Você vai mudar isso depois para a URL do backend em produção
# Por enquanto, use localhost para testar
```

#### 2.3 Deploy

- Clique em **Deploy**
- Aguarde ~2-3 minutos
- Sua URL será algo como: `https://vibe-pay-xxxxx.vercel.app`

---

### 3. Configurar Domínio (Opcional)

#### 3.1 Na Vercel

1. Vá em **Settings → Domains**
2. Adicione: `vibep.com.br` ou `app.vibep.com.br`
3. Copie os registros DNS fornecidos

#### 3.2 No seu provedor de domínio

Configure os registros DNS:
```
Tipo: CNAME
Nome: @ (ou app)
Valor: cname.vercel-dns.com
```

Aguarde propagação (pode levar até 24h, mas geralmente é rápido)

---

### 4. Deploy dos Serviços Backend

Você tem algumas opções:

#### Opção A: Railway.app (Recomendado - Mais Fácil)

1. Acesse https://railway.app
2. Conecte o GitHub
3. Crie 4 serviços separados:
   - API Gateway (porta 4000)
   - Auth Service (porta 4001)
   - Payment Service (porta 4002)
   - Webhook Service (porta 4003)

4. Configure as variáveis de ambiente em cada um (do arquivo .env)

5. Railway vai gerar URLs públicas para cada serviço

#### Opção B: Render.com (Grátis com limitações)

Similar ao Railway, crie 4 web services

#### Opção C: Docker + VPS (Mais Complexo)

Use o docker-compose.yml em `infrastructure/docker/`

---

### 5. Configurar URLs de Produção

Depois que o backend estiver no ar, atualize na Vercel:

```env
NEXT_PUBLIC_API_URL=https://api-gateway.vibep.com.br
# ou a URL que o Railway/Render forneceu
```

E no backend (.env.production):

```env
FRONTEND_URL=https://vibep.com.br
API_URL=https://api-gateway.vibep.com.br
```

---

### 6. Configurar Webhook do OpenPix

1. Acesse o dashboard OpenPix/Woovi
2. Vá em **Webhooks**
3. Adicione a URL: `https://api-gateway.vibep.com.br/webhook/openpix`
4. Selecione eventos:
   - ✅ `OPENPIX:CHARGE_COMPLETED`
   - ✅ `OPENPIX:CHARGE_EXPIRED`

---

## 🧪 Checklist Final

Antes de usar em produção, teste:

- [ ] Criar conta e fazer login
- [ ] Criar produto
- [ ] Criar link de pagamento
- [ ] Copiar link e abrir em anônimo
- [ ] Gerar QR Code PIX
- [ ] Fazer pagamento de teste (usar ambiente sandbox da OpenPix)
- [ ] Verificar se apareceu no extrato
- [ ] Criar cobrança recorrente
- [ ] Solicitar saque (testar validações)
- [ ] Ver se webhook está funcionando

---

## 📞 Próximos Recursos (Futuro)

- [ ] Painel administrativo para aprovar saques
- [ ] Notificações por email
- [ ] Relatórios e analytics
- [ ] API pública para integrações
- [ ] App mobile
- [ ] Suporte a boleto além de PIX

---

## 🆘 Problemas Comuns

### "API not responding"
- Verifique se todos os serviços backend estão rodando
- Confirme que as portas estão corretas (4000, 4001, 4002, 4003)

### "Unauthorized" ao fazer login
- Verifique as credenciais do Supabase no .env
- Confirme que a tabela `users` tem os dados corretos

### Webhook não funciona
- URL do webhook deve ser HTTPS em produção
- Verifique se o secret está configurado
- Veja logs no dashboard OpenPix

### Saque não funciona
- Usuário precisa ter `can_withdraw = true`
- Precisa ter `documents_verified = true`
- Precisa ter saldo disponível

---

## 📚 Documentação

- Supabase: https://supabase.com/docs
- OpenPix: https://developers.openpix.com.br
- Next.js: https://nextjs.org/docs
- Fastify: https://www.fastify.io/docs

---

## 🎉 Parabéns!

Seu sistema de pagamentos PIX está pronto! 🚀

Se tiver dúvidas ou problemas, verifique os logs nos serviços ou entre em contato com o suporte.
