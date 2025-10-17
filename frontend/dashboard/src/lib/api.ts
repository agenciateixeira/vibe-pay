const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  cpf_cnpj: string
  phone: string
  company_name: string
}

export interface UpdateProfileData {
  full_name?: string
  phone?: string
  cpf_cnpj?: string
  company_name?: string
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed')
    }

    return data
  }

  // ===== AUTH =====
  async login(credentials: LoginCredentials) {
    const response = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.session?.access_token) {
      this.setToken(response.session.access_token)
    }

    return response
  }

  async register(data: RegisterData) {
    const response = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (response.session?.access_token) {
      this.setToken(response.session.access_token)
    }

    return response
  }

  async getProfile() {
    return this.request<any>('/api/auth/profile')
  }

  async updateProfile(data: UpdateProfileData) {
    return this.request<any>('/api/auth/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: ChangePasswordData) {
    return this.request<any>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteAccount() {
    return this.request<any>('/api/auth/delete-account', {
      method: 'DELETE',
    })
  }

  async logout() {
    try {
      await this.request<any>('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignorar erro de logout
      console.log('Erro ao fazer logout (ignorado):', error)
    } finally {
      // Sempre limpar token
      this.clearToken()
    }
  }

  async forgotPassword(email: string) {
    return this.request<any>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // ===== PAYMENTS =====
  async createPayment(data: {
    amount: number
    description: string
    customer: {
      name: string
      email: string
      phone: string
      taxID: string
    }
  }) {
    return this.request<any>('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPayments() {
    return this.request<any>('/api/payments')
  }

  async getPayment(correlationId: string) {
    return this.request<any>(`/api/payments/${correlationId}`)
  }

  async getPublicPayment(billId: string) {
    const response = await fetch(`${this.baseUrl}/api/payments/public/${billId}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch payment')
    }
    
    return data
  }

  // ===== API KEYS =====
  async createApiKey(data: { name: string; environment: string }) {
    return this.request<any>('/api/keys/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getApiKeys() {
    return this.request<any>('/api/keys')
  }

  async deleteApiKey(keyId: string) {
    return this.request<any>(`/api/keys/${keyId}`, {
      method: 'DELETE',
    })
  }

  // ===== WEBHOOKS =====
  async createWebhook(data: { url: string; events: string[]; secret?: string }) {
    return this.request<any>('/api/webhooks/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getWebhooks() {
    return this.request<any>('/api/webhooks')
  }

  async deleteWebhook(webhookId: string) {
    return this.request<any>(`/api/webhooks/${webhookId}`, {
      method: 'DELETE',
    })
  }

  async testWebhook(webhookId: string) {
    return this.request<any>(`/api/webhooks/${webhookId}/test`, {
      method: 'POST',
      body: JSON.stringify({})
    })
  }

  async getWebhookLogs(webhookId: string) {
    return this.request<any>(`/api/webhooks/${webhookId}/logs`)
  }

  async retryWebhook(logId: string) {
    return this.request<any>(`/api/webhooks/logs/${logId}/retry`, {
      method: 'POST',
      body: JSON.stringify({})
    })
  }

  // ===== PAYMENT LINKS =====
  async createPaymentLink(data: {
    amount: number
    product_name: string
    description?: string
    return_url?: string
    completion_url?: string
  }) {
    return this.request<any>('/api/payment-links/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPaymentLinks() {
    return this.request<any>('/api/payment-links')
  }

  async deletePaymentLink(linkId: string) {
    return this.request<any>(`/api/payment-links/${linkId}`, {
      method: 'DELETE',
    })
  }

  async generatePix(linkId: string, customerData: {
    name: string
    email: string
    phone: string
    taxID: string
  }) {
    const response = await fetch(`${this.baseUrl}/api/payment-links/${linkId}/generate-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer: customerData }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate PIX')
    }
    
    return data
  }

  async getPublicLink(linkId: string) {
    const response = await fetch(`${this.baseUrl}/api/payment-links/public/${linkId}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch link')
    }
    
    return data
  }

  // ===== RECURRING CHARGES =====
  async createRecurringCharge(data: {
    amount: number
    description: string
    frequency: 'weekly' | 'monthly' | 'semiannual' | 'annual'
    customer: {
      name: string
      email: string
      phone: string
      taxID: string
    }
  }) {
    return this.request<any>('/api/recurring-charges/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getRecurringCharges() {
    return this.request<any>('/api/recurring-charges')
  }

  async updateRecurringChargeStatus(chargeId: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') {
    return this.request<any>(`/api/recurring-charges/${chargeId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async getChargeHistory(chargeId: string) {
    return this.request<any>(`/api/recurring-charges/${chargeId}/history`)
  }

  // ===== CUSTOMERS =====
  async getCustomers() {
    return this.request<any>('/api/customers')
  }

  async getCustomerStats(email: string) {
    return this.request<any>(`/api/customers/${encodeURIComponent(email)}/stats`)
  }

  // ===== WITHDRAWALS =====
  async createWithdrawal(data: {
    amount: number
    pix_key: string
    pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  }) {
    return this.request<any>('/api/withdrawals/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getWithdrawals() {
    return this.request<any>('/api/withdrawals')
  }

  async getBalance() {
    return this.request<any>('/api/withdrawals/balance')
  }

  async cancelWithdrawal(withdrawalId: string) {
    return this.request<any>(`/api/withdrawals/${withdrawalId}`, {
      method: 'DELETE',
    })
  }

  // ===== DOCUMENTS =====
  async uploadDocument(data: {
    document_type: 'cnpj' | 'contrato_social' | 'rg' | 'cnh' | 'passport' | 'comprovante_residencia'
    file_name: string
    file_data: string
    mime_type: string
  }) {
    return this.request<any>('/api/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getDocuments() {
    return this.request<any>('/api/documents')
  }

  async deleteDocument(documentId: string) {
    return this.request<any>(`/api/documents/${documentId}`, {
      method: 'DELETE',
    })
  }

  async getDocumentUrl(documentId: string) {
    return this.request<any>(`/api/documents/${documentId}/url`)
  }

  async checkCanWithdraw() {
    return this.request<any>('/api/documents/check-withdraw')
  }

  // ===== TWO FACTOR AUTHENTICATION =====
  async enable2FA() {
    return this.request<any>('/api/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }

  async verify2FA(token: string) {
    return this.request<any>('/api/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async disable2FA(token: string) {
    return this.request<any>('/api/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async check2FAStatus() {
    return this.request<any>('/api/2fa/status')
  }

  // ===== PRODUCTS =====
  async createProduct(data: {
    name: string
    description?: string
    amount: number
    frequency?: 'weekly' | 'monthly' | 'semiannual' | 'annual' | 'one-time'
    active?: boolean
  }) {
    return this.request<any>('/api/products/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProducts() {
    return this.request<any>('/api/products')
  }

  async updateProduct(productId: string, data: {
    name?: string
    description?: string
    amount?: number
    frequency?: 'weekly' | 'monthly' | 'semiannual' | 'annual' | 'one-time'
    active?: boolean
  }) {
    return this.request<any>(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(productId: string) {
    return this.request<any>(`/api/products/${productId}`, {
      method: 'DELETE',
    })
  }

  // ===== TRANSACTIONS =====
  async getTransactions() {
    return this.request<any>('/api/transactions')
  }
}

export const api = new ApiClient(API_URL)