-- =====================================================
-- SINCRONIZAR USUÁRIOS DO AUTH COM TABELA USERS
-- =====================================================
-- Este script cria registros na tabela users para todos
-- os usuários que existem no Supabase Auth mas não têm
-- registro na tabela users
-- =====================================================

-- Listar usuários do auth que não têm registro em users
-- (Execute esta query primeiro para ver quem precisa ser sincronizado)

SELECT
  au.id as auth_user_id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.users u ON u.auth_user_id = au.id
WHERE u.id IS NULL;

-- =====================================================
-- IMPORTANTE: Antes de executar o script abaixo,
-- você precisa verificar se existem usuários sem registro.
-- Se existirem, você pode criar manualmente ou usar o script abaixo.
-- =====================================================

-- Script para criar registros faltantes
-- ATENÇÃO: Edite os valores antes de executar!

-- Exemplo para criar um usuário específico:
-- Substitua os valores pelos dados reais do usuário

/*
INSERT INTO public.users (
  auth_user_id,
  email,
  full_name,
  cpf_cnpj,
  phone,
  company_name,
  balance,
  total_received,
  total_withdrawn
) VALUES (
  'cole-aqui-o-auth-user-id',  -- Pegar da query acima
  'email@usuario.com',           -- Email do usuário
  'Nome Completo',               -- Nome do usuário
  '00000000000',                 -- CPF ou CNPJ
  '11999999999',                 -- Telefone (opcional)
  'Nome da Empresa',             -- Nome da empresa (opcional)
  0.00,                          -- Balance inicial
  0.00,                          -- Total received inicial
  0.00                           -- Total withdrawn inicial
);
*/

-- =====================================================
-- ✅ Após criar o registro, o usuário poderá usar o sistema
-- =====================================================
