export interface CreateChargeInput {
  amount: number
  description: string
  customer: {
    name: string
    email: string
    phone: string
    taxID: string
  }
  metadata?: Record<string, any>
}

export interface Charge {
  correlationID: string
  value: number
  status: string
  brCode: string
  qrCodeUrl: string
  paymentLinkUrl: string
  expiresAt: string
}

export class OpenPixService {
  private apiUrl = 'https://api.openpix.com.br'
  private appId = process.env.OPENPIX_APP_ID!

  async createCharge(input: CreateChargeInput): Promise<Charge> {
    const correlationID = `vibe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const response = await fetch(`${this.apiUrl}/api/v1/charge`, {
      method: 'POST',
      headers: {
        'Authorization': this.appId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value: Math.round(input.amount * 100),
        correlationID,
        comment: input.description,
        customer: input.customer,
        metadata: input.metadata
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenPix error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    
    return {
      correlationID: data.charge.correlationID,
      value: data.charge.value,
      status: data.charge.status,
      brCode: data.charge.brCode,
      qrCodeUrl: data.charge.qrCodeImage || '',
      paymentLinkUrl: data.charge.paymentLinkUrl,
      expiresAt: data.charge.expiresDate
    }
  }

  async getCharge(correlationID: string): Promise<Charge | null> {
    const response = await fetch(
      `${this.apiUrl}/api/v1/charge?correlationID=${correlationID}`,
      {
        headers: {
          'Authorization': this.appId
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (!data.charge) {
      return null
    }

    return {
      correlationID: data.charge.correlationID,
      value: data.charge.value,
      status: data.charge.status,
      brCode: data.charge.brCode,
      qrCodeUrl: data.charge.qrCodeImage || '',
      paymentLinkUrl: data.charge.paymentLinkUrl,
      expiresAt: data.charge.expiresDate
    }
  }
}