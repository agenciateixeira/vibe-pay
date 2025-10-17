import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateWebhookBody {
  url: string
  events: string[]
  secret?: string
}

export async function createWebhook(
  request: FastifyRequest<{ Body: CreateWebhookBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { url, events, secret } = request.body
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    // Validar URL
    try {
      new URL(url)
    } catch {
      return reply.code(400).send({ error: 'Invalid URL' })
    }

    // Gerar secret se não fornecido
    const webhookSecret = secret || `whsec_${crypto.randomBytes(32).toString('hex')}`

    const { data: webhook, error: insertError } = await supabase
      .from('webhooks')
      .insert({
        url,
        events,
        secret: webhookSecret,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating webhook:', insertError)
      return reply.code(500).send({ error: 'Failed to create webhook' })
    }

    return reply.send({
      success: true,
      webhook
    })
  } catch (error: any) {
    console.error('Error creating webhook:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function listWebhooks(
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

    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false })

    if (webhooksError) {
      return reply.code(500).send({ error: 'Failed to fetch webhooks' })
    }

    return reply.send({
      success: true,
      webhooks
    })
  } catch (error: any) {
    console.error('Error listing webhooks:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function deleteWebhook(
  request: FastifyRequest<{ Params: { webhookId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { webhookId } = request.params
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { error: deleteError } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)

    if (deleteError) {
      return reply.code(500).send({ error: 'Failed to delete webhook' })
    }

    return reply.send({
      success: true,
      message: 'Webhook deleted'
    })
  } catch (error: any) {
    console.error('Error deleting webhook:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function testWebhook(
  request: FastifyRequest<{ Params: { webhookId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { webhookId } = request.params
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single()

    if (webhookError || !webhook) {
      return reply.code(404).send({ error: 'Webhook not found' })
    }

    const testPayload = {
      event: 'webhook.test',
      data: {
        webhook_id: webhook.id,
        test: true,
        timestamp: new Date().toISOString()
      }
    }

    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(testPayload))
      .digest('hex')

    // MUDANÇA AQUI: Usar try/catch no fetch
    let response
    let success = false
    let statusCode = 0
    let responseBody = ''

    try {
      response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'VibePay-Webhooks/1.0'
        },
        body: JSON.stringify(testPayload)
      })

      success = response.ok
      statusCode = response.status
      
      try {
        responseBody = await response.text()
      } catch (e) {
        responseBody = 'Failed to read response body'
      }
    } catch (error: any) {
      // Se der erro de conexão
      success = false
      statusCode = 0
      responseBody = error.message || 'Connection failed'
    }

    // Salvar log
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        event: 'webhook.test',
        payload: testPayload,
        status_code: statusCode,
        success,
        response_body: responseBody
      })

    return reply.send({
      success: true,
      test_result: {
        success,
        status_code: statusCode,
        message: success ? 'Webhook test successful' : `Webhook test failed: ${responseBody}`,
        response_preview: responseBody.slice(0, 200)
      }
    })
  } catch (error: any) {
    console.error('Error testing webhook:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getWebhookLogs(
  request: FastifyRequest<{ Params: { webhookId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { webhookId } = request.params
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: logs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (logsError) {
      return reply.code(500).send({ error: 'Failed to fetch logs' })
    }

    return reply.send({
      success: true,
      logs
    })
  } catch (error: any) {
    console.error('Error fetching webhook logs:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function retryWebhook(
  request: FastifyRequest<{ Params: { logId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { logId } = request.params
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: log, error: logError } = await supabase
      .from('webhook_logs')
      .select('*, webhooks(*)')
      .eq('id', logId)
      .single()

    if (logError || !log) {
      return reply.code(404).send({ error: 'Log not found' })
    }

    const webhook = log.webhooks

    // Criar assinatura HMAC
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(log.payload))
      .digest('hex')

    // Reenviar webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'VibePay-Webhooks/1.0'
      },
      body: JSON.stringify(log.payload)
    })

    const success = response.ok
    const statusCode = response.status

    // Criar novo log
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_id: webhook.id,
        event: log.event,
        payload: log.payload,
        status_code: statusCode,
        success,
        response_body: await response.text().catch(() => null),
        retry_of: logId
      })

    return reply.send({
      success: true,
      retry_result: {
        success,
        status_code: statusCode,
        message: success ? 'Webhook retried successfully' : 'Webhook retry failed'
      }
    })
  } catch (error: any) {
    console.error('Error retrying webhook:', error)
    return reply.code(500).send({ error: error.message })
  }
}