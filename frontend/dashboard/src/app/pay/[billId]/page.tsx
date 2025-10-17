'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { QrCode, Copy, Check, CreditCard, AlertCircle, Clock, Building2, Mail, Phone, FileText, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PaymentLink {
  id: string
  bill_id: string
  amount: number
  product_name: string
  description: string
  company_name: string
  status: string
  qr_code?: string
  qr_code_image?: string
  expires_at: string
}

interface PixData {
  qr_code: string
  qr_code_image: string
  amount: number
  expires_in_hours: number
}

// Função para detectar se é link ou cobrança recorrente
const detectType = (billId: string): 'link' | 'charge' => {
  if (billId.startsWith('charge_')) {
    return 'charge'
  }
  return 'link'
}

export default function CheckoutPage() {
  const params = useParams()
  const billId = params.billId as string
  const [link, setLink] = useState<PaymentLink | null>(null)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    taxID: ''
  })

  useEffect(() => {
    loadLink()
  }, [billId])

  useEffect(() => {
    if (!link) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const expires = new Date(link.expires_at)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expirado')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [link])

  const loadLink = async () => {
    try {
      const type = detectType(billId)
      
      if (type === 'charge') {
        // Buscar cobrança recorrente
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/recurring-charges/public/${billId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Charge not found')
        }
        
        // Adaptar formato de cobrança para link
        setLink({
          id: data.charge.id,
          bill_id: data.charge.bill_id,
          amount: data.charge.amount,
          product_name: data.charge.description || 'Cobrança Recorrente',
          description: `Cobrança ${data.charge.frequency === 'monthly' ? 'Mensal' : data.charge.frequency === 'weekly' ? 'Semanal' : data.charge.frequency === 'annual' ? 'Anual' : 'Semestral'}`,
          company_name: data.charge.company_name,
          status: data.charge.status,
          qr_code: data.charge.qr_code,
          qr_code_image: data.charge.qr_code_image,
          expires_at: data.charge.next_billing_date
        })
        
        if (data.charge.qr_code) {
          setPixData({
            qr_code: data.charge.qr_code,
            qr_code_image: data.charge.qr_code_image,
            amount: data.charge.amount,
            expires_in_hours: 24
          })
        }
      } else {
        // Buscar payment link normal
        const response = await api.getPublicLink(billId)
        setLink(response.link)
        
        if (response.link.qr_code) {
          setPixData({
            qr_code: response.link.qr_code,
            qr_code_image: response.link.qr_code_image,
            amount: response.link.amount,
            expires_in_hours: 24
          })
        }
      }
    } catch (error: any) {
      setError(error.message || 'Link não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const formatCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
  }

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setError(null)

    try {
      const type = detectType(billId)
      
      if (type === 'charge') {
        // Gerar PIX para cobrança recorrente
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/recurring-charges/${billId}/generate-pix`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone.replace(/\D/g, ''),
              taxID: formData.taxID.replace(/\D/g, '')
            }
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate PIX')
        }
        
        setPixData(data.pix)
      } else {
        // Gerar PIX para payment link normal
        const response = await api.generatePix(billId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          taxID: formData.taxID.replace(/\D/g, '')
        })
        
        setPixData(response.pix)
      }
      
      await loadLink()
    } catch (error: any) {
      setError(error.message || 'Erro ao gerar PIX')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!pixData?.qr_code) return
    
    await navigator.clipboard.writeText(pixData.qr_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="max-w-md w-full border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-vibeblack mb-2">Link inválido</h2>
              <p className="text-vibegray-dark">{error || 'Este link de pagamento não existe ou expirou.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (link.status === 'PAID') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <Card className="max-w-md w-full border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-vibeblack mb-2">Pagamento confirmado!</h2>
              <p className="text-vibegray-dark">Este link já foi pago com sucesso.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-vibeyellow rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image src="/logo.png" alt="Vibe Pay" width={48} height={48} />
          </div>
          <h1 className="text-3xl font-black text-vibeblack mb-2">{link.company_name}</h1>
          <p className="text-vibegray-dark">Checkout seguro</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {!pixData ? (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-vibeblack">Dados de pagamento</CardTitle>
                  <CardDescription>Preencha seus dados para gerar o PIX</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGeneratePix} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Nome completo *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="João da Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxID">
                        <FileText className="w-4 h-4 inline mr-1" />
                        CPF/CNPJ *
                      </Label>
                      <Input
                        id="taxID"
                        type="text"
                        placeholder="000.000.000-00"
                        value={formData.taxID}
                        onChange={(e) => setFormData({ ...formData, taxID: formatCPFCNPJ(e.target.value) })}
                        required
                        className="h-11"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={generating}
                      className="w-full bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-12 text-lg"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando PIX...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Gerar PIX
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-vibeblack">
                    <QrCode className="w-6 h-6 inline mr-2" />
                    PIX Gerado!
                  </CardTitle>
                  <CardDescription>Escaneie o QR Code ou copie o código</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                    {pixData.qr_code_image ? (
                      <img 
                        src={pixData.qr_code_image} 
                        alt="QR Code PIX" 
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-vibeblack">PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input
                        value={pixData.qr_code}
                        readOnly
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        onClick={handleCopy}
                        className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Clock className="w-5 h-5 inline mr-2 text-blue-600" />
                    <span className="font-bold text-vibeblack">{timeLeft}</span>
                    <p className="text-sm text-vibegray-dark mt-1">para pagar</p>
                  </div>

                  <div className="text-center text-sm text-vibegray-dark">
                    Após o pagamento, você receberá a confirmação por email
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="border-0 shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-vibeblack">Resumo do pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-vibeblack">{link.product_name}</h3>
                      {link.description && (
                        <p className="text-sm text-vibegray-dark">{link.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-vibegray-dark">Total a pagar</span>
                      <span className="text-3xl font-black text-vibeblack">
                        R$ {link.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-bold text-green-900 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Pagamento seguro
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ PIX instantâneo</li>
                    <li>✓ Confirmação automática</li>
                    <li>✓ Dados criptografados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}