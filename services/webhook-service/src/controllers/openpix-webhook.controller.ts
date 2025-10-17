import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface OpenPixWebhookPayload {
  event: string
  charge?: {
    correlationID?: string
    transactionID?: string
    value?: number
    status?: string
    customer?: any
  }
  pix?: {
    charge?: {
      correlationID?: string
    }
    transactionID?: string
    value?: number
    endToEndId?: string
  }
}

export async function handleOpenPixWebhook(
  request: FastifyRequest<{ Body: OpenPixWebhookPayload }>,
  reply: FastifyReply
) {
  const supabase = getSupabaseClient()
  const payload = request.body

  console.log('\n🔔 Webhook OpenPix recebido:')
  console.log('Event:', payload.event)
  console.log('Payload:', JSON.stringify(payload, null, 2))

  try {
    // Verificar assinatura (se configurado)
    const signature = request.headers['x-webhook-signature'] as string
    if (signature && process.env.OPENPIX_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        JSON.stringify(payload),
        signature,
        process.env.OPENPIX_WEBHOOK_SECRET
      )
      
      if (!isValid) {
        console.error('❌ Assinatura inválida')
        return reply.code(401).send({ error: 'Invalid signature' })
      }
    }

    // Extrair dados do webhook
    const correlationId = payload.charge?.correlationID || payload.pix?.charge?.correlationID
    const transactionId = payload.charge?.transactionID || payload.pix?.transactionID
    const value = payload.charge?.value || payload.pix?.value || 0
    const status = payload.charge?.status || 'COMPLETED'

    // Salvar log do webhook
    const { data: webhookLog, error: logError } = await supabase
      .from('openpix_webhook_logs')
      .insert({
        event_type: payload.event,
        correlation_id: correlationId,
        transaction_id: transactionId,
        status: status,
        value: value,
        payload: payload,
        processed: false
      })
      .select()
      .single()

    if (logError) {
      console.error('❌ Erro ao salvar log:', logError)
    }

    // Processar apenas eventos de pagamento concluído
    if (payload.event === 'OPENPIX:CHARGE_COMPLETED' || 
        payload.event === 'OPENPIX:TRANSACTION_RECEIVED') {
      
      console.log('✅ Processando pagamento confirmado...')
      console.log('CorrelationID:', correlationId)
      console.log('TransactionID:', transactionId)
      console.log('Value:', value)

      if (!correlationId) {
        console.error('❌ CorrelationID não encontrado')
        return reply.code(400).send({ error: 'CorrelationID not found' })
      }

      // Tentar processar como Payment Link
      const processedLink = await processPaymentLink(
        supabase,
        correlationId,
        transactionId || '',
        value
      )

      // Se não for Payment Link, tentar como Recurring Charge
      if (!processedLink) {
        await processRecurringCharge(
          supabase,
          correlationId,
          transactionId || '',
          value
        )
      }

      // Marcar webhook como processado
      if (webhookLog) {
        await supabase
          .from('openpix_webhook_logs')
          .update({
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', webhookLog.id)
      }

      console.log('✅ Webhook processado com sucesso!')
    } else {
      console.log('ℹ️ Evento não requer processamento:', payload.event)
    }

    return reply.send({
      success: true,
      message: 'Webhook received successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error)

    // Salvar erro no log
    if (payload.charge?.correlationID || payload.pix?.charge?.correlationID) {
      await supabase
        .from('openpix_webhook_logs')
        .update({
          error_message: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('correlation_id', payload.charge?.correlationID || payload.pix?.charge?.correlationID)
    }

    return reply.code(500).send({
      error: 'Internal server error',
      message: error.message
    })
  }
}

async function processPaymentLink(
  supabase: any,
  correlationId: string,
  transactionId: string,
  value: number
): Promise<boolean> {
  console.log('🔍 Verificando Payment Link...')

  // Buscar payment link
  const { data: link, error: linkError } = await supabase
    .from('payment_links')
    .select('*, users!inner(id)')
    .eq('correlation_id', correlationId)
    .eq('status', 'ACTIVE')
    .single()

  if (linkError || !link) {
    console.log('ℹ️ Payment Link não encontrado ou já processado')
    return false
  }

  console.log('✅ Payment Link encontrado:', link.id)

  // Atualizar status do link
  const { error: updateError } = await supabase
    .from('payment_links')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      transaction_id: transactionId,
      paid_value: value
    })
    .eq('id', link.id)

  if (updateError) {
    console.error('❌ Erro ao atualizar Payment Link:', updateError)
    throw updateError
  }

  console.log('✅ Payment Link atualizado para PAID')

  // Atualizar saldo do usuário
  const currentBalance = parseFloat(link.users.balance?.toString() || '0')
  const newBalance = currentBalance + value

  const { error: balanceError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', link.user_id)

  if (balanceError) {
    console.error('❌ Erro ao atualizar saldo:', balanceError)
  } else {
    console.log('✅ Saldo atualizado:', currentBalance, '→', newBalance)
  }

  return true
}

async function processRecurringCharge(
  supabase: any,
  billId: string,
  transactionId: string,
  value: number
): Promise<boolean> {
  console.log('🔍 Verificando Recurring Charge...')

  // Buscar cobrança recorrente
  const { data: charge, error: chargeError } = await supabase
    .from('recurring_charges')
    .select('*, users!inner(id, balance)')
    .eq('bill_id', billId)
    .eq('status', 'ACTIVE')
    .single()

  if (chargeError || !charge) {
    console.log('ℹ️ Recurring Charge não encontrado ou já processado')
    return false
  }

  console.log('✅ Recurring Charge encontrado:', charge.id)

  // Calcular próxima data de cobrança
  let nextBillingDate = new Date()
  switch (charge.frequency) {
    case 'weekly':
      nextBillingDate.setDate(nextBillingDate.getDate() + 7)
      break
    case 'monthly':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      break
    case 'semiannual':
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 6)
      break
    case 'annual':
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
      break
  }

  // Atualizar cobrança recorrente
  const { error: updateError } = await supabase
    .from('recurring_charges')
    .update({
      last_charge_date: new Date().toISOString(),
      next_billing_date: nextBillingDate.toISOString(),
      total_charged: (charge.total_charged || 0) + 1,
      transaction_id: transactionId
    })
    .eq('id', charge.id)

  if (updateError) {
    console.error('❌ Erro ao atualizar Recurring Charge:', updateError)
    throw updateError
  }

  console.log('✅ Recurring Charge atualizado')

  // Criar registro no histórico
  const { error: historyError } = await supabase
    .from('recurring_charge_history')
    .insert({
      recurring_charge_id: charge.id,
      amount: value,
      status: 'PAID',
      transaction_id: transactionId,
      charge_date: new Date().toISOString()
    })

  if (historyError) {
    console.error('❌ Erro ao criar histórico:', historyError)
  } else {
    console.log('✅ Histórico criado')
  }

  // Atualizar saldo do usuário
  const currentBalance = parseFloat(charge.users.balance?.toString() || '0')
  const newBalance = currentBalance + value

  const { error: balanceError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', charge.user_id)

  if (balanceError) {
    console.error('❌ Erro ao atualizar saldo:', balanceError)
  } else {
    console.log('✅ Saldo atualizado:', currentBalance, '→', newBalance)
  }

  return true
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return signature === expectedSignature
}

export async function getWebhookLogs(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()

    const { data: logs, error } = await supabase
      .from('openpix_webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    return reply.send({
      success: true,
      logs: logs || []
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar logs:', error)
    return reply.code(500).send({ error: error.message })
  }
}