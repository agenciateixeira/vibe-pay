import { createClient, SupabaseClient } from '@supabase/supabase-js'

export class TransactionService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async updateStatus(correlationId: string, status: string, paidAt?: Date) {
    console.log(`📝 Atualizando transação ${correlationId} para status: ${status}`)

    const updateData: any = {
      status: status.toLowerCase(),
      updated_at: new Date().toISOString()
    }

    if (paidAt) {
      updateData.paid_at = paidAt.toISOString()
    }

    const { data, error } = await this.supabase
      .from('transactions')
      .update(updateData)
      .eq('correlation_id', correlationId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar transação:', error.message)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('✅ Transação atualizada com sucesso!')
    return data
  }

  async findByCorrelationId(correlationId: string) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('correlation_id', correlationId)
      .single()

    if (error) {
      return null
    }

    return data
  }
}