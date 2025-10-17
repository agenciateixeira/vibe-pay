import { TransactionService } from '../services/transaction.service.js'

export async function handleOpenPixWebhook(payload: any) {
  console.log('🎣 Webhook recebido da OpenPix:')
  console.log('Evento:', payload.event)
  console.log('Charge:', payload.charge?.correlationID)

  // Criar o serviço AQUI dentro da função, não fora!
  const transactionService = new TransactionService()

  try {
    const event = payload.event
    const charge = payload.charge

    if (!charge || !charge.correlationID) {
      console.warn('⚠️ Webhook sem correlationID')
      return { success: false, error: 'Missing correlationID' }
    }

    const transaction = await transactionService.findByCorrelationId(charge.correlationID)

    if (!transaction) {
      console.warn(`⚠️ Transação ${charge.correlationID} não encontrada`)
      return { success: false, error: 'Transaction not found' }
    }

    switch (event) {
      case 'OPENPIX:CHARGE_COMPLETED':
        console.log('💰 Pagamento completado!')
        await transactionService.updateStatus(
          charge.correlationID,
          'completed',
          new Date()
        )
        break

      case 'OPENPIX:CHARGE_EXPIRED':
        console.log('⏰ Cobrança expirada')
        await transactionService.updateStatus(
          charge.correlationID,
          'expired'
        )
        break

      case 'OPENPIX:CHARGE_CREATED':
        console.log('📝 Cobrança criada')
        break

      default:
        console.log(`ℹ️ Evento não tratado: ${event}`)
    }

    return { success: true, event, correlationID: charge.correlationID }
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error.message)
    return { success: false, error: error.message }
  }
}