import { createClient, SupabaseClient } from '@supabase/supabase-js'

export class SupabaseService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  // Método público para acessar o cliente Supabase
  getClient() {
    return this.supabase
  }

  // ===== AUTH METHODS =====

  async signUp(email: string, password: string, userData: {
    full_name: string
    cpf_cnpj: string | null
    phone: string | null
    company_name: string | null
  }) {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // 2. Criar registro na tabela users
    const { data: userRecord, error: userError } = await this.supabase
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email: email,
        full_name: userData.full_name,
        cpf_cnpj: userData.cpf_cnpj,
        phone: userData.phone,
        company_name: userData.company_name,
        balance: 0,
        total_received: 0
      })
      .select()
      .single()

    if (userError) {
      // Se falhar ao criar o registro, deletar o usuário do auth
      await this.supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(userError.message)
    }

    return {
      user: authData.user,
      session: authData.session,
      userData: userRecord
    }
  }

  async signIn(email: string, password: string) {
    // 1. Fazer login no Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Login failed')
    }

    // 2. Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (userError) {
      throw new Error('User data not found')
    }

    return {
      user: authData.user,
      session: authData.session,
      userData: userData
    }
  }

  async signOut(token: string) {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.log('Erro no signOut do Supabase:', error.message)
        // Não lançar erro, apenas logar
      }

      return { success: true }
    } catch (error: any) {
      console.log('Erro ao fazer signOut:', error.message)
      // Não lançar erro, apenas retornar sucesso
      return { success: true }
    }
  }

  async getUser(token: string) {
    // 1. Validar token e obter usuário
    const { data: { user }, error: authError } = await this.supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // 2. Buscar dados do usuário na tabela users
    const { data: userData, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (userError) {
      throw new Error('User data not found')
    }

    return {
      user: user,
      userData: userData
    }
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  async updatePassword(token: string, newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      session: data.session
    }
  }

  async verifyEmail(token: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      user: data.user,
      session: data.session
    }
  }

  // ===== USER METHODS =====

  async updateUser(authUserId: string, updates: {
    full_name?: string
    cpf_cnpj?: string
    phone?: string
    company_name?: string
  }) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('auth_user_id', authUserId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async deleteUser(authUserId: string) {
    // 1. Deletar usuário da tabela users (cascade)
    const { error: deleteError } = await this.supabase
      .from('users')
      .delete()
      .eq('auth_user_id', authUserId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    // 2. Deletar usuário do Supabase Auth
    const { error: authError } = await this.supabase.auth.admin.deleteUser(authUserId)

    if (authError) {
      throw new Error(authError.message)
    }

    return { success: true }
  }

  async getUserById(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async getUserByAuthId(authUserId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // ===== BALANCE METHODS =====

  async updateBalance(userId: string, amount: number, operation: 'add' | 'subtract') {
    const { data: user } = await this.supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const currentBalance = parseFloat(user.balance || '0')
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount

    if (newBalance < 0) {
      throw new Error('Insufficient balance')
    }

    const { data, error } = await this.supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async getBalance(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return parseFloat(data.balance || '0')
  }

  // ===== ADMIN METHODS =====

  async listUsers(limit: number = 50, offset: number = 0) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async countUsers() {
    const { count, error } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(error.message)
    }

    return count || 0
  }

  async searchUsers(query: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // ===== UTILITY METHODS =====

  async healthCheck() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1)

      if (error) {
        return { status: 'error', message: error.message }
      }

      return { status: 'ok', message: 'Database connection successful' }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }
}