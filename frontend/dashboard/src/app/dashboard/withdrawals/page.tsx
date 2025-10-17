'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Plus, XCircle, Clock, CheckCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToastContext } from '../layout'

interface Withdrawal {
  id: string
  amount: number
  pix_key: string
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  user_cpf_cnpj: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  requested_at: string
  processed_at: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
}

export default function WithdrawalsPage() {
  const toast = useToastContext()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    pix_key: '',
    pix_key_type: 'cpf' as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  })
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    withdrawalId: string | null
    amount: number
  }>({
    isOpen: false,
    withdrawalId: null,
    amount: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [withdrawalsRes, balanceRes] = await Promise.all([
        api.getWithdrawals(),
        api.getBalance()
      ])
      
      setWithdrawals(withdrawalsRes.withdrawals || [])
      setBalance(balanceRes.balance || 0)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const amount = parseFloat(formData.amount.replace(',', '.'))
      
      if (amount > balance) {
        toast.error('Saldo insuficiente', 'Erro')
        return
      }

      if (amount <= 0) {
        toast.error('Valor deve ser maior que zero', 'Erro')
        return
      }

      await api.createWithdrawal({
        amount,
        pix_key: formData.pix_key,
        pix_key_type: formData.pix_key_type
      })

      toast.success('Saque solicitado com sucesso!', '✨ Sucesso')
      
      setFormData({
        amount: '',
        pix_key: '',
        pix_key_type: 'cpf'
      })
      setShowCreateForm(false)
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar saque', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelModal.withdrawalId) return
    
    try {
      await api.cancelWithdrawal(cancelModal.withdrawalId)
      toast.success('Saque cancelado com sucesso', 'Sucesso')
      await loadData()
      setCancelModal({ isOpen: false, withdrawalId: null, amount: 0 })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar saque', 'Erro')
    }
  }

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string') {
      const numbers = value.replace(/\D/g, '')
      const amount = parseFloat(numbers) / 100
      return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'Pendente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
      PROCESSING: { label: 'Processando', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Loader2 },
      COMPLETED: { label: 'Concluído', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      FAILED: { label: 'Falhou', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
      CANCELLED: { label: 'Cancelado', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle }
    }
    return configs[status] || configs.PENDING
  }

  const getPixKeyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'E-mail',
      phone: 'Telefone',
      random: 'Chave Aleatória'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Saques</h1>
        <p className="text-vibegray-dark mt-2">Solicite transferências do seu saldo via PIX</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-semibold">Saldo Disponível</p>
                <p className="text-4xl font-black text-green-900">{formatCurrency(balance)}</p>
              </div>
            </div>
            {!showCreateForm && (
              <Button 
                onClick={() => setShowCreateForm(true)} 
                disabled={balance <= 0}
                className="bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                Solicitar Saque
              </Button>
            )}
          </div>
          {balance <= 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Você precisa ter saldo disponível para solicitar um saque.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">Solicitar novo saque</CardTitle>
            <CardDescription>Informe o valor e sua chave PIX</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <strong>Importante:</strong> Se usar CPF ou CNPJ como chave PIX, deve ser o mesmo cadastrado na sua conta. O saque será processado em até 2 dias úteis.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-vibeblack">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Valor do Saque (R$) *
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
                <p className="text-xs text-vibegray-dark">
                  Saldo disponível: {formatCurrency(balance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_key_type" className="text-sm font-semibold text-vibeblack">
                  Tipo de Chave PIX *
                </Label>
                <select
                  id="pix_key_type"
                  value={formData.pix_key_type}
                  onChange={(e) => setFormData({ ...formData, pix_key_type: e.target.value as any })}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vibeyellow"
                  required
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_key" className="text-sm font-semibold text-vibeblack">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Chave PIX *
                </Label>
                <Input
                  id="pix_key"
                  type="text"
                  placeholder={
                    formData.pix_key_type === 'cpf' ? '000.000.000-00' :
                    formData.pix_key_type === 'cnpj' ? '00.000.000/0000-00' :
                    formData.pix_key_type === 'email' ? 'email@example.com' :
                    formData.pix_key_type === 'phone' ? '(11) 99999-9999' :
                    'chave-aleatoria-uuid'
                  }
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-vibegray-dark">
                  {formData.pix_key_type === 'cpf' || formData.pix_key_type === 'cnpj' 
                    ? '⚠️ Deve ser o CPF/CNPJ cadastrado na sua conta'
                    : 'Informe sua chave PIX cadastrada no banco'
                  }
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={creating} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-11">
                  {creating ? 'Solicitando...' : 'Solicitar Saque'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="h-11">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-vibeblack">Histórico de Saques</CardTitle>
          <CardDescription>{withdrawals.length} {withdrawals.length === 1 ? 'saque solicitado' : 'saques solicitados'}</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhum saque ainda</h3>
              <p className="text-vibegray-dark mb-6">Solicite seu primeiro saque quando tiver saldo disponível</p>
              {balance > 0 && !showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  <Plus className="w-5 h-5 mr-2" />
                  Solicitar Primeiro Saque
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => {
                const statusConfig = getStatusConfig(withdrawal.status)
                const StatusIcon = statusConfig.icon

                return (
                  <div key={withdrawal.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-black text-vibeblack">
                              {formatCurrency(withdrawal.amount)}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 border ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-vibegray-dark">
                            Solicitado em {formatDateTime(withdrawal.requested_at)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold text-vibeblack">Tipo de Chave:</span>
                            <span className="text-vibegray-dark ml-2">{getPixKeyTypeLabel(withdrawal.pix_key_type)}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-vibeblack">Chave PIX:</span>
                            <span className="text-vibegray-dark ml-2 font-mono text-xs">{withdrawal.pix_key}</span>
                          </div>
                        </div>
                      </div>

                      {withdrawal.notes && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-blue-900">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            <strong>Observação:</strong> {withdrawal.notes}
                          </p>
                        </div>
                      )}

                      {withdrawal.status === 'PENDING' && (
                        <div className="pt-2 border-t border-gray-100">
                          <button
                            onClick={() => setCancelModal({ isOpen: true, withdrawalId: withdrawal.id, amount: withdrawal.amount })}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancelar Saque
                          </button>
                        </div>
                      )}

                      {withdrawal.completed_at && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Concluído em {formatDateTime(withdrawal.completed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={cancelModal.isOpen}
        title="Cancelar Saque"
        message={`Deseja cancelar o saque de ${formatCurrency(cancelModal.amount)}? O valor será devolvido ao seu saldo disponível.`}
        confirmText="Cancelar Saque"
        cancelText="Voltar"
        type="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelModal({ isOpen: false, withdrawalId: null, amount: 0 })}
      />
    </div>
  )
}