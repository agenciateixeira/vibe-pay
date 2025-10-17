import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreatePaymentBody {
  amount: number
  description: string
  customer: {
    name: string
    email: string
    phone: string
    taxID: string
  }
}

export async function createPayment(
  request: FastifyRequest<{ Body: CreatePaymentBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const paymentData = request.body

    console.log('💳 Criando pagamento...', paymentData)

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

    // Criar cobrança via OpenPix
    const openPixResponse = await fetch(`${process.env.OPENPIX_API_URL}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Authorization': process.env.OPENPIX_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correlationID: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        value: Math.round(paymentData.amount * 100),
        comment: paymentData.description,
        customer: {
          name: paymentData.customer.name,
          email: paymentData.customer.email,
          phone: paymentData.customer.phone,
          taxID: paymentData.customer.taxID.replace(/\D/g, '')
        }
      })
    })

    const openPixData = await openPixResponse.json()

    if (!openPixResponse.ok) {
      console.error('❌ Erro OpenPix:', openPixData)
      return reply.code(500).send({ error: 'Failed to create charge' })
    }

    const charge = openPixData.charge

    // Salvar no banco
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: userData.id,
        correlation_id: charge.correlationID,
        amount: paymentData.amount,
        description: paymentData.description,
        customer_name: paymentData.customer.name,
        customer_email: paymentData.customer.email,
        customer_phone: paymentData.customer.phone,
        customer_tax_id: paymentData.customer.taxID,
        pix_key: charge.brCode,
        qr_code_url: charge.qrCodeImage,
        status: 'ACTIVE',
        expires_at: charge.expiresDate
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao salvar pagamento:', insertError)
      return reply.code(500).send({ error: 'Failed to save payment' })
    }

    console.log('✅ Pagamento criado:', payment.id)

    return reply.send({
      success: true,
      payment: {
        id: payment.id,
        correlation_id: payment.correlation_id,
        amount: payment.amount,
        pix_key: payment.pix_key,
        qr_code_url: payment.qr_code_url,
        status: payment.status,
        expires_at: payment.expires_at
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar pagamento:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getPayments(
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

    // Buscar pagamentos
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('❌ Erro ao buscar pagamentos:', paymentsError)
      // Retornar array vazio ao invés de erro
      return reply.send({
        success: true,
        payments: [],
        transactions: []
      })
    }

    return reply.send({
      success: true,
      payments: payments || [],
      transactions: payments || []
    })
  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    // Retornar array vazio ao invés de erro
    return reply.send({
      success: true,
      payments: [],
      transactions: []
    })
  }
}

export async function getPayment(
  request: FastifyRequest<{ Params: { correlationId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { correlationId } = request.params

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

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('correlation_id', correlationId)
      .eq('user_id', userData.id)
      .single()

    if (paymentError || !payment) {
      return reply.code(404).send({ error: 'Payment not found' })
    }

    return reply.send({
      success: true,
      payment
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar pagamento:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getPublicPayment(
  request: FastifyRequest<{ Params: { billId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { billId } = request.params

    console.log('🌐 Buscando pagamento público:', billId)

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('correlation_id', billId)
      .single()

    if (paymentError || !payment) {
      console.error('❌ Pagamento não encontrado:', paymentError)
      return reply.code(404).send({ error: 'Payment not found' })
    }

    return reply.send({
      success: true,
      payment: {
        id: payment.id,
        correlation_id: payment.correlation_id,
        amount: payment.amount,
        description: payment.description,
        pix_key: payment.pix_key,
        qr_code_url: payment.qr_code_url,
        status: payment.status,
        expires_at: payment.expires_at,
        customer_name: payment.customer_name
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar pagamento público:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function deletePayment(
  request: FastifyRequest<{ Params: { paymentId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { paymentId } = request.params

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

    // Verificar se o pagamento existe e pertence ao usuário
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', userData.id)
      .single()

    if (paymentError || !payment) {
      return reply.code(404).send({ error: 'Payment not found' })
    }

    // Deletar pagamento
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId)

    if (deleteError) {
      console.error('❌ Erro ao deletar pagamento:', deleteError)
      return reply.code(500).send({ error: 'Failed to delete payment' })
    }

    console.log('✅ Pagamento deletado:', paymentId)

    return reply.send({
      success: true,
      message: 'Payment deleted successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao deletar pagamento:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function updatePaymentStatus(
  request: FastifyRequest<{ 
    Params: { paymentId: string }
    Body: { status: string }
  }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { paymentId } = request.params
    const { status } = request.body

    console.log('🔄 Atualizando status do pagamento:', paymentId, '->', status)

    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar status:', updateError)
      return reply.code(500).send({ error: 'Failed to update status' })
    }

    console.log('✅ Status atualizado com sucesso')

    return reply.send({
      success: true,
      payment
    })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar status:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function processWebhook(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const webhookData = request.body as any

    console.log('🔔 Webhook recebido:', webhookData)

    if (!webhookData.charge) {
      console.log('⚠️ Webhook sem dados de charge')
      return reply.send({ success: true })
    }

    const charge = webhookData.charge
    const correlationId = charge.correlationID
    const status = charge.status === 'COMPLETED' ? 'COMPLETED' : charge.status

    // Buscar pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('correlation_id', correlationId)
      .single()

    if (paymentError || !payment) {
      console.log('⚠️ Pagamento não encontrado para correlationId:', correlationId)
      return reply.send({ success: true })
    }

    // Atualizar status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar pagamento:', updateError)
      return reply.code(500).send({ error: 'Failed to update payment' })
    }

    // Se foi pago, atualizar saldo do usuário
    if (status === 'COMPLETED') {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance, total_received')
        .eq('id', payment.user_id)
        .single()

      if (!userError && user) {
        const newBalance = parseFloat(user.balance || '0') + parseFloat(payment.amount)
        const newTotalReceived = parseFloat(user.total_received || '0') + parseFloat(payment.amount)

        await supabase
          .from('users')
          .update({
            balance: newBalance,
            total_received: newTotalReceived
          })
          .eq('id', payment.user_id)

        console.log('✅ Saldo atualizado. Novo saldo:', newBalance)
      }
    }

    console.log('✅ Webhook processado com sucesso')

    return reply.send({ success: true })
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error)
    return reply.code(500).send({ error: error.message })
  }
}