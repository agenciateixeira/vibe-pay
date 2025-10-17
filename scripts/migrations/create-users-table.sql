-- Migration: Create users table
-- Description: Extended user profile with financial data
-- Created: 2025-10-16

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),

  -- Financial data
  balance DECIMAL(15, 2) DEFAULT 0.00,
  total_received DECIMAL(15, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,

  -- Verification and security
  can_withdraw BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  documents_verified BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf_cnpj ON users(cpf_cnpj);

-- Constraints
ALTER TABLE users
ADD CONSTRAINT check_balance_positive
CHECK (balance >= 0);

ALTER TABLE users
ADD CONSTRAINT check_cpf_cnpj_format
CHECK (cpf_cnpj ~ '^[0-9]{11}$|^[0-9]{14}$');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Users can update their own data
CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Users can insert their own data (during registration)
CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);
