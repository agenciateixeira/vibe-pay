-- =====================================================
-- CORRIGIR TABELA PRODUCTS - Adicionar coluna frequency
-- =====================================================
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Adicionar coluna frequency se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'frequency'
  ) THEN
    ALTER TABLE products ADD COLUMN frequency VARCHAR(20) NOT NULL DEFAULT 'one-time';

    -- Adicionar constraint
    ALTER TABLE products ADD CONSTRAINT check_frequency
      CHECK (frequency IN ('weekly', 'monthly', 'semiannual', 'annual', 'one-time'));

    RAISE NOTICE 'Coluna frequency adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna frequency já existe.';
  END IF;
END $$;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- =====================================================
-- ✅ Pronto! Agora você pode criar produtos.
-- =====================================================
