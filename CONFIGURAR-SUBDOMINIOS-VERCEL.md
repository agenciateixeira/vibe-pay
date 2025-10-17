# Como Configurar Subdomínios na Vercel - vibep.com.br

## Objetivo

Configurar os subdomínios do domínio `vibep.com.br` para apontar para o projeto dashboard na Vercel:

- `vibep.com.br` → Dashboard (principal)
- `www.vibep.com.br` → Dashboard (alias)
- `app.vibep.com.br` → Dashboard (alias)
- `dashboard.vibep.com.br` → Dashboard (alias)

---

## Passo 1: Acessar Configurações do Projeto na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **dashboard**
3. Vá em **Settings** → **Domains**

---

## Passo 2: Adicionar o Domínio Principal

### 2.1 Adicionar vibep.com.br

1. No campo **"Add Domain"**, digite: `vibep.com.br`
2. Clique em **"Add"**
3. A Vercel vai mostrar as configurações DNS necessárias

### 2.2 Configurar DNS

A Vercel vai te mostrar algo assim:

```
Type    Name    Value
────────────────────────────────────────────
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

**No seu provedor de DNS (onde você registrou vibep.com.br):**

1. Vá nas configurações de DNS
2. Adicione os registros exatamente como a Vercel mostrar:

**Registro A (para vibep.com.br):**
- **Type:** A
- **Name:** @ (ou deixe vazio, dependendo do provedor)
- **Value:** 76.76.21.21 (pode ser um IP diferente, use o que a Vercel mostrar)
- **TTL:** 3600 (ou automático)

**Registro CNAME (para www):**
- **Type:** CNAME
- **Name:** www
- **Value:** cname.vercel-dns.com
- **TTL:** 3600 (ou automático)

3. Salve as configurações
4. Aguarde a propagação (pode levar até 48h, mas geralmente é rápido - 10-30 min)

---

## Passo 3: Adicionar Subdomínios

### 3.1 Adicionar app.vibep.com.br

1. Na mesma tela de **Domains**, clique em **"Add"** novamente
2. Digite: `app.vibep.com.br`
3. Clique em **"Add"**
4. A Vercel vai mostrar um registro CNAME

**No seu provedor de DNS:**
- **Type:** CNAME
- **Name:** app
- **Value:** cname.vercel-dns.com (ou o que a Vercel mostrar)
- **TTL:** 3600

### 3.2 Adicionar dashboard.vibep.com.br

1. Clique em **"Add"** novamente
2. Digite: `dashboard.vibep.com.br`
3. Clique em **"Add"**

**No seu provedor de DNS:**
- **Type:** CNAME
- **Name:** dashboard
- **Value:** cname.vercel-dns.com
- **TTL:** 3600

---

## Passo 4: Definir Domínio Principal

Depois de adicionar todos os domínios:

1. Na lista de domínios, encontre `vibep.com.br`
2. Clique nos 3 pontinhos → **"Set as Primary"** (ou "Definir como Principal")
3. Isso fará com que todos os outros domínios redirecionem para `vibep.com.br`

**OU** se você quiser que `app.vibep.com.br` seja o principal:

1. Encontre `app.vibep.com.br`
2. Clique em **"Set as Primary"**

---

## Passo 5: Configurar Redirecionamentos (Opcional)

Se você quiser que `www`, `app` e `dashboard` sejam **aliases** (mostram o mesmo conteúdo sem redirecionar):

1. **Não** defina nenhum como principal
2. A Vercel vai servir o mesmo conteúdo em todos os domínios

Se você quiser que todos **redirecionem** para um domínio principal:

1. Defina um domínio como principal (ex: `vibep.com.br`)
2. A Vercel vai redirecionar automaticamente:
   - `www.vibep.com.br` → `vibep.com.br`
   - `app.vibep.com.br` → `vibep.com.br`
   - `dashboard.vibep.com.br` → `vibep.com.br`

---

## Exemplo Completo - Configuração DNS

Supondo que você quer:
- **Principal:** `app.vibep.com.br`
- **Aliases:** `vibep.com.br`, `www.vibep.com.br`, `dashboard.vibep.com.br`

**Registros DNS no seu provedor:**

```
Type     Name         Value                    TTL
───────────────────────────────────────────────────────
A        @            76.76.21.21              3600
CNAME    www          cname.vercel-dns.com     3600
CNAME    app          cname.vercel-dns.com     3600
CNAME    dashboard    cname.vercel-dns.com     3600
```

**Na Vercel:**
- Adicionar: `vibep.com.br`
- Adicionar: `www.vibep.com.br`
- Adicionar: `app.vibep.com.br` → **Set as Primary**
- Adicionar: `dashboard.vibep.com.br`

---

## Passo 6: Testar

Depois de configurar, teste todos os domínios:

1. `https://vibep.com.br` → Deve carregar o dashboard
2. `https://www.vibep.com.br` → Deve carregar o dashboard
3. `https://app.vibep.com.br` → Deve carregar o dashboard
4. `https://dashboard.vibep.com.br` → Deve carregar o dashboard

Se estiver tudo OK, o frontend vai funcionar em todos os domínios! ✅

---

## Troubleshooting

### Domínio não funciona

1. **Verifique DNS:** Use https://dnschecker.org/ para ver se os registros DNS propagaram
2. **Aguarde:** Pode levar até 48h para propagar completamente
3. **Limpe cache:** Use navegação anônima para testar

### Certificado SSL não funciona

1. Aguarde alguns minutos - a Vercel emite certificados automaticamente
2. Se demorar mais de 1h, remova o domínio e adicione novamente

### CORS ainda dá erro

1. Certifique-se de que o Railway fez redeploy do API Gateway
2. Verifique se todos os domínios estão no CORS (já está configurado!)
3. Limpe o cache do navegador

---

## Resumo das Configurações

### ✅ DNS Necessários (no provedor do domínio):

```
A       @           76.76.21.21 (ou IP da Vercel)
CNAME   www         cname.vercel-dns.com
CNAME   app         cname.vercel-dns.com
CNAME   dashboard   cname.vercel-dns.com
```

### ✅ Domínios na Vercel:

- `vibep.com.br`
- `www.vibep.com.br`
- `app.vibep.com.br` ← **Principal (opcional)**
- `dashboard.vibep.com.br`

### ✅ CORS no Railway (já configurado):

```javascript
origin: [
  'https://vibep.com.br',
  'https://www.vibep.com.br',
  'https://app.vibep.com.br',
  'https://dashboard.vibep.com.br',
  // ...
]
```

---

## Próximos Passos

1. ✅ Configurar DNS no provedor do domínio
2. ✅ Adicionar domínios na Vercel
3. ✅ Aguardar propagação DNS (10-30 min)
4. ✅ Testar todos os domínios
5. ✅ Configurar webhook OpenPix
6. ✅ Fazer teste de pagamento completo

Tudo pronto! 🚀
