-- Migration: Create products table
-- Description: Table to store products/services for recurring charges and payment links
-- Created: 2025-10-16

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'one-time',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Create index on active status for filtering
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Add constraint to ensure valid frequency values
ALTER TABLE products
ADD CONSTRAINT check_frequency
CHECK (frequency IN ('weekly', 'monthly', 'semiannual', 'annual', 'one-time'));

-- Add constraint to ensure amount is positive
ALTER TABLE products
ADD CONSTRAINT check_amount_positive
CHECK (amount > 0);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own products
CREATE POLICY products_select_policy ON products
  FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = products.user_id
  ));

-- Policy: Users can insert their own products
CREATE POLICY products_insert_policy ON products
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = products.user_id
  ));

-- Policy: Users can update their own products
CREATE POLICY products_update_policy ON products
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = products.user_id
  ));

-- Policy: Users can delete their own products
CREATE POLICY products_delete_policy ON products
  FOR DELETE
  USING (auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = products.user_id
  ));
