import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateWithdrawalBody {
  amount: number
  pix_key: string
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
}

export async function createWithdrawal(
  request: FastifyRequest<{ Body: CreateWithdrawalBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const withdrawalData = request.body
    
    console.log('💰 Criando solicitação de saque...', { 
      amount: withdrawalData.amount,
      pix_key_type: withdrawalData.pix_key_type 
    })
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, balance, cpf_cnpj, can_withdraw')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    if (!userData.can_withdraw) {
      return reply.code(403).send({ 
        error: 'Withdrawal not allowed',
        message: 'Você precisa completar a verificação de documentos e ativar 2FA antes de sacar'
      })
    }

    const currentBalance = parseFloat(userData.balance?.toString() || '0')
    
    if (currentBalance < withdrawalData.amount) {
      return reply.code(400).send({ 
        error: 'Insufficient balance',
        current_balance: currentBalance,
        requested_amount: withdrawalData.amount
      })
    }

    const pixKey = withdrawalData.pix_key.trim()
    const pixKeyType = withdrawalData.pix_key_type

    if (pixKeyType === 'cpf' || pixKeyType === 'cnpj') {
      const userDoc = userData.cpf_cnpj.replace(/\D/g, '')
      const pixKeyDoc = pixKey.replace(/\D/g, '')
      
      if (userDoc !== pixKeyDoc) {
        return reply.code(400).send({ 
          error: 'Invalid PIX key',
          message: 'A chave PIX deve ser o CPF/CNPJ cadastrado na sua conta'
        })
      }
    }

    if (!validatePixKey(pixKey, pixKeyType)) {
      return reply.code(400).send({ 
        error: 'Invalid PIX key format',
        message: 'Formato de chave PIX inválido'
      })
    }

    const { data: withdrawal, error: insertError } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userData.id,
        amount: withdrawalData.amount,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        user_cpf_cnpj: userData.cpf_cnpj,
        status: 'PENDING'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao criar saque:', insertError)
      return reply.code(500).send({ error: 'Failed to create withdrawal' })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: currentBalance - withdrawalData.amount })
      .eq('id', userData.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar saldo:', updateError)
    }

    console.log('✅ Saque solicitado:', withdrawal.id)

    return reply.send({
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        pix_key: maskPixKey(withdrawal.pix_key, withdrawal.pix_key_type),
        pix_key_type: withdrawal.pix_key_type,
        status: withdrawal.status,
        requested_at: withdrawal.requested_at
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar saque:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getWithdrawals(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userData.id)
      .order('requested_at', { ascending: false })

    if (withdrawalsError) {
      console.error('❌ Erro ao buscar saques:', withdrawalsError)
      return reply.send({
        success: true,
        withdrawals: []
      })
    }

    return reply.send({
      success: true,
      withdrawals: withdrawals || []
    })
  } catch (error: any) {
    console.error('❌ Erro ao listar saques:', error)
    return reply.send({
      success: true,
      withdrawals: []
    })
  }
}

export async function getBalance(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    return reply.send({
      success: true,
      balance: parseFloat(userData.balance || '0')
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar saldo:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function cancelWithdrawal(
  request: FastifyRequest<{ Params: { withdrawalId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { withdrawalId } = request.params

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, balance')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('user_id', userData.id)
      .single()

    if (withdrawalError || !withdrawal) {
      return reply.code(404).send({ error: 'Withdrawal not found' })
    }

    if (withdrawal.status !== 'PENDING') {
      return reply.code(400).send({ error: 'Cannot cancel withdrawal' })
    }

    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: 'CANCELLED' })
      .eq('id', withdrawalId)

    if (updateError) {
      console.error('❌ Erro ao cancelar saque:', updateError)
      return reply.code(500).send({ error: 'Failed to cancel withdrawal' })
    }

    const currentBalance = parseFloat(userData.balance || '0')
    const newBalance = currentBalance + parseFloat(withdrawal.amount)

    await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userData.id)

    console.log('✅ Saque cancelado:', withdrawalId)

    return reply.send({
      success: true,
      message: 'Withdrawal cancelled successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao cancelar saque:', error)
    return reply.code(500).send({ error: error.message })
  }
}

function validatePixKey(key: string, type: string): boolean {
  switch (type) {
    case 'cpf':
      const cpf = key.replace(/\D/g, '')
      return cpf.length === 11
    case 'cnpj':
      const cnpj = key.replace(/\D/g, '')
      return cnpj.length === 14
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)
    case 'phone':
      const phone = key.replace(/\D/g, '')
      return phone.length >= 10 && phone.length <= 11
    case 'random':
      return key.length === 32 || key.length === 36
    default:
      return false
  }
}

function maskPixKey(key: string, type: string): string {
  switch (type) {
    case 'cpf':
      const cpf = key.replace(/\D/g, '')
      return `***.***.${cpf.slice(-3)}-**`
    case 'cnpj':
      const cnpj = key.replace(/\D/g, '')
      return `**.***.***/****-${cnpj.slice(-2)}`
    case 'email':
      const [local, domain] = key.split('@')
      return `${local.slice(0, 3)}***@${domain}`
    case 'phone':
      const phone = key.replace(/\D/g, '')
      return `(${phone.slice(0, 2)}) *****-${phone.slice(-4)}`
    case 'random':
      return `${key.slice(0, 8)}...${key.slice(-4)}`
    default:
      return key
  }
}