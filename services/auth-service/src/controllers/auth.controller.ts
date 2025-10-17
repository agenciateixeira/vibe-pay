import { FastifyRequest, FastifyReply } from 'fastify'
import { SupabaseService } from '../services/supabase.service.js'

// Função helper para criar o serviço
function getSupabaseService() {
  return new SupabaseService()
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as any

    if (!body.email || !body.password) {
      reply.code(400)
      return { success: false, error: 'Email and password are required' }
    }

    if (body.password.length < 6) {
      reply.code(400)
      return { success: false, error: 'Password must be at least 6 characters' }
    }

    const supabaseService = getSupabaseService()
    const result = await supabaseService.signUp(body.email, body.password, {
      full_name: body.full_name || '',
      cpf_cnpj: body.cpf_cnpj || null,
      phone: body.phone || null,
      company_name: body.company_name || null
    })

    return {
      success: true,
      message: 'User registered successfully! Check your email to verify.',
      user: {
        id: result.user.id,
        email: result.user.email
      },
      session: result.session
    }
  } catch (error: any) {
    reply.code(400)
    return { success: false, error: error.message }
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as any

    if (!body.email || !body.password) {
      reply.code(400)
      return { success: false, error: 'Email and password are required' }
    }

    const supabaseService = getSupabaseService()
    const result = await supabaseService.signIn(body.email, body.password)

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: result.user.id,
        email: result.user.email
      },
      userData: result.userData,
      session: result.session
    }
  } catch (error: any) {
    reply.code(401)
    return { success: false, error: error.message }
  }
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      // Mesmo sem token, considerar logout bem-sucedido
      return {
        success: true,
        message: 'Logout successful'
      }
    }

    const supabaseService = getSupabaseService()
    
    try {
      await supabaseService.signOut(token)
    } catch (error) {
      // Ignorar erros de signOut (token pode já estar inválido)
      console.log('Erro ao fazer signOut (ignorado):', error)
    }

    return {
      success: true,
      message: 'Logout successful'
    }
  } catch (error: any) {
    // Sempre retornar sucesso no logout para não bloquear o usuário
    return {
      success: true,
      message: 'Logout successful'
    }
  }
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      reply.code(401)
      return { success: false, error: 'No token provided' }
    }

    const supabaseService = getSupabaseService()
    const result = await supabaseService.getUser(token)

    return {
      success: true,
      user: result.user,
      userData: result.userData
    }
  } catch (error: any) {
    reply.code(401)
    return { success: false, error: error.message }
  }
}

export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    const body = request.body as any

    if (!token) {
      reply.code(401)
      return { success: false, error: 'No token provided' }
    }

    const supabaseService = getSupabaseService()
    
    // Obter usuário atual
    const { user } = await supabaseService.getUser(token)
    
    // Atualizar dados na tabela users
    const supabase = supabaseService.getClient()
    const { error } = await supabase
      .from('users')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        cpf_cnpj: body.cpf_cnpj,
        company_name: body.company_name
      })
      .eq('auth_user_id', user.id)

    if (error) {
      reply.code(500)
      return { success: false, error: 'Failed to update profile' }
    }

    return {
      success: true,
      message: 'Profile updated successfully'
    }
  } catch (error: any) {
    reply.code(500)
    return { success: false, error: error.message }
  }
}

export async function changePassword(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    const body = request.body as any

    if (!token) {
      reply.code(401)
      return { success: false, error: 'No token provided' }
    }

    if (!body.new_password || body.new_password.length < 6) {
      reply.code(400)
      return { success: false, error: 'New password must be at least 6 characters' }
    }

    const supabaseService = getSupabaseService()
    const supabase = supabaseService.getClient()
    
    // Atualizar senha no Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: body.new_password
    })

    if (error) {
      reply.code(500)
      return { success: false, error: 'Failed to change password' }
    }

    return {
      success: true,
      message: 'Password changed successfully'
    }
  } catch (error: any) {
    reply.code(500)
    return { success: false, error: error.message }
  }
}

export async function deleteAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      reply.code(401)
      return { success: false, error: 'No token provided' }
    }

    const supabaseService = getSupabaseService()
    const { user } = await supabaseService.getUser(token)
    
    const supabase = supabaseService.getClient()
    
    // Deletar usuário (cascade deleta da tabela users automaticamente)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      reply.code(500)
      return { success: false, error: 'Failed to delete account' }
    }

    return {
      success: true,
      message: 'Account deleted successfully'
    }
  } catch (error: any) {
    reply.code(500)
    return { success: false, error: error.message }
  }
}

export async function forgotPassword(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as any

    if (!body.email) {
      reply.code(400)
      return { success: false, error: 'Email is required' }
    }

    const supabaseService = getSupabaseService()
    await supabaseService.resetPassword(body.email)

    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    }
  } catch (error: any) {
    reply.code(400)
    return { success: false, error: error.message }
  }
}

export async function refreshSession(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as any

    if (!body.refresh_token) {
      reply.code(400)
      return { success: false, error: 'Refresh token is required' }
    }

    const supabaseService = getSupabaseService()
    const result = await supabaseService.refreshToken(body.refresh_token)

    return {
      success: true,
      session: result.session
    }
  } catch (error: any) {
    reply.code(401)
    return { success: false, error: error.message }
  }
}