-- =====================================================
-- CORREÇÃO RÁPIDA: Adicionar colunas que estão faltando
-- =====================================================
-- Execute ANTES do update-existing-database.sql
-- =====================================================

-- Adicionar coluna transaction_id em withdrawals (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawals'
    AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE withdrawals ADD COLUMN transaction_id VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_transaction_id ON withdrawals(transaction_id);
  END IF;
END $$;

-- Adicionar coluna txid em payments (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments'
    AND column_name = 'txid'
  ) THEN
    ALTER TABLE payments ADD COLUMN txid VARCHAR(255);
  END IF;
END $$;

-- Adicionar coluna requested_at em withdrawals (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawals'
    AND column_name = 'requested_at'
  ) THEN
    ALTER TABLE withdrawals ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON withdrawals(requested_at DESC);
  END IF;
END $$;

-- Adicionar coluna processed_at em withdrawals (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawals'
    AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE withdrawals ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Adicionar coluna error_message em withdrawals (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'withdrawals'
    AND column_name = 'error_message'
  ) THEN
    ALTER TABLE withdrawals ADD COLUMN error_message TEXT;
  END IF;
END $$;

-- =====================================================
-- ✅ Colunas corrigidas! Agora execute o script principal.
-- =====================================================
