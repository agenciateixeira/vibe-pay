import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateRecurringChargeBody {
  amount: number
  description: string
  frequency: 'weekly' | 'monthly' | 'semiannual' | 'annual'
  customer: {
    name: string
    email: string
    phone: string
    taxID: string
  }
}

export async function createRecurringCharge(
  request: FastifyRequest<{ Body: CreateRecurringChargeBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const chargeData = request.body

    console.log('🔄 Criando cobrança recorrente...', chargeData)

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

    // Calcular próxima data de cobrança
    const nextChargeDate = calculateNextChargeDate(chargeData.frequency)

    // Salvar no banco
    const { data: charge, error: insertError } = await supabase
      .from('recurring_charges')
      .insert({
        user_id: userData.id,
        amount: chargeData.amount,
        description: chargeData.description,
        frequency: chargeData.frequency,
        customer_name: chargeData.customer.name,
        customer_email: chargeData.customer.email,
        customer_phone: chargeData.customer.phone,
        customer_tax_id: chargeData.customer.taxID,
        status: 'ACTIVE',
        next_charge_date: nextChargeDate
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao criar cobrança:', insertError)
      return reply.code(500).send({ error: 'Failed to create recurring charge' })
    }

    console.log('✅ Cobrança criada:', charge.id)

    const paymentLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/charge_${charge.id}`

    return reply.send({
      success: true,
      recurring_charge: {
        id: charge.id,
        amount: charge.amount,
        description: charge.description,
        frequency: charge.frequency,
        status: charge.status,
        next_billing_date: charge.next_charge_date,
        payment_link: paymentLinkUrl,
        bill_id: charge.id,
        customer: {
          name: charge.customer_name,
          email: charge.customer_email,
          phone: charge.customer_phone,
          taxID: charge.customer_tax_id
        },
        created_at: charge.created_at
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar cobrança:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getRecurringCharges(
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

    const { data: charges, error: chargesError } = await supabase
      .from('recurring_charges')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (chargesError) {
      console.error('❌ Erro ao buscar cobranças:', chargesError)
      return reply.send({
        success: true,
        recurring_charges: []
      })
    }

    // Formatar as cobranças para o formato esperado pelo frontend
    const formattedCharges = (charges || []).map(charge => ({
      id: charge.id,
      customer_name: charge.customer_name,
      customer_email: charge.customer_email,
      customer_phone: charge.customer_phone,
      customer_taxid: charge.customer_tax_id,
      amount: charge.amount,
      description: charge.description,
      frequency: charge.frequency,
      status: charge.status,
      next_billing_date: charge.next_charge_date,
      payment_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/charge_${charge.id}`,
      bill_id: charge.id,
      last_billing_date: null, // TODO: buscar do histórico
      created_at: charge.created_at
    }))

    return reply.send({
      success: true,
      recurring_charges: formattedCharges
    })
  } catch (error: any) {
    console.error('❌ Erro ao listar cobranças:', error)
    return reply.send({
      success: true,
      recurring_charges: []
    })
  }
}

export async function updateRecurringChargeStatus(
  request: FastifyRequest<{ 
    Params: { chargeId: string }
    Body: { status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' }
  }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { chargeId } = request.params
    const { status } = request.body

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

    const { data: charge, error: updateError } = await supabase
      .from('recurring_charges')
      .update({ status })
      .eq('id', chargeId)
      .eq('user_id', userData.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar status:', updateError)
      return reply.code(500).send({ error: 'Failed to update status' })
    }

    console.log('✅ Status atualizado:', chargeId, '->', status)

    return reply.send({
      success: true,
      charge
    })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar status:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getChargeHistory(
  request: FastifyRequest<{ Params: { chargeId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { chargeId } = request.params

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

    // Verificar se a cobrança pertence ao usuário
    const { data: charge, error: chargeError } = await supabase
      .from('recurring_charges')
      .select('id')
      .eq('id', chargeId)
      .eq('user_id', userData.id)
      .single()

    if (chargeError || !charge) {
      return reply.code(404).send({ error: 'Charge not found' })
    }

    // Buscar histórico
    const { data: history, error: historyError } = await supabase
      .from('charge_history')
      .select('*')
      .eq('recurring_charge_id', chargeId)
      .order('charged_at', { ascending: false })

    if (historyError) {
      console.error('❌ Erro ao buscar histórico:', historyError)
      return reply.send({
        success: true,
        history: []
      })
    }

    return reply.send({
      success: true,
      history: history || []
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar histórico:', error)
    return reply.send({
      success: true,
      history: []
    })
  }
}

export async function getPublicRecurringCharge(
  request: FastifyRequest<{ Params: { billId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    let { billId } = request.params

    // Remover prefixo charge_ se existir
    const actualId = billId.startsWith('charge_') ? billId.replace('charge_', '') : billId

    console.log('🌐 Buscando cobrança recorrente pública:', actualId)

    const { data: charge, error: chargeError } = await supabase
      .from('recurring_charges')
      .select('*')
      .eq('id', actualId)
      .single()

    if (chargeError || !charge) {
      console.error('❌ Cobrança não encontrada:', chargeError)
      return reply.code(404).send({ error: 'Charge not found' })
    }

    return reply.send({
      success: true,
      charge: {
        id: charge.id,
        bill_id: charge.id,
        amount: charge.amount,
        description: charge.description,
        customer_name: charge.customer_name,
        frequency: charge.frequency,
        status: charge.status,
        next_billing_date: charge.next_charge_date,
        company_name: 'Vibe Pay' // TODO: buscar do usuário
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar cobrança pública:', error)
    return reply.code(500).send({ error: error.message })
  }
}

function calculateNextChargeDate(frequency: string): string {
  const now = new Date()
  
  switch (frequency) {
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      break
    case 'semiannual':
      now.setMonth(now.getMonth() + 6)
      break
    case 'annual':
      now.setFullYear(now.getFullYear() + 1)
      break
  }
  
  return now.toISOString()
}