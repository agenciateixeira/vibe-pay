# Migrações do Banco de Dados - Vibe Pay

Este diretório contém todos os scripts SQL de migração para criar as tabelas do Supabase.

## 📋 Ordem de Execução

Execute os scripts **NESTA ORDEM** no SQL Editor do Supabase:

### 1. Tabela de Usuários (Base)
```
create-users-table.sql
```
**Importante:** Esta tabela DEVE ser criada primeiro pois outras tabelas dependem dela.

### 2. Tabelas de Transações (podem ser executadas em paralelo)
```
create-payments-table.sql
create-withdrawals-table.sql
create-payment-links-table.sql
create-recurring-charges-table.sql
create-products-table.sql
```

## 🔄 Fluxo Automático de Registros

### Pagamentos (Entradas)
1. Cliente paga via PIX
2. Webhook OpenPix notifica sistema
3. **Automaticamente**:
   - Atualiza `payments.status` para COMPLETED
   - Adiciona valor em `users.balance`
   - Adiciona valor em `users.total_received`

### Saques (Saídas)
1. Usuário solicita saque
2. **Automaticamente**:
   - Cria registro em `withdrawals` (status PENDING)
   - Deduz valor de `users.balance`
3. Quando processado:
   - Atualiza `withdrawals.status` para COMPLETED

### Extrato de Movimentação
A página `/dashboard/transactions` **NÃO cria uma tabela nova**.
Ela apenas:
- Busca `payments` com status COMPLETED
- Busca todos `withdrawals`
- Une as duas listas
- Ordena por data
- Calcula resumo financeiro

## 📊 Estrutura das Tabelas

### users
Perfil estendido + dados financeiros
- `balance`: Saldo disponível para saque
- `total_received`: Total recebido histórico
- `total_withdrawn`: Total sacado histórico
- `can_withdraw`: Permissão para sacar (requer docs + 2FA)

### payments
Cobranças PIX criadas
- Criado quando: Criar cobrança manual ou via link/recorrência
- Atualizado quando: Webhook OpenPix notifica pagamento
- Status: ACTIVE → COMPLETED/EXPIRED

### withdrawals
Solicitações de saque
- Criado quando: Usuário solicita saque
- Status: PENDING → COMPLETED/FAILED/CANCELLED
- Deduz do balance imediatamente (ao criar)

### payment_links
Links de pagamento compartilháveis
- Links únicos para aceitar pagamentos
- Cada pagamento via link cria um `payment`

### recurring_charges
Cobranças recorrentes/assinaturas
- Agendamento automático de cobranças
- Cada cobrança executada cria um `payment`

### products
Catálogo de produtos/serviços
- Facilita criação de cobranças
- Usado em links e recorrências

## 🔒 Segurança (RLS)

Todas as tabelas têm **Row Level Security (RLS)** ativado:
- Usuários só veem/editam seus próprios dados
- Proteção automática contra acesso não autorizado
- Políticas baseadas em `auth.uid()`

## ⚙️ Como Executar

1. Acesse Supabase Dashboard
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Cole o conteúdo de cada arquivo na ordem
5. Execute (Run)
6. Verifique no **Table Editor** se as tabelas foram criadas

## 🧪 Verificação

Após executar todas as migrações, você deve ter:
- ✅ 6 tabelas criadas
- ✅ Índices para performance
- ✅ Constraints de validação
- ✅ Triggers de updated_at
- ✅ RLS policies ativas

## 📝 Notas

- **NUNCA** execute migrations em produção sem backup
- Scripts são **idempotentes** (podem ser executados múltiplas vezes)
- Usam `IF NOT EXISTS` para evitar erros
- Todas as datas em UTC (`TIMESTAMP WITH TIME ZONE`)
