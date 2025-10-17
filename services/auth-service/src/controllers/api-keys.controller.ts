import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateKeyBody {
  name: string
  environment: string
}

export async function createApiKey(
  request: FastifyRequest<{ Body: CreateKeyBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { name, environment } = request.body
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

    // Gerar chave aleatória
    const randomBytes = crypto.randomBytes(32).toString('hex')
    const prefix = environment === 'production' ? 'sk_prod_' : 'sk_test_'
    const fullKey = `${prefix}${randomBytes}`
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex')
    
    // Inserir no banco
    const { data: apiKeyData, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: userData.id,
        name,
        key_hash: keyHash,
        key_prefix: fullKey.slice(0, 20),
        environment,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar API key:', insertError)
      return reply.code(500).send({ error: 'Failed to create API key' })
    }

    // CORRIGIDO: Retornar a chave completa no formato correto
    return reply.send({
      success: true,
      key: fullKey,  // Chave completa aqui!
      api_key: {
        id: apiKeyData.id,
        name: apiKeyData.name,
        key_prefix: apiKeyData.key_prefix,
        environment: apiKeyData.environment,
        is_active: apiKeyData.is_active,
        created_at: apiKeyData.created_at
      }
    })
  } catch (error: any) {
    console.error('Error creating API key:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function listApiKeys(
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

    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (keysError) {
      return reply.code(500).send({ error: 'Failed to fetch API keys' })
    }

    return reply.send({
      success: true,
      api_keys: apiKeys  // CORRIGIDO: snake_case para consistência
    })
  } catch (error: any) {
    console.error('Error listing API keys:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function deleteApiKey(
  request: FastifyRequest<{ Params: { keyId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { keyId } = request.params
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

    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userData.id)

    if (deleteError) {
      return reply.code(500).send({ error: 'Failed to delete API key' })
    }

    return reply.send({
      success: true,
      message: 'API key deleted'
    })
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return reply.code(500).send({ error: error.message })
  }
}