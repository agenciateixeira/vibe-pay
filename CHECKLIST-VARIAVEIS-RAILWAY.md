# Checklist de Variáveis - Railway

## 📋 Como Verificar

Para cada serviço, acesse: https://railway.app/ → Clique no serviço → **Variables**

Marque ✅ as variáveis que você **VÊ NA LISTA** (não as variáveis RAILWAY_*):

---

## 1️⃣ Auth Service (vibe-payauth-service-production)

### Variáveis OBRIGATÓRIAS:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `JWT_SECRET`
- [ ] `AUTH_SERVICE_PORT`

**Se todas estiverem marcadas ✅, vá para o próximo serviço.**
**Se alguma faltar ❌, adicione agora!**

---

## 2️⃣ API Gateway (vibe-payapi-gateway-production)

### Variáveis OBRIGATÓRIAS:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `JWT_SECRET`
- [ ] `API_GATEWAY_PORT`
- [ ] `AUTH_SERVICE_URL`
- [ ] `PAYMENT_SERVICE_URL`
- [ ] `WEBHOOK_SERVICE_URL`
- [ ] `OPENPIX_API_URL`
- [ ] `OPENPIX_API_KEY`
- [ ] `OPENPIX_WEBHOOK_SECRET`
- [ ] `FRONTEND_URL`

---

## 3️⃣ Payment Service (vibe-paypayment-service-production)

### Variáveis OBRIGATÓRIAS:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `PAYMENT_SERVICE_PORT`
- [ ] `OPENPIX_API_URL`
- [ ] `OPENPIX_API_KEY`
- [ ] `FRONTEND_URL`

---

## 4️⃣ Webhook Service (vibe-paywebhook-service)

### Variáveis OBRIGATÓRIAS:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `WEBHOOK_SERVICE_PORT`
- [ ] `OPENPIX_WEBHOOK_SECRET`

---

## 🎯 Valores Corretos

Para conferir se os valores estão corretos:

### SUPABASE_URL (todos os serviços)
```
https://qezisnsimohayznblmwj.supabase.co
```

### SUPABASE_SERVICE_ROLE_KEY (todos os serviços)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlemlzbnNpbW9oYXl6bmJsbXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM2MzIyMywiZXhwIjoyMDc1OTM5MjIzfQ.sjpPkAvXzAcE6wGvyKR9oe7qqsFmyVWQ7Mv43iKYxYU
```

### JWT_SECRET (Auth Service e API Gateway)
```
vibe-pay-super-secret-key-2025-production-do-not-share
```

### AUTH_SERVICE_URL (apenas API Gateway)
```
https://vibe-payauth-service-production.up.railway.app
```

### PAYMENT_SERVICE_URL (apenas API Gateway)
```
https://vibe-paypayment-service-production.up.railway.app
```

### WEBHOOK_SERVICE_URL (apenas API Gateway)
```
https://vibe-paywebhook-service.railway.internal
```

### OPENPIX_API_URL (API Gateway e Payment Service)
```
https://api.openpix.com.br
```

### OPENPIX_API_KEY (API Gateway e Payment Service)
```
Q2xpZW50X0lkX2VlNmNlMGNkLTliMmEtNDJhMS1iODE2LTliZTFjZDA2MmVkNTpDbGllbnRfU2VjcmV0X2NkaFh6TUZHWVF4N05WNHp5Q0lmL1ltcVBvSXd1NGlPaEh0bGdLVUc0MkE9
```

### OPENPIX_WEBHOOK_SECRET (API Gateway e Webhook Service)
```
seu_secret_aqui
```
(Pode gerar um com: `openssl rand -hex 32`)

### FRONTEND_URL (API Gateway e Payment Service)
```
https://vibep.com.br
```

### Portas
```
AUTH_SERVICE_PORT=4001
API_GATEWAY_PORT=4000
PAYMENT_SERVICE_PORT=4002
WEBHOOK_SERVICE_PORT=4003
```

---

## 📸 Tire Prints e Me Envie

Para cada serviço, tire um print da tela de **Variables** mostrando:
1. Nome das variáveis (pode esconder os valores se quiser)
2. Quantas variáveis existem no total

Ou me diga:

**Auth Service:**
- Quantas variáveis você vê (além das RAILWAY_*)?
- Quais são os nomes delas?

**API Gateway:**
- Quantas variáveis você vê (além das RAILWAY_*)?
- Quais são os nomes delas?

**Payment Service:**
- Quantas variáveis você vê (além das RAILWAY_*)?
- Quais são os nomes delas?

**Webhook Service:**
- Quantas variáveis você vê (além das RAILWAY_*)?
- Quais são os nomes delas?

---

## ⚡ Resposta Rápida

Me diga assim:

```
Auth Service:
- SUPABASE_URL ✅
- SUPABASE_SERVICE_ROLE_KEY ✅
- JWT_SECRET ❌ (faltando)
- AUTH_SERVICE_PORT ✅

API Gateway:
- ...
```

Ou tire prints e me envie! 📸
