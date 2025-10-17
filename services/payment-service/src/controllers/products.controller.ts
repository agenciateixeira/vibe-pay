import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateProductBody {
  name: string
  description?: string
  amount: number
  frequency?: 'weekly' | 'monthly' | 'semiannual' | 'annual' | 'one-time'
  active: boolean
}

export async function createProduct(
  request: FastifyRequest<{ Body: CreateProductBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const productData = request.body

    console.log('📦 Criando produto...', productData)

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
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        user_id: userData.id,
        name: productData.name,
        description: productData.description,
        amount: productData.amount,
        frequency: productData.frequency || 'one-time',
        active: productData.active !== undefined ? productData.active : true
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao criar produto:', insertError)
      return reply.code(500).send({ error: 'Failed to create product' })
    }

    console.log('✅ Produto criado:', product.id)

    return reply.send({
      success: true,
      product
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar produto:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getProducts(
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

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError)
      return reply.send({
        success: true,
        products: []
      })
    }

    return reply.send({
      success: true,
      products: products || []
    })
  } catch (error: any) {
    console.error('❌ Erro ao listar produtos:', error)
    return reply.send({
      success: true,
      products: []
    })
  }
}

export async function updateProduct(
  request: FastifyRequest<{
    Params: { productId: string }
    Body: Partial<CreateProductBody>
  }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { productId } = request.params
    const updateData = request.body

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

    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .eq('user_id', userData.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar produto:', updateError)
      return reply.code(500).send({ error: 'Failed to update product' })
    }

    console.log('✅ Produto atualizado:', productId)

    return reply.send({
      success: true,
      product
    })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar produto:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function deleteProduct(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.authorization
    const { productId } = request.params

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
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', userData.id)

    if (deleteError) {
      console.error('❌ Erro ao deletar produto:', deleteError)
      return reply.code(500).send({ error: 'Failed to delete product' })
    }

    console.log('✅ Produto deletado:', productId)

    return reply.send({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao deletar produto:', error)
    return reply.code(500).send({ error: error.message })
  }
}
