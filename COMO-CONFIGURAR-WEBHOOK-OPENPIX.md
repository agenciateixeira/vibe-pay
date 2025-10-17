# Como Configurar o Webhook no OpenPix - Passo a Passo Detalhado

## ⚠️ IMPORTANTE: Faça isso APENAS após o backend estar rodando no Railway!

O webhook só funciona se o backend estiver acessível pela internet. Localhost não funciona!

---

## Passo 1: Verificar se o Backend está no ar

Antes de configurar o webhook, teste se o endpoint está respondendo:

### Teste 1: Verificar o GET (validação)
Abra o navegador e acesse:
```
https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook endpoint is ready",
  "service": "Vibe Pay OpenPix Webhook"
}
```

Se você receber essa resposta, o endpoint está OK! ✅

### Teste 2: Verificar o Gateway
```
https://vibe-payapi-gateway-production.up.railway.app/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "service": "vibe-pay-api-gateway",
  "timestamp": "...",
  "uptime": 123
}
```

Se ambos funcionarem, você pode prosseguir! ✅

---

## Passo 2: Acessar o Dashboard do OpenPix

1. Acesse: https://app.openpix.com/
2. Faça login com sua conta
3. No menu lateral esquerdo, procure por **"Webhooks"** ou **"Integrações"**

---

## Passo 3: Criar o Webhook

### 3.1 Clique em "Novo Webhook" ou "+ Adicionar Webhook"

### 3.2 Preencha os campos:

**Nome do Webhook:**
```
Vibe Pay - Produção
```

**URL do Webhook:**
```
https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
```

⚠️ **ATENÇÃO**:
- NÃO adicione `/` no final
- NÃO adicione `?authorization=` (o OpenPix adiciona isso automaticamente)
- Use EXATAMENTE essa URL (substitua pela sua URL do Railway)

**Eventos para selecionar:**
- ✅ `OPENPIX:CHARGE_COMPLETED` - Quando o pagamento é confirmado
- ✅ `OPENPIX:TRANSACTION_RECEIVED` - Quando a transação PIX é recebida

**Outros eventos (opcional, mas NÃO necessário):**
- ⬜ `OPENPIX:CHARGE_CREATED` - Quando um charge é criado (não precisa)
- ⬜ `OPENPIX:CHARGE_EXPIRED` - Quando expira (não precisa por enquanto)

**Método HTTP:**
```
POST
```

**Headers personalizados (deixe em branco):**
Não precisa adicionar nada aqui.

**Authorization (se tiver):**
Se houver um campo "Authorization" ou "Secret", você pode deixar em branco por enquanto. Vamos adicionar isso depois se necessário.

### 3.3 Salvar o Webhook

Clique em **"Salvar"** ou **"Criar Webhook"**

---

## Passo 4: O OpenPix vai Testar o Webhook

Assim que você clicar em salvar, o OpenPix vai:

1. Fazer uma requisição GET para verificar se o endpoint existe
2. Fazer uma requisição POST de teste
3. Esperar receber uma resposta **200 OK**

### O que deve acontecer:

✅ **Sucesso**: Você verá uma mensagem "Webhook criado com sucesso" ou "Webhook validado"

❌ **Erro**: Se der erro, veja a seção de Troubleshooting abaixo

---

## Passo 5: Verificar se o Webhook foi Criado

Após criar, você deve ver o webhook na lista:

```
Nome: Vibe Pay - Produção
URL: https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
Status: ✅ Ativo
Eventos: CHARGE_COMPLETED, TRANSACTION_RECEIVED
```

---

## Passo 6: Testar o Webhook

### Opção 1: Usar o botão "Testar" no OpenPix

Se o OpenPix tiver um botão "Testar webhook", clique nele. Ele enviará um evento de teste.

### Opção 2: Fazer um pagamento real de teste

1. Vá no seu dashboard Vibe Pay
2. Crie um Payment Link
3. Gere um PIX
4. Pague usando o app do seu banco (ou peça para alguém pagar)
5. Aguarde 10-30 segundos
6. Verifique se o saldo foi atualizado no dashboard

---

## Troubleshooting - Erros Comuns

### ❌ Erro: "Endpoint retornou 500"

**Causa:** O backend não está funcionando corretamente.

**Solução:**
1. Verifique os logs do API Gateway no Railway:
   ```
   Railway Dashboard → API Gateway → Logs
   ```

2. Verifique se o Webhook Service está rodando:
   ```
   Railway Dashboard → Webhook Service → Logs
   ```

3. Verifique se a variável `WEBHOOK_SERVICE_URL` está configurada no API Gateway

### ❌ Erro: "Não foi possível conectar ao endpoint"

**Causa:** A URL está errada ou o backend não está no ar.

**Solução:**
1. Verifique se a URL está correta (sem `/` no final)
2. Teste a URL no navegador (deve retornar 200 OK)
3. Verifique se o API Gateway está rodando no Railway

