import { config } from 'dotenv'
config({ path: '../../.env' })

import Fastify from 'fastify'
import cors from '@fastify/cors'
import {
  createPayment,
  getPayments,
  getPayment,
  getPublicPayment,
  deletePayment,
  processWebhook
} from './controllers/payment.controller.js'
import {
  createPaymentLink,
  getPaymentLinks,
  deletePaymentLink,
  getPublicPaymentLink
} from './controllers/payment-links.controller.js'
import {
  createRecurringCharge,
  getRecurringCharges,
  updateRecurringChargeStatus,
  getPublicRecurringCharge,
  getChargeHistory
} from './controllers/recurring-charges.controller.js'
import {
  getCustomers,
  getCustomerStats
} from './controllers/customers.controller.js'
import {
  createWithdrawal,
  getWithdrawals,
  getBalance,
  cancelWithdrawal
} from './controllers/withdrawals.controller.js'
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from './controllers/products.controller.js'

const server = Fastify({ logger: true })

await server.register(cors, { origin: true })

server.get('/health', async () => {
  return { status: 'ok', service: 'vibe-pay-payment-service' }
})

// ===== PAYMENTS =====
server.post('/payments/create', createPayment)
server.get('/payments', getPayments)
server.get('/payments/:correlationId', getPayment)
server.get('/payments/public/:billId', getPublicPayment)
server.delete('/payments/:paymentId', deletePayment)
server.post('/payments/webhook', processWebhook)

// ===== PAYMENT LINKS =====
server.post('/payment-links/create', createPaymentLink)
server.get('/payment-links', getPaymentLinks)
server.delete('/payment-links/:linkId', deletePaymentLink)
server.get('/payment-links/public/:linkId', getPublicPaymentLink)

// ===== RECURRING CHARGES =====
server.post('/recurring-charges/create', createRecurringCharge)
server.get('/recurring-charges', getRecurringCharges)
server.get('/recurring-charges/public/:billId', getPublicRecurringCharge)
server.get('/recurring-charges/:chargeId/history', getChargeHistory)
server.put('/recurring-charges/:chargeId/status', updateRecurringChargeStatus)

// ===== CUSTOMERS =====
server.get('/customers', getCustomers)
server.get('/customers/:email/stats', getCustomerStats)

// ===== WITHDRAWALS =====
server.post('/withdrawals/create', createWithdrawal)
server.get('/withdrawals', getWithdrawals)
server.get('/withdrawals/balance', getBalance)
server.delete('/withdrawals/:withdrawalId', cancelWithdrawal)

// ===== PRODUCTS =====
server.post('/products/create', createProduct)
server.get('/products', getProducts)
server.put('/products/:productId', updateProduct)
server.delete('/products/:productId', deleteProduct)

const start = async () => {
  try {
    const port = Number(process.env.PAYMENT_SERVICE_PORT) || 4002
    await server.listen({ port, host: '0.0.0.0' })
    
    console.log('\n💳 Vibe Pay Payment Service')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📍 http://localhost:${port}`)
    console.log('\n📋 Endpoints disponíveis:')
    console.log('\n💰 Payments:')
    console.log('  POST   /payments/create - Criar pagamento')
    console.log('  GET    /payments - Listar pagamentos')
    console.log('  GET    /payments/:id - Buscar pagamento')
    console.log('  GET    /payments/public/:id - Buscar pagamento público')
    console.log('  DELETE /payments/:id - Deletar pagamento')
    console.log('  POST   /payments/webhook - Webhook OpenPix')
    console.log('\n🔗 Payment Links:')
    console.log('  POST   /payment-links/create - Criar link')
    console.log('  GET    /payment-links - Listar links')
    console.log('  DELETE /payment-links/:id - Deletar link')
    console.log('  GET    /payment-links/public/:id - Buscar link público')
    console.log('\n🔄 Recurring Charges:')
    console.log('  POST /recurring-charges/create - Criar cobrança recorrente')
    console.log('  GET  /recurring-charges - Listar cobranças')
    console.log('  PUT  /recurring-charges/:id/status - Atualizar status')
    console.log('\n👥 Customers:')
    console.log('  GET /customers - Listar clientes')
    console.log('  GET /customers/:email/stats - Estatísticas do cliente')
    console.log('\n💸 Withdrawals:')
    console.log('  POST   /withdrawals/create - Solicitar saque')
    console.log('  GET    /withdrawals - Listar saques')
    console.log('  GET    /withdrawals/balance - Obter saldo')
    console.log('  DELETE /withdrawals/:id - Cancelar saque')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()