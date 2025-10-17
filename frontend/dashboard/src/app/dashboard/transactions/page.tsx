'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  Copy,
  Check,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToastContext } from '../layout'

interface Transaction {
  id: string
  type: 'payment' | 'withdrawal'
  amount: number
  status: string
  created_at: string
  description?: string
  customer_name?: string
  customer_email?: string
  pix_key?: string
  transaction_id?: string
  correlation_id?: string
}

interface Summary {
  total_received: number
  total_withdrawn: number
  pending_withdrawals: number
  balance: number
  total_transactions: number
}

export default function TransactionsPage() {
  const toast = useToastContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    total_received: 0,
    total_withdrawn: 0,
    pending_withdrawals: 0,
    balance: 0,
    total_transactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'all' | 'payment' | 'withdrawal'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await api.getTransactions()
      setTransactions(response.transactions || [])
      setSummary(response.summary || {
        total_received: 0,
        total_withdrawn: 0,
        pending_withdrawals: 0,
        balance: 0,
        total_transactions: 0
      })
    } catch (error: any) {
      console.error('Erro ao carregar extrato:', error)
      toast.error('Erro ao carregar extrato', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'text-green-600 bg-green-50',
      PENDING: 'text-yellow-600 bg-yellow-50',
      FAILED: 'text-red-600 bg-red-50',
      CANCELLED: 'text-gray-600 bg-gray-50'
    }
    return colors[status] || 'text-gray-600 bg-gray-50'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: 'Concluído',
      PENDING: 'Pendente',
      FAILED: 'Falhou',
      CANCELLED: 'Cancelado'
    }
    return labels[status] || status
  }

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredTransactions = transactions.filter(t => {
    if (typeFilter === 'all') return true
    return t.type === typeFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando extrato...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-vibeblack">Extrato de Movimentação</h1>
            <p className="text-vibegray-dark mt-2">Acompanhe todas as suas entradas e saídas</p>
          </div>
          <Button
            onClick={loadTransactions}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-700">Total Recebido</p>
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-green-700">
              {formatCurrency(summary.total_received)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-red-700">Total Sacado</p>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-red-700">
              {formatCurrency(summary.total_withdrawn)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-yellow-700">Saques Pendentes</p>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-yellow-700">
              {formatCurrency(summary.pending_withdrawals)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-blue-700">Saldo Disponível</p>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-700">
              {formatCurrency(summary.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-vibegray" />
            <span className="text-sm font-semibold text-vibeblack mr-2">Filtrar por tipo:</span>
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
              className={typeFilter === 'all' ? 'bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack' : ''}
            >
              Todas
            </Button>
            <Button
              variant={typeFilter === 'payment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('payment')}
              className={typeFilter === 'payment' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
            >
              <ArrowDownCircle className="w-4 h-4 mr-1" />
              Recebimentos
            </Button>
            <Button
              variant={typeFilter === 'withdrawal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('withdrawal')}
              className={typeFilter === 'withdrawal' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            >
              <ArrowUpCircle className="w-4 h-4 mr-1" />
              Saques
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-vibeblack">
            Histórico de Movimentações
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transação encontrada' : 'transações encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhuma transação encontrada</h3>
              <p className="text-vibegray-dark">Suas movimentações aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'payment'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {transaction.type === 'payment' ? (
                          <ArrowDownCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-vibeblack">
                            {transaction.type === 'payment' ? 'Pagamento Recebido' : 'Saque Realizado'}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(transaction.status)}`}>
                            {getStatusLabel(transaction.status)}
                          </span>
                        </div>

                        {transaction.description && (
                          <p className="text-sm text-vibegray-dark mb-2">{transaction.description}</p>
                        )}

                        {transaction.customer_name && (
                          <p className="text-sm text-vibegray-dark">
                            <span className="font-semibold">Cliente:</span> {transaction.customer_name}
                            {transaction.customer_email && ` (${transaction.customer_email})`}
                          </p>
                        )}

                        {transaction.pix_key && (
                          <p className="text-sm text-vibegray-dark">
                            <span className="font-semibold">Chave PIX:</span> {transaction.pix_key}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-vibegray">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(transaction.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">Token:</span>
                            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {(transaction.transaction_id || transaction.correlation_id || transaction.id).substring(0, 12)}...
                            </code>
                            <button
                              onClick={() => handleCopyId(transaction.transaction_id || transaction.correlation_id || transaction.id)}
                              className="text-vibegray-dark hover:text-vibeyellow transition-colors"
                            >
                              {copiedId === (transaction.transaction_id || transaction.correlation_id || transaction.id) ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-black ${
                        transaction.type === 'payment'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'payment' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
