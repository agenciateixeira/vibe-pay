import { FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface UpdateProfileBody {
  full_name?: string
  phone?: string
  cpf_cnpj?: string
  company_name?: string
}

interface ChangePasswordBody {
  current_password: string
  new_password: string
}

export async function updateProfile(
  request: FastifyRequest<{ Body: UpdateProfileBody }>,
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

    const updateData: any = {}
    if (request.body.full_name) updateData.full_name = request.body.full_name
    if (request.body.phone) updateData.phone = request.body.phone
    if (request.body.cpf_cnpj) updateData.cpf_cnpj = request.body.cpf_cnpj
    if (request.body.company_name) updateData.company_name = request.body.company_name

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userData.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return reply.code(500).send({ error: 'Failed to update profile' })
    }

    return reply.send({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function changePassword(
  request: FastifyRequest<{ Body: ChangePasswordBody }>,
  reply: FastifyReply
) {
  try {
    const supabase = getSupabaseClient()
    const { current_password, new_password } = request.body
    const authHeader = request.headers.authorization
    
    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    // Verificar senha atual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: current_password
    })

    if (signInError) {
      return reply.code(400).send({ error: 'Current password is incorrect' })
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    })

    if (updateError) {
      console.error('Error changing password:', updateError)
      return reply.code(500).send({ error: 'Failed to change password' })
    }

    return reply.send({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error: any) {
    console.error('Error changing password:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function deleteAccount(
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

    // Desativar conta (não deletar)
    const { error: updateError } = await supabase
      .from('users')
      .update({ status: 'inactive' })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Error deactivating account:', updateError)
      return reply.code(500).send({ error: 'Failed to deactivate account' })
    }

    return reply.send({
      success: true,
      message: 'Account deactivated successfully'
    })
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return reply.code(500).send({ error: error.message })
  }
}