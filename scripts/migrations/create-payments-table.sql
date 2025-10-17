-- Migration: Create payments table
-- Description: Store all PIX payment charges and their status
-- Created: 2025-10-16

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- OpenPix data
  correlation_id VARCHAR(255) NOT NULL UNIQUE,
  txid VARCHAR(255),

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,

  -- Customer information
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_tax_id VARCHAR(18),

  -- PIX data
  pix_key TEXT,
  qr_code_url TEXT,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'ACTIVE',
  -- Possible values: ACTIVE, COMPLETED, EXPIRED, ERROR

  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_correlation_id ON payments(correlation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Constraints
ALTER TABLE payments
ADD CONSTRAINT check_amount_positive
CHECK (amount > 0);

ALTER TABLE payments
ADD CONSTRAINT check_status_valid
CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED', 'ERROR', 'PENDING'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at_trigger
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payments_updated_at();

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY payments_select_policy ON payments
  FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payments.user_id
  ));

-- Users can insert their own payments
CREATE POLICY payments_insert_policy ON payments
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payments.user_id
  ));

-- Users can update their own payments
CREATE POLICY payments_update_policy ON payments
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payments.user_id
  ));

-- Users can delete their own payments
CREATE POLICY payments_delete_policy ON payments
  FOR DELETE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payments.user_id
  ));
