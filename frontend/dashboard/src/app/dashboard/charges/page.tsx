'use client'

import { useEffect, useState } from 'react'
import { Repeat, Plus, Pause, Play, XCircle, Eye, User, Mail, Phone, CreditCard, DollarSign, FileText, Calendar, AlertCircle, Copy, Check, ExternalLink, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToastContext } from '../layout'

interface RecurringCharge {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_taxid: string
  amount: number
  description: string
  frequency: 'weekly' | 'monthly' | 'semiannual' | 'annual'
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  next_billing_date: string
  payment_link?: string
  bill_id?: string
  last_billing_date: string | null
  created_at: string
}

interface RecurringChargeCreated {
  id: string
  amount: number
  description: string
  frequency: string
  status: string
  next_billing_date: string
  payment_link: string
  bill_id: string
  customer: {
    name: string
    email: string
    phone: string
    taxID: string
  }
}

interface ChargeHistoryItem {
  id: string
  bill_id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED'
  payment_link: string
  paid_at: string | null
  expires_at: string
  created_at: string
}

export default function ChargesPage() {
  const toast = useToastContext()
  const [charges, setCharges] = useState<RecurringCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [chargeCreated, setChargeCreated] = useState<RecurringChargeCreated | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedCharge, setSelectedCharge] = useState<RecurringCharge | null>(null)
  const [history, setHistory] = useState<ChargeHistoryItem[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'semiannual' | 'annual',
    customer: {
      name: '',
      email: '',
      phone: '',
      taxID: ''
    }
  })
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean
    type: 'pause' | 'resume' | 'cancel' | null
    chargeId: string | null
    chargeName: string
  }>({
    isOpen: false,
    type: null,
    chargeId: null,
    chargeName: ''
  })

  useEffect(() => {
    loadCharges()
  }, [])

  const loadCharges = async () => {
    try {
      const response = await api.getRecurringCharges()
      setCharges(response.recurring_charges || [])
    } catch (error) {
      console.error('Erro ao carregar cobranças:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const response = await api.createRecurringCharge({
        amount: parseFloat(formData.amount.replace(',', '.')),
        description: formData.description,
        frequency: formData.frequency,
        customer: formData.customer
      })

      setChargeCreated(response.recurring_charge)
      toast.success('Cobrança recorrente criada!', '✨ Sucesso')
      
      setFormData({
        amount: '',
        description: '',
        frequency: 'monthly',
        customer: {
          name: '',
          email: '',
          phone: '',
          taxID: ''
        }
      })
      setShowCreateForm(false)
      await loadCharges()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar cobrança', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success('Link copiado!', 'Copiado')
    setTimeout(() => setCopied(null), 2000)
  }

  const openActionModal = (type: 'pause' | 'resume' | 'cancel', chargeId: string, chargeName: string) => {
    setActionModal({
      isOpen: true,
      type,
      chargeId,
      chargeName
    })
  }

  const handleAction = async () => {
    if (!actionModal.chargeId || !actionModal.type) return
    
    try {
      let newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED' = 'ACTIVE'
      
      if (actionModal.type === 'pause') {
        newStatus = 'PAUSED'
      } else if (actionModal.type === 'cancel') {
        newStatus = 'CANCELLED'
      }
      
      await api.updateRecurringChargeStatus(actionModal.chargeId, newStatus)
      
      const messages = {
        pause: 'Cobrança pausada com sucesso',
        resume: 'Cobrança retomada com sucesso',
        cancel: 'Cobrança cancelada com sucesso'
      }
      
      toast.success(messages[actionModal.type], 'Sucesso')
      await loadCharges()
      setActionModal({ isOpen: false, type: null, chargeId: null, chargeName: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar cobrança', 'Erro')
    }
  }

  const handleViewHistory = async (charge: RecurringCharge) => {
    setSelectedCharge(charge)
    setShowHistoryModal(true)
    setLoadingHistory(true)
    
    try {
      const response = await api.getChargeHistory(charge.id)
      setHistory(response.history || [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      toast.error('Erro ao carregar histórico', 'Erro')
    } finally {
      setLoadingHistory(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: 'Semanal',
      monthly: 'Mensal',
      semiannual: 'Semestral',
      annual: 'Anual'
    }
    return labels[frequency] || frequency
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-vibeyellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-vibegray-dark font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Cobranças Recorrentes</h1>
        <p className="text-vibegray-dark mt-2">Gerencie assinaturas e cobranças automáticas</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Repeat className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-vibeblack mb-2">Cobranças automáticas</h3>
              <p className="text-sm text-vibegray-dark">
                Crie cobranças que se repetem automaticamente. Perfeito para assinaturas, mensalidades e serviços recorrentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {chargeCreated && (
        <Card className="border-2 border-purple-500 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-vibeblack">✨ Cobrança criada!</CardTitle>
            <CardDescription>Compartilhe este link com o cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-vibeblack">Link de Pagamento</Label>
              <div className="flex gap-2">
                <Input
                  value={chargeCreated.payment_link}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={() => handleCopy(chargeCreated.payment_link, 'created-charge')}
                  className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
                >
                  {copied === 'created-charge' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => window.open(chargeCreated.payment_link, '_blank')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-bold text-vibeblack mb-3">Detalhes:</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Cliente:</span> {chargeCreated.customer.name}</p>
                <p><span className="font-semibold">Email:</span> {chargeCreated.customer.email}</p>
                <p><span className="font-semibold">Valor:</span> R$ {chargeCreated.amount.toFixed(2)}</p>
                <p><span className="font-semibold">Frequência:</span> {getFrequencyLabel(chargeCreated.frequency)}</p>
                <p><span className="font-semibold">Próxima cobrança:</span> {formatDate(chargeCreated.next_billing_date)}</p>
              </div>
            </div>

            <Button
              onClick={() => setChargeCreated(null)}
              variant="outline"
              className="w-full"
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">Criar nova cobrança</CardTitle>
            <CardDescription>Configure uma cobrança recorrente automática</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="frequency" className="text-sm font-semibold text-vibeblack">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Frequência
                  </Label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vibeyellow"
                    required
                  >
                    <option value="weekly">Semanal (7 dias)</option>
                    <option value="monthly">Mensal (30 dias)</option>
                    <option value="semiannual">Semestral (6 meses)</option>
                    <option value="annual">Anual (1 ano)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-vibeblack">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Descrição
                  </Label>
                  <Input
                    id="description"
                    type="text"
                    placeholder="Ex: Assinatura Premium"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

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

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={creating} className="flex-1 bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-11">
                  {creating ? 'Criando...' : 'Criar cobrança recorrente'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="h-11">Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-vibeblack">Suas cobranças</CardTitle>
            <CardDescription>{charges.length} {charges.length === 1 ? 'cobrança ativa' : 'cobranças'}</CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
              <Plus className="w-5 h-5 mr-2" />Criar cobrança
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {charges.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Repeat className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhuma cobrança ainda</h3>
              <p className="text-vibegray-dark mb-6">Crie sua primeira cobrança recorrente</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
                <Plus className="w-5 h-5 mr-2" />Criar primeira cobrança
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {charges.map((charge) => (
                <div key={charge.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-vibeblack">{charge.customer_name}</h3>
                        <p className="text-sm text-vibegray-dark">{charge.customer_email}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 ${
                        charge.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 
                        charge.status === 'PAUSED' ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-red-50 text-red-700'
                      }`}>
                        {charge.status === 'ACTIVE' ? (
                          <>
                            <Play className="w-3 h-3" />
                            Ativo
                          </>
                        ) : charge.status === 'PAUSED' ? (
                          <>
                            <Pause className="w-3 h-3" />
                            Pausado
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Cancelado
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-xs text-vibegray">Frequência</p>
                          <p className="text-sm font-semibold text-vibeblack">{getFrequencyLabel(charge.frequency)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-vibegray">Valor</p>
                          <p className="text-sm font-semibold text-vibeblack">R$ {charge.amount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-vibegray">Próxima cobrança</p>
                          <p className="text-sm font-semibold text-vibeblack">{formatDate(charge.next_billing_date)}</p>
                        </div>
                      </div>
                    </div>

                    {charge.description && (
                      <p className="text-sm text-vibegray-dark flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {charge.description}
                      </p>
                    )}

                    {charge.payment_link && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-900 mb-2">Link de Pagamento:</p>
                        <div className="flex gap-2">
                          <code className="text-xs font-mono text-purple-700 bg-white px-2 py-1 rounded flex-1 truncate">
                            {charge.payment_link}
                          </code>
                          <button
                            onClick={() => handleCopy(charge.payment_link!, charge.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
                          >
                            {copied === charge.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => window.open(charge.payment_link, '_blank')}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap">
                      {charge.status === 'ACTIVE' && (
                        <button
                          onClick={() => openActionModal('pause', charge.id, charge.customer_name)}
                          className="flex items-center gap-2 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-semibold text-sm transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          <span className="hidden sm:inline">Pausar</span>
                        </button>
                      )}

                      {charge.status === 'PAUSED' && (
                        <button
                          onClick={() => openActionModal('resume', charge.id, charge.customer_name)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold text-sm transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span className="hidden sm:inline">Retomar</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleViewHistory(charge)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Histórico</span>
                      </button>

                      {charge.status !== 'CANCELLED' && (
                        <button
                          onClick={() => openActionModal('cancel', charge.id, charge.customer_name)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors ml-auto"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Histórico */}
      {showHistoryModal && selectedCharge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle className="text-xl font-bold text-vibeblack">Histórico de Cobranças</CardTitle>
                <CardDescription className="text-sm">{selectedCharge.customer_name}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(false)}>
                <XCircle className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingHistory ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-vibeyellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-vibegray-dark">Carregando histórico...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhuma cobrança gerada ainda</h3>
                  <p className="text-vibegray-dark">As cobranças aparecerão aqui quando forem criadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className={`border rounded-xl p-4 ${
                      item.status === 'PAID' ? 'border-green-200 bg-green-50' : 
                      item.status === 'FAILED' ? 'border-red-200 bg-red-50' :
                      item.status === 'EXPIRED' ? 'border-gray-200 bg-gray-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${
                            item.status === 'PAID' ? 'bg-green-500' : 
                            item.status === 'FAILED' ? 'bg-red-500' :
                            item.status === 'EXPIRED' ? 'bg-gray-500' :
                            'bg-yellow-500'
                          } rounded-full flex items-center justify-center`}>
                            {item.status === 'PAID' ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : item.status === 'FAILED' ? (
                              <XCircle className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-vibeblack">R$ {item.amount.toFixed(2)}</p>
                            <p className="text-xs text-vibegray-dark">{formatDateTime(item.created_at)}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          item.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          item.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          item.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status === 'PAID' ? 'Pago' : item.status === 'FAILED' ? 'Falhou' : item.status === 'EXPIRED' ? 'Expirado' : 'Pendente'}
                        </span>
                      </div>
                      {item.status !== 'PAID' && (
                        <div className="mt-2">
                          <a 
                            href={item.payment_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                          >
                            Ver link de pagamento
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {item.paid_at && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Pago em {formatDateTime(item.paid_at)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Ações */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        title={
          actionModal.type === 'pause' ? 'Pausar Cobrança' :
          actionModal.type === 'resume' ? 'Retomar Cobrança' :
          'Cancelar Cobrança'
        }
        message={
          actionModal.type === 'pause' 
            ? `Deseja pausar a cobrança de "${actionModal.chargeName}"? As cobranças automáticas serão interrompidas até você reativá-la.`
            : actionModal.type === 'resume'
            ? `Deseja retomar a cobrança de "${actionModal.chargeName}"? As cobranças automáticas serão reativadas.`
            : `Deseja cancelar definitivamente a cobrança de "${actionModal.chargeName}"? Esta ação não pode ser desfeita.`
        }
        confirmText={
          actionModal.type === 'pause' ? 'Pausar' :
          actionModal.type === 'resume' ? 'Retomar' :
          'Cancelar Definitivamente'
        }
        cancelText="Voltar"
        type={actionModal.type === 'cancel' ? 'danger' : 'warning'}
        onConfirm={handleAction}
        onCancel={() => setActionModal({ isOpen: false, type: null, chargeId: null, chargeName: '' })}
      />
    </div>
  )
}