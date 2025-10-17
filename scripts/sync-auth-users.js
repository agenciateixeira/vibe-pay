/**
 * Script para sincronizar usuários do Supabase Auth com a tabela users
 *
 * USO:
 * 1. Certifique-se de ter as dependências instaladas: npm install
 * 2. Execute este script a partir da raiz do projeto:
 *
 * node scripts/sync-auth-users.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Carregar variáveis de ambiente
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!')
  console.error('Certifique-se de que SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no arquivo .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function syncAuthUsers() {
  try {
    console.log('🔄 Iniciando sincronização de usuários...\n')

    // 1. Buscar todos os usuários do Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Erro ao buscar usuários do Auth:', authError.message)
      process.exit(1)
    }

    console.log(`📊 Encontrados ${authUsers.users.length} usuários no Auth\n`)

    // 2. Para cada usuário do Auth, verificar se existe na tabela users
    let syncedCount = 0
    let existingCount = 0
    let errorCount = 0

    for (const authUser of authUsers.users) {
      // Verificar se já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single()

      if (existingUser) {
        console.log(`✅ Usuário já existe: ${authUser.email}`)
        existingCount++
        continue
      }

      // Criar registro na tabela users
      console.log(`🔧 Criando registro para: ${authUser.email}`)

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          cpf_cnpj: authUser.user_metadata?.cpf_cnpj || null,
          phone: authUser.user_metadata?.phone || authUser.phone || null,
          company_name: authUser.user_metadata?.company_name || null,
          balance: 0,
          total_received: 0,
          total_withdrawn: 0,
          can_withdraw: false,
          two_factor_enabled: false,
          documents_verified: false
        })

      if (insertError) {
        console.error(`❌ Erro ao criar usuário ${authUser.email}:`, insertError.message)
        errorCount++
      } else {
        console.log(`✅ Usuário criado: ${authUser.email}`)
        syncedCount++
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(50))
    console.log('📈 RESUMO DA SINCRONIZAÇÃO')
    console.log('='.repeat(50))
    console.log(`Total de usuários no Auth: ${authUsers.users.length}`)
    console.log(`Já existiam na tabela users: ${existingCount}`)
    console.log(`Novos usuários criados: ${syncedCount}`)
    console.log(`Erros: ${errorCount}`)
    console.log('='.repeat(50))

    if (syncedCount > 0) {
      console.log('\n✅ Sincronização concluída! Os usuários já podem fazer login.')
    } else if (existingCount === authUsers.users.length) {
      console.log('\n✅ Todos os usuários já estavam sincronizados!')
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

// Executar
syncAuthUsers()
