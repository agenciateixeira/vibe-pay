import { config } from 'dotenv'
config()

import Fastify from 'fastify'
import cors from '@fastify/cors'
import {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  logout,
  forgotPassword
} from './controllers/auth.controller.js'
import {
  createApiKey,
  listApiKeys,
  deleteApiKey
} from './controllers/api-keys.controller.js'
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  getDocumentUrl,
  checkCanWithdraw
} from './controllers/documents.controller.js'
import {
  enable2FA,
  verify2FA,
  disable2FA,
  check2FAStatus
} from './controllers/two-factor.controller.js'

const server = Fastify({ logger: true })

await server.register(cors, { origin: true })

server.get('/health', async () => {
  return { status: 'ok', service: 'vibe-pay-auth-service' }
})

// ===== AUTH ROUTES =====
server.post('/auth/login', login)
server.post('/auth/register', register)
server.get('/auth/profile', getProfile)
server.put('/auth/profile/update', updateProfile)
server.post('/auth/change-password', changePassword)
server.delete('/auth/delete-account', deleteAccount)
server.post('/auth/logout', logout)
server.post('/auth/forgot-password', forgotPassword)

// ===== API KEYS =====
server.post('/keys/create', createApiKey)
server.get('/keys', listApiKeys)
server.delete('/keys/:keyId', deleteApiKey)

// ===== DOCUMENTS =====
server.post('/documents/upload', uploadDocument)
server.get('/documents', listDocuments)
server.delete('/documents/:documentId', deleteDocument)
server.get('/documents/:documentId/url', getDocumentUrl)
server.get('/documents/check-withdraw', checkCanWithdraw)

// ===== TWO FACTOR AUTHENTICATION =====
server.post('/2fa/enable', enable2FA)
server.post('/2fa/verify', verify2FA)
server.post('/2fa/disable', disable2FA)
server.get('/2fa/status', check2FAStatus)

const start = async () => {
  try {
    const port = Number(process.env.AUTH_SERVICE_PORT) || 4001
    await server.listen({ port, host: '0.0.0.0' })
    
    console.log('\n🔐 Vibe Pay Auth Service')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📍 http://localhost:${port}`)
    console.log('\n📋 Endpoints disponíveis:')
    console.log('\n🔑 Authentication:')
    console.log('  POST /auth/login - Login')
    console.log('  POST /auth/register - Registro')
    console.log('  GET  /auth/profile - Ver perfil')
    console.log('  PUT  /auth/profile/update - Atualizar perfil')
    console.log('  POST /auth/change-password - Mudar senha')
    console.log('  DELETE /auth/delete-account - Deletar conta')
    console.log('  POST /auth/logout - Logout')
    console.log('  POST /auth/forgot-password - Recuperar senha')
    console.log('\n🔑 API Keys:')
    console.log('  POST   /keys/create - Criar API key')
    console.log('  GET    /keys - Listar keys')
    console.log('  DELETE /keys/:id - Deletar key')
    console.log('\n📄 Documents:')
    console.log('  POST   /documents/upload - Upload documento')
    console.log('  GET    /documents - Listar documentos')
    console.log('  DELETE /documents/:id - Deletar documento')
    console.log('  GET    /documents/:id/url - Obter URL do documento')
    console.log('  GET    /documents/check-withdraw - Verificar se pode sacar')
    console.log('\n🔐 Two Factor Authentication:')
    console.log('  POST /2fa/enable - Ativar 2FA')
    console.log('  POST /2fa/verify - Verificar código 2FA')
    console.log('  POST /2fa/disable - Desativar 2FA')
    console.log('  GET  /2fa/status - Verificar status 2FA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()