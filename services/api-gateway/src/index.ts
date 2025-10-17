import { config } from 'dotenv'
config({ path: '../../.env' })

import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import proxy from '@fastify/http-proxy'

const server = Fastify({ 
  logger: true,
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false
})

await server.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://app.agenciagtx.com.br',
    'https://vibepay.agenciagtx.com.br',
    'https://app.vibep.com.br',
    'https://vibep.com.br',
  ],
  credentials: true
})

await server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

server.get('/health', async () => {
  return { 
    status: 'ok', 
    service: 'vibe-pay-api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

server.get('/', async () => {
  return {
    name: 'Vibe Pay API Gateway',
    version: '1.0.0',
    documentation: '/docs',
    services: {
      auth: '/api/auth/*',
      keys: '/api/keys/*',
      payments: '/api/payments/*',
      paymentLinks: '/api/payment-links/*',
      recurringCharges: '/api/recurring-charges/*',
      customers: '/api/customers/*',
      withdrawals: '/api/withdrawals/*',
      webhooks: '/api/webhooks/*',
      documents: '/api/documents/*',
      twoFactor: '/api/2fa/*',
      openPixWebhook: '/webhook/openpix'
    }
  }
})

// Auth Service Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}`,
  prefix: '/api/auth',
  rewritePrefix: '/auth',
  http2: false,
})

// Auth Service - Keys Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}`,
  prefix: '/api/keys',
  rewritePrefix: '/keys',
  http2: false,
})

// Documents Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}`,
  prefix: '/api/documents',
  rewritePrefix: '/documents',
  http2: false,
})

// 2FA Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}`,
  prefix: '/api/2fa',
  rewritePrefix: '/2fa',
  http2: false,
})

// Payment Service Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}`,
  prefix: '/api/payments',
  rewritePrefix: '/payments',
  http2: false,
})

// Payment Links - Rotas PÚBLICAS (ANTES do proxy autenticado)
server.get('/api/payment-links/public/:linkId', async (request, reply) => {
  const { linkId } = request.params as { linkId: string }
  console.log('🌐 Gateway: Buscando link público:', linkId)
  
  try {
    const response = await fetch(
      `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}/payment-links/public/${linkId}`
    )
    
    const data = await response.json()
    console.log('🌐 Gateway: Resposta:', data)
    
    return reply.code(response.status).send(data)
  } catch (error: any) {
    console.error('🌐 Gateway: Erro:', error)
    return reply.code(500).send({ error: error.message })
  }
})

server.post('/api/payment-links/:linkId/generate-pix', async (request, reply) => {
  const { linkId } = request.params as { linkId: string }
  console.log('🌐 Gateway: Gerando PIX para:', linkId)
  
  try {
    const response = await fetch(
      `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}/payment-links/${linkId}/generate-pix`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.body)
      }
    )
    
    const data = await response.json()
    console.log('🌐 Gateway: Resposta:', data)
    
    return reply.code(response.status).send(data)
  } catch (error: any) {
    console.error('🌐 Gateway: Erro:', error)
    return reply.code(500).send({ error: error.message })
  }
})

// Payment Links Proxy (rotas autenticadas)
await server.register(proxy, {
  upstream: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}`,
  prefix: '/api/payment-links',
  rewritePrefix: '/payment-links',
  http2: false,
})

// Recurring Charges - Rotas PÚBLICAS
server.get('/api/recurring-charges/public/:billId', async (request, reply) => {
  const { billId } = request.params as { billId: string }
  console.log('🌐 Gateway: Buscando cobrança recorrente pública:', billId)
  
  try {
    const response = await fetch(
      `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}/recurring-charges/public/${billId}`
    )
    
    const data = await response.json()
    console.log('🌐 Gateway: Resposta:', data)
    
    return reply.code(response.status).send(data)
  } catch (error: any) {
    console.error('🌐 Gateway: Erro:', error)
    return reply.code(500).send({ error: error.message })
  }
})

server.post('/api/recurring-charges/:billId/generate-pix', async (request, reply) => {
  const { billId } = request.params as { billId: string }
  console.log('🌐 Gateway: Gerando PIX para cobrança recorrente:', billId)
  
  try {
    const response = await fetch(
      `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}/recurring-charges/${billId}/generate-pix`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.body)
      }
    )
    
    const data = await response.json()
    console.log('🌐 Gateway: Resposta:', data)
    
    return reply.code(response.status).send(data)
  } catch (error: any) {
    console.error('🌐 Gateway: Erro:', error)
    return reply.code(500).send({ error: error.message })
  }
})

// Recurring Charges Proxy (rotas autenticadas)
await server.register(proxy, {
  upstream: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}`,
  prefix: '/api/recurring-charges',
  rewritePrefix: '/recurring-charges',
  http2: false,
})