### ❌ Erro: "Endpoint não responde"

**Causa:** O serviço pode estar em sleep mode (Railway).

**Solução:**
1. Acesse a URL manualmente no navegador para "acordar" o serviço
2. Aguarde 10-20 segundos
3. Tente criar o webhook novamente

### ❌ Erro: "Timeout"

**Causa:** O backend está demorando muito para responder.

**Solução:**
1. Verifique os logs do Webhook Service
2. Pode haver erro de conexão com o Supabase
3. Verifique se as variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão corretas

---

## Verificar se o Webhook está Funcionando

### 1. Verificar Logs do OpenPix

No dashboard do OpenPix, você pode ver os logs dos webhooks enviados:

```
OpenPix Dashboard → Webhooks → Vibe Pay - Produção → Logs
```

Você deve ver:
- ✅ Status 200
- ✅ Resposta: `{"success": true, "message": "Webhook received successfully"}`

### 2. Verificar Logs no Backend

Acesse o Railway e veja os logs:

**API Gateway:**
```
🌐 Gateway: Webhook OpenPix recebido
Headers: {...}
Body: {...}
🌐 Gateway: Resposta do webhook service: {...}
```

**Webhook Service:**
```
🔔 Webhook OpenPix recebido:
Event: OPENPIX:CHARGE_COMPLETED
✅ Processando pagamento confirmado...
✅ Payment encontrado: xxx
✅ Saldo atualizado com sucesso!
✅ Webhook processado com sucesso!
```

### 3. Verificar no Dashboard Vibe Pay

Após fazer um pagamento de teste:

1. **Saldo** deve ser atualizado
2. **Transações** deve mostrar o pagamento
3. **Payment Link** deve aparecer como "Completed"

---

## Configurações Avançadas (Opcional)

### Adicionar Webhook Secret

Se quiser mais segurança, você pode adicionar um secret:

1. Gere um secret:
   ```bash
   openssl rand -hex 32
   ```

2. Configure no Railway (Webhook Service):
   ```env
   OPENPIX_WEBHOOK_SECRET=seu_secret_gerado_aqui
   ```

3. Configure no OpenPix:
   - No campo "Authorization" ou "Secret", cole o mesmo secret

4. O sistema vai validar a assinatura do webhook

---

## Resumo - Checklist

Antes de configurar o webhook, verifique:

- ✅ Backend está rodando no Railway
- ✅ API Gateway está respondendo em `/health`
- ✅ Endpoint `/webhook/openpix` retorna 200 no GET
- ✅ Variáveis de ambiente estão configuradas:
  - `WEBHOOK_SERVICE_URL` no API Gateway
  - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` em todos os serviços
  - `OPENPIX_API_KEY` no Payment Service

Depois de configurar:

- ✅ Webhook criado com sucesso no OpenPix
- ✅ Status "Ativo" no dashboard
- ✅ Teste de pagamento funciona
- ✅ Saldo é atualizado automaticamente

---

## URLs Importantes

**Produção:**
- Gateway: `https://vibe-payapi-gateway-production.up.railway.app`
- Webhook: `https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix`
- Health: `https://vibe-payapi-gateway-production.up.railway.app/health`

**OpenPix:**
- Dashboard: https://app.openpix.com/
- Documentação: https://developers.openpix.com/docs/webhook/

---

## O que Fazer se Ainda Não Funcionar

1. **Capture os logs do erro:**
   - Screenshot do erro no OpenPix
   - Logs do Railway (API Gateway e Webhook Service)

2. **Verifique a resposta do endpoint:**
   ```bash
   curl -X GET https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix
   ```

3. **Teste um POST manual:**
   ```bash
   curl -X POST https://vibe-payapi-gateway-production.up.railway.app/webhook/openpix \
     -H "Content-Type: application/json" \
     -d '{"event":"OPENPIX:CHARGE_COMPLETED","charge":{"correlationID":"test123"}}'
   ```

   Deve retornar:
   ```json
   {"success": true, "message": "Webhook received successfully"}
   ```

4. **Se tudo isso funcionar mas o OpenPix ainda dá erro:**
   - Pode ser problema de firewall do OpenPix
   - Entre em contato com o suporte do OpenPix

---

## Dúvidas Comuns

**Q: Preciso configurar algo no Supabase?**
R: Não, o Supabase não precisa de configuração adicional.

**Q: Posso testar com localhost?**
R: Não! O OpenPix precisa acessar a URL pela internet. Por isso você precisa fazer deploy antes.

**Q: Quanto tempo demora para o pagamento ser confirmado?**
R: Normalmente 5-30 segundos após o pagamento via PIX.

**Q: O webhook funciona em sandbox?**
R: Sim! Se você estiver usando as credenciais de sandbox do OpenPix.

**Q: Posso ter múltiplos webhooks?**
R: Sim, você pode criar um para desenvolvimento e outro para produção.

---

Agora você está pronto para configurar o webhook! 🚀
