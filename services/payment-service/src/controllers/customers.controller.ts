import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getCustomers(
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

    // Buscar clientes únicos dos pagamentos
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('customer_name, customer_email, customer_phone, customer_tax_id, created_at')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('❌ Erro ao buscar clientes:', paymentsError)
      return reply.send({
        success: true,
        customers: []
      })
    }

    // Agrupar por email (cliente único)
    const customersMap = new Map()
    
    payments?.forEach(payment => {
      if (!customersMap.has(payment.customer_email)) {
        customersMap.set(payment.customer_email, {
          name: payment.customer_name,
          email: payment.customer_email,
          phone: payment.customer_phone,
          tax_id: payment.customer_tax_id,
          first_purchase: payment.created_at
        })
      }
    })

    const customers = Array.from(customersMap.values())

    return reply.send({
      success: true,
      customers
    })
  } catch (error: any) {
    console.error('❌ Erro ao listar clientes:', error)
    return reply.send({
      success: true,
      customers: []
    })
  }
}

export async function getCustomerStats(
  request: FastifyRequest<{ Params: { email: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { email } = request.params

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

    // Buscar todas as transações do cliente
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('customer_email', decodeURIComponent(email))
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('❌ Erro ao buscar transações:', paymentsError)
      return reply.send({
        success: true,
        stats: {
          total_spent: 0,
          total_transactions: 0,
          last_purchase: null
        }
      })
    }

    const completedPayments = payments?.filter(p => p.status === 'COMPLETED') || []
    const totalSpent = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)

    return reply.send({
      success: true,
      stats: {
        total_spent: totalSpent,
        total_transactions: payments?.length || 0,
        last_purchase: payments?.[0]?.created_at || null,
        transactions: payments || []
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    return reply.code(500).send({ error: error.message })
  }
}