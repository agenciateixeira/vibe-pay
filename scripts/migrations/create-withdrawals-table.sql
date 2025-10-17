-- Migration: Create withdrawals table
-- Description: Store withdrawal requests and their processing status
-- Created: 2025-10-16

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Withdrawal details
  amount DECIMAL(10, 2) NOT NULL,

  -- PIX destination
  pix_key VARCHAR(255) NOT NULL,
  pix_key_type VARCHAR(20) NOT NULL,
  -- Types: cpf, cnpj, email, phone, random
  user_cpf_cnpj VARCHAR(18) NOT NULL,

  -- Processing
  status VARCHAR(20) DEFAULT 'PENDING',
  -- Possible values: PENDING, COMPLETED, FAILED, CANCELLED

  transaction_id VARCHAR(255),
  error_message TEXT,

  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON withdrawals(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_transaction_id ON withdrawals(transaction_id);

-- Constraints
ALTER TABLE withdrawals
ADD CONSTRAINT check_amount_positive
CHECK (amount > 0);

ALTER TABLE withdrawals
ADD CONSTRAINT check_status_valid
CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'));

ALTER TABLE withdrawals
ADD CONSTRAINT check_pix_key_type_valid
CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER withdrawals_updated_at_trigger
BEFORE UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION update_withdrawals_updated_at();

-- RLS Policies
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
CREATE POLICY withdrawals_select_policy ON withdrawals
  FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = withdrawals.user_id
  ));

-- Users can insert their own withdrawals
CREATE POLICY withdrawals_insert_policy ON withdrawals
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = withdrawals.user_id
  ));

-- Users can update their own withdrawals (for cancellation)
CREATE POLICY withdrawals_update_policy ON withdrawals
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = withdrawals.user_id
  ));

-- Users can delete their own withdrawals
CREATE POLICY withdrawals_delete_policy ON withdrawals
  FOR DELETE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = withdrawals.user_id
  ));
