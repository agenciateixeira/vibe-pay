import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreatePaymentLinkBody {
  amount: number
  product_name: string
  description?: string
  return_url?: string
  completion_url?: string
}

export async function createPaymentLink(
  request: FastifyRequest<{ Body: CreatePaymentLinkBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const linkData = request.body

    console.log('🔗 Criando link de pagamento...', linkData)

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

    // Salvar no banco
    const { data: link, error: insertError } = await supabase
      .from('payment_links')
      .insert({
        user_id: userData.id,
        amount: linkData.amount,
        product_name: linkData.product_name,
        description: linkData.description,
        return_url: linkData.return_url,
        completion_url: linkData.completion_url,
        status: 'ACTIVE'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao criar link:', insertError)
      return reply.code(500).send({ error: 'Failed to create payment link' })
    }

    console.log('✅ Link criado:', link.id)

    const paymentLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${link.id}`

    return reply.send({
      success: true,
      payment_link: {
        id: link.id,
        link_id: link.id,
        bill_id: link.id,
        payment_link: paymentLinkUrl,
        amount: link.amount,
        product_name: link.product_name,
        description: link.description,
        status: link.status,
        created_at: link.created_at,
        expires_at: link.created_at
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar link:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getPaymentLinks(
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

    const { data: links, error: linksError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (linksError) {
      console.error('❌ Erro ao buscar links:', linksError)
      return reply.send({
        success: true,
        payment_links: []
      })
    }

    // Formatar os links para o formato esperado pelo frontend
    const formattedLinks = (links || []).map(link => ({
      id: link.id,
      bill_id: link.id,
      amount: link.amount,
      product_name: link.product_name,
      description: link.description || '',
      payment_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${link.id}`,
      status: link.status,
      created_at: link.created_at
    }))

    return reply.send({
      success: true,
      payment_links: formattedLinks
    })
  } catch (error: any) {
    console.error('❌ Erro ao listar links:', error)
    return reply.send({
      success: true,
      payment_links: []
    })
  }
}

export async function deletePaymentLink(
  request: FastifyRequest<{ Params: { linkId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { linkId } = request.params

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
      .from('payment_links')
      .delete()
      .eq('id', linkId)
      .eq('user_id', userData.id)

    if (deleteError) {
      console.error('❌ Erro ao deletar link:', deleteError)
      return reply.code(500).send({ error: 'Failed to delete link' })
    }

    console.log('✅ Link deletado:', linkId)

    return reply.send({
      success: true,
      message: 'Link deleted successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao deletar link:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getPublicPaymentLink(
  request: FastifyRequest<{ Params: { linkId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { linkId } = request.params

    console.log('🌐 Buscando link público:', linkId)

    const { data: link, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', linkId)
      .single()

    if (linkError || !link) {
      console.error('❌ Link não encontrado:', linkError)
      return reply.code(404).send({ error: 'Link not found' })
    }

    return reply.send({
      success: true,
      link: {
        id: link.id,
        amount: link.amount,
        product_name: link.product_name,
        description: link.description,
        status: link.status
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar link público:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function generatePixForLink(
  request: FastifyRequest<{ 
    Params: { linkId: string }
    Body: {
      customer: {
        name: string
        email: string
        phone: string
        taxID: string
      }
    }
  }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { linkId } = request.params
    const { customer } = request.body

    console.log('💳 Gerando PIX para link:', linkId)

    // Buscar link
    const { data: link, error: linkError } = await supabase
      .from('payment_links')
      .select('*')
      .eq('id', linkId)
      .single()

    if (linkError || !link) {
      return reply.code(404).send({ error: 'Link not found' })
    }

    // Criar cobrança via OpenPix
    const openPixResponse = await fetch(`${process.env.OPENPIX_API_URL}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Authorization': process.env.OPENPIX_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correlationID: `link_${linkId}_${Date.now()}`,
        value: Math.round(link.amount * 100),
        comment: link.description || link.product_name,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          taxID: customer.taxID.replace(/\D/g, '')
        }
      })
    })

    const openPixData = await openPixResponse.json()

    if (!openPixResponse.ok) {
      console.error('❌ Erro OpenPix:', openPixData)
      return reply.code(500).send({ error: 'Failed to generate PIX' })
    }

    const charge = openPixData.charge

    console.log('✅ PIX gerado:', charge.correlationID)

    // Salvar pagamento na tabela payments para rastreamento do webhook
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: link.user_id,
        correlation_id: charge.correlationID,
        txid: charge.correlationID,
        amount: link.amount,
        description: link.description || link.product_name,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_tax_id: customer.taxID,
        pix_key: charge.brCode,
        qr_code_url: charge.qrCodeImage,
        status: 'ACTIVE',
        expires_at: charge.expiresDate
      })

    if (paymentError) {
      console.error('⚠️ Erro ao salvar payment (não crítico):', paymentError)
    }

    return reply.send({
      success: true,
      charge: {
        correlationID: charge.correlationID,
        brCode: charge.brCode,
        qrCodeImage: charge.qrCodeImage,
        expiresDate: charge.expiresDate,
        value: link.amount
      }
    })
  } catch (error: any) {
    console.error('❌ Erro ao gerar PIX:', error)
    return reply.code(500).send({ error: error.message })
  }
}