// Customers Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}`,
  prefix: '/api/customers',
  rewritePrefix: '/customers',
  http2: false,
})

// Withdrawals Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}`,
  prefix: '/api/withdrawals',
  rewritePrefix: '/withdrawals',
  http2: false,
})

// Products Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}`,
  prefix: '/api/products',
  rewritePrefix: '/products',
  http2: false,
})

// Webhook Management Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.WEBHOOK_SERVICE_PORT || 4003}`,
  prefix: '/api/webhooks',
  rewritePrefix: '/webhooks',
  http2: false,
})

// ===== OPENPIX WEBHOOK - Rota pública (sem autenticação) =====
server.post('/webhook/openpix', async (request, reply) => {
  console.log('🌐 Gateway: Webhook OpenPix recebido')
  console.log('Headers:', request.headers)
  console.log('Body:', request.body)
  
  try {
    const response = await fetch(
      `http://localhost:${process.env.WEBHOOK_SERVICE_PORT || 4003}/openpix/webhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': (request.headers['x-webhook-signature'] as string) || ''
        },
        body: JSON.stringify(request.body)
      }
    )
    
    const data = await response.json()
    console.log('🌐 Gateway: Resposta do webhook service:', data)
    
    return reply.code(response.status).send(data)
  } catch (error: any) {
    console.error('🌐 Gateway: Erro no webhook:', error)
    return reply.code(500).send({ error: error.message })
  }
})

// OpenPix Logs Proxy
await server.register(proxy, {
  upstream: `http://localhost:${process.env.WEBHOOK_SERVICE_PORT || 4003}`,
  prefix: '/api/openpix',
  rewritePrefix: '/openpix',
  http2: false,
})

server.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    statusCode: 404,
    error: 'Not Found',
    message: `Route ${request.method}:${request.url} not found`,
    documentation: 'https://docs.vibepay.com'
  })
})

server.setErrorHandler((error, request, reply) => {
  server.log.error(error)

  reply.code(error.statusCode || 500).send({
    statusCode: error.statusCode || 500,
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong'
  })
})

const start = async () => {
  try {
    const port = Number(process.env.API_GATEWAY_PORT) || 4000
    await server.listen({ port, host: '0.0.0.0' })
    
    console.log('\n🌐 Vibe Pay API Gateway')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📍 Gateway: http://localhost:${port}`)
    console.log('\n🔗 Routes:')
    console.log(`   Auth Service:         http://localhost:${port}/api/auth/*`)
    console.log(`   Keys Service:         http://localhost:${port}/api/keys/*`)
    console.log(`   Documents:            http://localhost:${port}/api/documents/*`)
    console.log(`   2FA:                  http://localhost:${port}/api/2fa/*`)
    console.log(`   Payment Service:      http://localhost:${port}/api/payments/*`)
    console.log(`   Payment Links:        http://localhost:${port}/api/payment-links/*`)
    console.log(`   Recurring Charges:    http://localhost:${port}/api/recurring-charges/*`)
    console.log(`   Customers:            http://localhost:${port}/api/customers/*`)
    console.log(`   Withdrawals:          http://localhost:${port}/api/withdrawals/*`)
    console.log(`   Webhook Service:      http://localhost:${port}/api/webhooks/*`)
    console.log(`   OpenPix Webhook:      http://localhost:${port}/webhook/openpix`)
    console.log(`   OpenPix Logs:         http://localhost:${port}/api/openpix/logs`)
    console.log('\n📊 Services Status:')
    console.log(`   Auth:    http://localhost:${process.env.AUTH_SERVICE_PORT || 4001}/health`)
    console.log(`   Payment: http://localhost:${process.env.PAYMENT_SERVICE_PORT || 4002}/health`)
    console.log(`   Webhook: http://localhost:${process.env.WEBHOOK_SERVICE_PORT || 4003}/health`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()