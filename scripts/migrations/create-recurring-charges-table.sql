-- Migration: Create recurring_charges table
-- Description: Recurring subscription/charge management
-- Created: 2025-10-16

CREATE TABLE IF NOT EXISTS recurring_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Charge details
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  -- Possible values: weekly, monthly, semiannual, annual

  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_tax_id VARCHAR(18) NOT NULL,

  -- Status and scheduling
  status VARCHAR(20) DEFAULT 'ACTIVE',
  -- Possible values: ACTIVE, PAUSED, CANCELLED
  next_charge_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_charge_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recurring_charges_user_id ON recurring_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_status ON recurring_charges(status);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_next_charge_date ON recurring_charges(next_charge_date);
CREATE INDEX IF NOT EXISTS idx_recurring_charges_customer_email ON recurring_charges(customer_email);

-- Constraints
ALTER TABLE recurring_charges
ADD CONSTRAINT check_amount_positive
CHECK (amount > 0);

ALTER TABLE recurring_charges
ADD CONSTRAINT check_status_valid
CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED'));

ALTER TABLE recurring_charges
ADD CONSTRAINT check_frequency_valid
CHECK (frequency IN ('weekly', 'monthly', 'semiannual', 'annual'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_recurring_charges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_charges_updated_at_trigger
BEFORE UPDATE ON recurring_charges
FOR EACH ROW
EXECUTE FUNCTION update_recurring_charges_updated_at();

-- RLS Policies
ALTER TABLE recurring_charges ENABLE ROW LEVEL SECURITY;

-- Users can view their own charges
CREATE POLICY recurring_charges_select_policy ON recurring_charges
  FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id
  ));

-- Users can insert their own charges
CREATE POLICY recurring_charges_insert_policy ON recurring_charges
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id
  ));

-- Users can update their own charges
CREATE POLICY recurring_charges_update_policy ON recurring_charges
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id
  ));

-- Users can delete their own charges
CREATE POLICY recurring_charges_delete_policy ON recurring_charges
  FOR DELETE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = recurring_charges.user_id
  ));
