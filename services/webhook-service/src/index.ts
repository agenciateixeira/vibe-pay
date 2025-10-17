import { config } from 'dotenv'
config()

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { 
  createWebhook, 
  listWebhooks, 
  deleteWebhook, 
  testWebhook, 
  getWebhookLogs,
  retryWebhook 
} from './controllers/webhooks.controller.js'
import {
  handleOpenPixWebhook,
  getWebhookLogs as getOpenPixLogs
} from './controllers/openpix-webhook.controller.js'

const server = Fastify({ logger: true })

await server.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://vibep.com.br',
    'https://www.vibep.com.br',
    'https://app.vibep.com.br',
    'https://dashboard.vibep.com.br',
    'https://dashboard-nine-phi-98.vercel.app',
    'https://dashboard-69k7w3qll-guilhermes-projects-2870101b.vercel.app',
    'https://vibe-payapi-gateway-production.up.railway.app',
  ],
  credentials: true
})

server.get('/health', async () => {
  return { status: 'ok', service: 'vibe-pay-webhook-service' }
})

// ===== WEBHOOK MANAGEMENT ROUTES =====
server.post('/webhooks/create', createWebhook)
server.get('/webhooks', listWebhooks)
server.delete('/webhooks/:webhookId', deleteWebhook)

// Test webhook - sem body parser
server.post('/webhooks/:webhookId/test', {
  config: {
    rawBody: true
  }
}, testWebhook)

server.get('/webhooks/:webhookId/logs', getWebhookLogs)

// Retry webhook - sem body parser
server.post('/webhooks/logs/:logId/retry', {
  config: {
    rawBody: true
  }
}, retryWebhook)

// ===== OPENPIX WEBHOOK =====
server.post('/openpix/webhook', handleOpenPixWebhook)
server.get('/openpix/logs', getOpenPixLogs)

const start = async () => {
  try {
    const port = Number(process.env.WEBHOOK_SERVICE_PORT) || 4003
    await server.listen({ port, host: '0.0.0.0' })
    
    console.log('\n🔔 Vibe Pay Webhook Service')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📍 http://localhost:${port}`)
    console.log('\n📋 Endpoints disponíveis:')
    console.log('\n🪝 Webhook Management:')
    console.log('  POST   /webhooks/create - Criar webhook')
    console.log('  GET    /webhooks - Listar webhooks')
    console.log('  DELETE /webhooks/:id - Deletar webhook')
    console.log('  POST   /webhooks/:id/test - Testar webhook')
    console.log('  GET    /webhooks/:id/logs - Ver logs do webhook')
    console.log('  POST   /webhooks/logs/:id/retry - Reenviar webhook')
    console.log('\n💳 OpenPix Webhook:')
    console.log('  POST /openpix/webhook - Receber webhooks da OpenPix')
    console.log('  GET  /openpix/logs - Ver logs de webhooks da OpenPix')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()