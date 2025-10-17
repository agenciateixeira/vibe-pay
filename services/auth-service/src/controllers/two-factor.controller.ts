import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function enable2FA(
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
      .select('id, email, full_name')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    // Gerar secret
    const secret = speakeasy.generateSecret({
      name: `Vibe Pay (${userData.email})`,
      issuer: 'Vibe Pay'
    })

    // Gerar QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Salvar secret (ainda não ativado)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret.base32
      })
      .eq('id', userData.id)

    if (updateError) {
      return reply.code(500).send({ error: 'Failed to save secret' })
    }

    return reply.send({
      success: true,
      secret: secret.base32,
      qr_code: qrCodeUrl,
      manual_entry_key: secret.base32
    })
  } catch (error: any) {
    console.error('❌ Erro ao ativar 2FA:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function verify2FA(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { token: userToken } = request.body

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const authToken = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, two_factor_secret')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData || !userData.two_factor_secret) {
      return reply.code(404).send({ error: 'Secret not found' })
    }

    // Verificar token
    const verified = speakeasy.totp.verify({
      secret: userData.two_factor_secret,
      encoding: 'base32',
      token: userToken,
      window: 2
    })

    if (!verified) {
      return reply.code(400).send({ error: 'Invalid token' })
    }

    // Ativar 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true
      })
      .eq('id', userData.id)

    if (updateError) {
      return reply.code(500).send({ error: 'Failed to enable 2FA' })
    }

    return reply.send({
      success: true,
      message: '2FA enabled successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao verificar 2FA:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function disable2FA(
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { token: userToken } = request.body

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const authToken = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, two_factor_secret')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData || !userData.two_factor_secret) {
      return reply.code(404).send({ error: 'Secret not found' })
    }

    // Verificar token antes de desativar
    const verified = speakeasy.totp.verify({
      secret: userData.two_factor_secret,
      encoding: 'base32',
      token: userToken,
      window: 2
    })

    if (!verified) {
      return reply.code(400).send({ error: 'Invalid token' })
    }

    // Desativar 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null
      })
      .eq('id', userData.id)

    if (updateError) {
      return reply.code(500).send({ error: 'Failed to disable 2FA' })
    }

    return reply.send({
      success: true,
      message: '2FA disabled successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao desativar 2FA:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function check2FAStatus(
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
      .select('two_factor_enabled')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    return reply.send({
      success: true,
      enabled: userData.two_factor_enabled || false
    })
  } catch (error: any) {
    console.error('❌ Erro ao verificar status 2FA:', error)
    return reply.code(500).send({ error: error.message })
  }
}