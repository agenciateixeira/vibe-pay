import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Transaction {
  id: string
  type: 'payment' | 'withdrawal'
  amount: number
  status: string
  created_at: string
  description?: string
  customer_name?: string
  customer_email?: string
  pix_key?: string
  correlation_id?: string
  transaction_id?: string
}

export async function getTransactions(
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

    // Buscar pagamentos recebidos
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false })

    // Buscar saques realizados
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    const transactions: Transaction[] = []

    // Adicionar pagamentos ao extrato
    if (payments && !paymentsError) {
      payments.forEach((payment) => {
        transactions.push({
          id: payment.id,
          type: 'payment',
          amount: payment.amount,
          status: payment.status,
          created_at: payment.created_at,
          description: payment.description,
          customer_name: payment.customer_name,
          customer_email: payment.customer_email,
          correlation_id: payment.correlation_id,
          transaction_id: payment.txid || payment.correlation_id
        })
      })
    }

    // Adicionar saques ao extrato
    if (withdrawals && !withdrawalsError) {
      withdrawals.forEach((withdrawal) => {
        transactions.push({
          id: withdrawal.id,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: withdrawal.status,
          created_at: withdrawal.created_at,
          description: `Saque PIX - ${withdrawal.pix_key_type}`,
          pix_key: withdrawal.pix_key,
          transaction_id: withdrawal.transaction_id || withdrawal.id
        })
      })
    }

    // Ordenar por data decrescente
    transactions.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Calcular resumo
    const totalReceived = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const totalWithdrawn = withdrawals
      ?.filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0) || 0
    const pendingWithdrawals = withdrawals
      ?.filter(w => w.status === 'PENDING')
      .reduce((sum, w) => sum + w.amount, 0) || 0

    console.log(`📊 Extrato: ${transactions.length} transações`)

    return reply.send({
      success: true,
      transactions,
      summary: {
        total_received: totalReceived,
        total_withdrawn: totalWithdrawn,
        pending_withdrawals: pendingWithdrawals,
        balance: totalReceived - totalWithdrawn,
        total_transactions: transactions.length
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar transações:', error)
    return reply.send({
      success: true,
      transactions: [],
      summary: {
        total_received: 0,
        total_withdrawn: 0,
        pending_withdrawals: 0,
        balance: 0,
        total_transactions: 0
      }
    })
  }
}
