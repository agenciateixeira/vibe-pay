'use client'

import { useState } from 'react'
import { CreditCard, User, Mail, Phone, FileText, DollarSign, Copy, Check, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToastContext } from '../layout'
import Image from 'next/image'

interface PaymentCreated {
  id: string
  bill_id: string
  amount: number
  description: string
  status: string
  payment_link: string
  qr_code: string
  qr_code_image: string
  expires_at: string
  customer: {
    name: string
    email: string
    phone: string
    taxID: string
  }
}

export default function PaymentsPage() {
  const toast = useToastContext()
  const [loading, setLoading] = useState(false)
  const [paymentCreated, setPaymentCreated] = useState<PaymentCreated | null>(null)
  const [copied, setCopied] = useState<'link' | 'qrcode' | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      taxID: ''
    }
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.createPayment({
        amount: parseFloat(formData.amount),
        description: formData.description,
        customer: formData.customer
      })

      setPaymentCreated(response.payment)
      toast.success('Cobrança criada com sucesso!', '✨ Sucesso')
      
      // Limpar formulário
      setFormData({
        amount: '',
        description: '',
        customer: {
          name: '',
          email: '',
          phone: '',
          taxID: ''
        }
      })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar cobrança', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string, type: 'link' | 'qrcode') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success('Copiado para a área de transferência!', 'Copiado')
    setTimeout(() => setCopied(null), 2000)
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Nova Cobrança PIX</h1>
        <p className="text-vibegray-dark mt-2">Crie links de pagamento instantâneo</p>
      </div>

      {paymentCreated ? (
        <Card className="border-2 border-vibeyellow shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-vibeblack">✨ Cobrança criada!</CardTitle>
            <CardDescription>Compartilhe o link ou QR Code com o cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Link de Pagamento */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-vibeblack">Link de Pagamento</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentCreated.payment_link}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={() => handleCopy(paymentCreated.payment_link, 'link')}
                  className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
                >
                  {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => window.open(paymentCreated.payment_link, '_blank')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-vibeblack">QR Code PIX</Label>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                {paymentCreated.qr_code_image ? (
                  <div className="flex flex-col items-center gap-4">
                    <Image
                      src={paymentCreated.qr_code_image}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                    <div className="w-full">
                      <div className="flex gap-2">
                        <code className="flex-1 bg-white p-3 rounded-lg text-xs font-mono break-all border border-gray-200">
                          {paymentCreated.qr_code}
                        </code>
                        <Button
                          onClick={() => handleCopy(paymentCreated.qr_code, 'qrcode')}
                          className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
                        >
                          {copied === 'qrcode' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">QR Code não disponível</p>
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-vibeblack">Detalhes da cobrança:</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Valor:</span> R$ {paymentCreated.amount.toFixed(2)}</p>
                <p><span className="font-semibold">Cliente:</span> {paymentCreated.customer.name}</p>
                <p><span className="font-semibold">Email:</span> {paymentCreated.customer.email}</p>
                {paymentCreated.description && (
                  <p><span className="font-semibold">Descrição:</span> {paymentCreated.description}</p>
                )}
              </div>
            </div>

            <Button
              onClick={() => setPaymentCreated(null)}
              variant="outline"
              className="w-full"
            >
              Criar nova cobrança
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">Dados da cobrança</CardTitle>
            <CardDescription>Preencha os dados para gerar o link de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Valor e Descrição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold text-vibeblack">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Valor (R$)
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value)
                      setFormData({ ...formData, amount: formatted })
                    }}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-vibeblack">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Descrição
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Ex: Serviço de consultoria"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-vibeblack border-b pb-2">Dados do Cliente</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-semibold text-vibeblack">
                    <User className="w-4 h-4 inline mr-1" />
                    Nome completo
                  </Label>
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="João da Silva"
                    value={formData.customer.name}
                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm font-semibold text-vibeblack">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="joao@email.com"
                      value={formData.customer.email}
                      onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-sm font-semibold text-vibeblack">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefone
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.customer.phone}
                      onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, phone: e.target.value } })}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerTaxID" className="text-sm font-semibold text-vibeblack">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    CPF/CNPJ
                  </Label>
                  <Input
                    id="customerTaxID"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.customer.taxID}
                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, taxID: e.target.value } })}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-12 text-lg"
              >
                {loading ? 'Criando...' : 'Criar link de pagamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}