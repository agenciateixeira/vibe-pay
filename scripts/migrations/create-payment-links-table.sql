-- Migration: Create payment_links table
-- Description: Shareable payment links for one-time payments
-- Created: 2025-10-16

CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Link details
  amount DECIMAL(10, 2) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- URLs
  return_url TEXT,
  completion_url TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',
  -- Possible values: ACTIVE, INACTIVE, EXPIRED

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(status);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON payment_links(created_at DESC);

-- Constraints
ALTER TABLE payment_links
ADD CONSTRAINT check_amount_positive
CHECK (amount > 0);

ALTER TABLE payment_links
ADD CONSTRAINT check_status_valid
CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_links_updated_at_trigger
BEFORE UPDATE ON payment_links
FOR EACH ROW
EXECUTE FUNCTION update_payment_links_updated_at();

-- RLS Policies
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- Users can view their own links
CREATE POLICY payment_links_select_policy ON payment_links
  FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payment_links.user_id
  ));

-- Users can insert their own links
CREATE POLICY payment_links_insert_policy ON payment_links
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payment_links.user_id
  ));

-- Users can update their own links
CREATE POLICY payment_links_update_policy ON payment_links
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payment_links.user_id
  ));

-- Users can delete their own links
CREATE POLICY payment_links_delete_policy ON payment_links
  FOR DELETE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = payment_links.user_id
  ));
