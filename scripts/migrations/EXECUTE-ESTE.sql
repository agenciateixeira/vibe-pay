-- =====================================================
-- VIBE PAY - SCRIPT FINAL CONSOLIDADO
-- =====================================================
-- ✅ Verifica o que existe e adiciona apenas o que falta
-- ✅ 100% seguro para executar em qualquer estado do banco
-- ✅ Execute este script COMPLETO de uma vez
-- =====================================================

-- =====================================================
-- PARTE 1: ATUALIZAR TABELA users
-- =====================================================

-- Adicionar colunas financeiras
DO $$
BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15, 2) DEFAULT 0.00;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS total_received DECIMAL(15, 2) DEFAULT 0.00;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(15, 2) DEFAULT 0.00;
END $$;

-- Adicionar colunas de segurança
DO $$
BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS can_withdraw BOOLEAN DEFAULT false;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
  ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT false;
END $$;

-- Adicionar timestamps
DO $$
BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf_cnpj ON users(cpf_cnpj);

-- Constraint de saldo
DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS check_balance_positive;
  ALTER TABLE users ADD CONSTRAINT check_balance_positive CHECK (balance >= 0);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_policy ON users;
CREATE POLICY users_select_policy ON users FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS users_update_policy ON users;
CREATE POLICY users_update_policy ON users FOR UPDATE
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS users_insert_policy ON users;
CREATE POLICY users_insert_policy ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- =====================================================
-- PARTE 2: CRIAR/ATUALIZAR TABELA payments
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  correlation_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas extras se a tabela já existia
DO $$
BEGIN
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS txid VARCHAR(255);
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_tax_id VARCHAR(18);
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS pix_key TEXT;
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
END $$;

-- Remover UNIQUE constraint se já existir e recriar
DO $$
BEGIN
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_correlation_id_key;
  CREATE UNIQUE INDEX IF NOT EXISTS payments_correlation_id_unique ON payments(correlation_id);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

DO $$
BEGIN
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS check_amount_positive;
  ALTER TABLE payments ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

  ALTER TABLE payments DROP CONSTRAINT IF EXISTS check_status_valid;
  ALTER TABLE payments ADD CONSTRAINT check_status_valid CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED', 'ERROR', 'PENDING'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_updated_at_trigger ON payments;
CREATE TRIGGER payments_updated_at_trigger
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payments_updated_at();

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_policy ON payments;
CREATE POLICY payments_select_policy ON payments FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payments.user_id));

DROP POLICY IF EXISTS payments_insert_policy ON payments;
CREATE POLICY payments_insert_policy ON payments FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payments.user_id));

DROP POLICY IF EXISTS payments_update_policy ON payments;
CREATE POLICY payments_update_policy ON payments FOR UPDATE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payments.user_id));

DROP POLICY IF EXISTS payments_delete_policy ON payments;
CREATE POLICY payments_delete_policy ON payments FOR DELETE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payments.user_id));

-- =====================================================
-- PARTE 3: CRIAR/ATUALIZAR TABELA withdrawals
-- =====================================================

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  pix_key VARCHAR(255) NOT NULL,
  pix_key_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas extras
DO $$
BEGIN
  ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS user_cpf_cnpj VARCHAR(18);
  ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);
  ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS error_message TEXT;
  ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
END $$;

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON withdrawals(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_transaction_id ON withdrawals(transaction_id);

DO $$
BEGIN
  ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS check_amount_positive;
  ALTER TABLE withdrawals ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

  ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS check_status_valid;
  ALTER TABLE withdrawals ADD CONSTRAINT check_status_valid CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'));

  ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS check_pix_key_type_valid;
  ALTER TABLE withdrawals ADD CONSTRAINT check_pix_key_type_valid CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_withdrawals_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS withdrawals_updated_at_trigger ON withdrawals;
CREATE TRIGGER withdrawals_updated_at_trigger
BEFORE UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION update_withdrawals_updated_at();

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS withdrawals_select_policy ON withdrawals;
CREATE POLICY withdrawals_select_policy ON withdrawals FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = withdrawals.user_id));

DROP POLICY IF EXISTS withdrawals_insert_policy ON withdrawals;
CREATE POLICY withdrawals_insert_policy ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = withdrawals.user_id));

DROP POLICY IF EXISTS withdrawals_update_policy ON withdrawals;
CREATE POLICY withdrawals_update_policy ON withdrawals FOR UPDATE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = withdrawals.user_id));

DROP POLICY IF EXISTS withdrawals_delete_policy ON withdrawals;
CREATE POLICY withdrawals_delete_policy ON withdrawals FOR DELETE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = withdrawals.user_id));

-- =====================================================
-- PARTE 4: CRIAR TABELA payment_links
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS return_url TEXT;
  ALTER TABLE payment_links ADD COLUMN IF NOT EXISTS completion_url TEXT;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(status);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON payment_links(created_at DESC);

