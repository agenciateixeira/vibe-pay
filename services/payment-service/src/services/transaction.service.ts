import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface Transaction {
  id?: string
  user_id?: string
  store_id?: string
  openpix_transaction_id: string
  correlation_id: string
  amount: number
  fee: number
  net_amount: number
  status: 'pending' | 'completed' | 'failed' | 'expired'
  payer_name: string
  payer_document: string
  payer_email: string
  payer_phone: string
  qr_code_url: string
  qr_code_text: string
  description: string
  metadata?: any
  created_at?: string
  updated_at?: string
  paid_at?: string
}

export class TransactionService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async create(transaction: Transaction) {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        openpix_transaction_id: transaction.openpix_transaction_id,
        correlation_id: transaction.correlation_id,
        amount: transaction.amount,
        fee: transaction.fee,
        net_amount: transaction.net_amount,
        status: transaction.status,
        type: 'pix_in',
        payer_name: transaction.payer_name,
        payer_document: transaction.payer_document,
        payer_email: transaction.payer_email,
        payer_phone: transaction.payer_phone,
        qr_code_url: transaction.qr_code_url,
        qr_code_text: transaction.qr_code_text,
        description: transaction.description,
        metadata: transaction.metadata || {}
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

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

  async updateStatus(correlationId: string, status: string, paidAt?: Date) {
    const updateData: any = { status, updated_at: new Date().toISOString() }
    
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
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  }

  async list(userId?: string, limit = 20) {
    let query = this.supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  }
}