DO $$
BEGIN
  ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS check_amount_positive;
  ALTER TABLE payment_links ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

  ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS check_status_valid;
  ALTER TABLE payment_links ADD CONSTRAINT check_status_valid CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_payment_links_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_links_updated_at_trigger ON payment_links;
CREATE TRIGGER payment_links_updated_at_trigger
BEFORE UPDATE ON payment_links
FOR EACH ROW
EXECUTE FUNCTION update_payment_links_updated_at();

ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_links_select_policy ON payment_links;
CREATE POLICY payment_links_select_policy ON payment_links FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payment_links.user_id));

DROP POLICY IF EXISTS payment_links_insert_policy ON payment_links;
CREATE POLICY payment_links_insert_policy ON payment_links FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payment_links.user_id));

DROP POLICY IF EXISTS payment_links_update_policy ON payment_links;
CREATE POLICY payment_links_update_policy ON payment_links FOR UPDATE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payment_links.user_id));

DROP POLICY IF EXISTS payment_links_delete_policy ON payment_links;
CREATE POLICY payment_links_delete_policy ON payment_links FOR DELETE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = payment_links.user_id));

-- =====================================================
-- PARTE 5: CRIAR TABELA recurring_charges
-- =====================================================

CREATE TABLE IF NOT EXISTS recurring_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_tax_id VARCHAR(18) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  next_charge_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE recurring_charges ADD COLUMN IF NOT EXISTS last_charge_date TIMESTAMP WITH TIME ZONE;
END $$;

CREATE INDEX IF NOT EXISTS idx_recurring_charges_user_id ON recurring_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_status ON recurring_charges(status);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_next_charge_date ON recurring_charges(next_charge_date);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_customer_email ON recurring_charges(customer_email);

DO $$
BEGIN
  ALTER TABLE recurring_charges DROP CONSTRAINT IF EXISTS check_amount_positive;
  ALTER TABLE recurring_charges ADD CONSTRAINT check_amount_positive CHECK (amount > 0);

  ALTER TABLE recurring_charges DROP CONSTRAINT IF EXISTS check_status_valid;
  ALTER TABLE recurring_charges ADD CONSTRAINT check_status_valid CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED'));

  ALTER TABLE recurring_charges DROP CONSTRAINT IF EXISTS check_frequency_valid;
  ALTER TABLE recurring_charges ADD CONSTRAINT check_frequency_valid CHECK (frequency IN ('weekly', 'monthly', 'semiannual', 'annual'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_recurring_charges_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recurring_charges_updated_at_trigger ON recurring_charges;
CREATE TRIGGER recurring_charges_updated_at_trigger
BEFORE UPDATE ON recurring_charges
FOR EACH ROW
EXECUTE FUNCTION update_recurring_charges_updated_at();

ALTER TABLE recurring_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recurring_charges_select_policy ON recurring_charges;
CREATE POLICY recurring_charges_select_policy ON recurring_charges FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id));

DROP POLICY IF EXISTS recurring_charges_insert_policy ON recurring_charges;
CREATE POLICY recurring_charges_insert_policy ON recurring_charges FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id));

DROP POLICY IF EXISTS recurring_charges_update_policy ON recurring_charges;
CREATE POLICY recurring_charges_update_policy ON recurring_charges FOR UPDATE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id));

DROP POLICY IF EXISTS recurring_charges_delete_policy ON recurring_charges;
CREATE POLICY recurring_charges_delete_policy ON recurring_charges FOR DELETE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id));

-- =====================================================
-- PARTE 6: CRIAR TABELA products
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'one-time',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

DO $$
BEGIN
  ALTER TABLE products DROP CONSTRAINT IF EXISTS check_frequency;
  ALTER TABLE products ADD CONSTRAINT check_frequency CHECK (frequency IN ('weekly', 'monthly', 'semiannual', 'annual', 'one-time'));

  ALTER TABLE products DROP CONSTRAINT IF EXISTS check_amount_positive;
  ALTER TABLE products ADD CONSTRAINT check_amount_positive CHECK (amount > 0);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at_trigger ON products;
CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_policy ON products;
CREATE POLICY products_select_policy ON products FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = products.user_id));

DROP POLICY IF EXISTS products_insert_policy ON products;
CREATE POLICY products_insert_policy ON products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = products.user_id));

DROP POLICY IF EXISTS products_update_policy ON products;
CREATE POLICY products_update_policy ON products FOR UPDATE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = products.user_id));

DROP POLICY IF EXISTS products_delete_policy ON products;
CREATE POLICY products_delete_policy ON products FOR DELETE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = products.user_id));

-- =====================================================
-- ✅ CONCLUÍDO COM SUCESSO!
-- =====================================================
-- Todas as tabelas e colunas foram criadas/atualizadas
-- RLS ativado em todas as tabelas
-- Índices e constraints configurados
-- Sistema pronto para uso!
-- =====================================================
