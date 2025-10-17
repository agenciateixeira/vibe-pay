'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Activity,
  ArrowDownRight,
  Clock
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Transaction {
  id: string
  amount: number
  status: string
  payer_name?: string | null
  created_at?: string | null
  description?: string | null
}

interface Stats {
  totalReceived: number
  totalTransactions: number
  todayTransactions: number
  availableBalance: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalReceived: 0,
    totalTransactions: 0,
    todayTransactions: 0,
    availableBalance: 0
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Buscar payments com tratamento de erro
      let allTransactions: Transaction[] = []

      try {
        const response = await api.getPayments()
        allTransactions = response.transactions || response.payments || []
      } catch (error) {
        console.log('Sem transações disponíveis')
        allTransactions = []
      }

      // Filtrar apenas transações válidas
      const validTransactions = allTransactions.filter((t: Transaction) => t.created_at)

      setTransactions(validTransactions.slice(0, 10))

      // Calcular estatísticas
      const completed = validTransactions.filter((t: Transaction) =>
        t.status === 'completed' || t.status === 'COMPLETED'
      )
      const today = new Date().toISOString().split('T')[0]
      const todayTxs = validTransactions.filter((t: Transaction) => {
        if (!t.created_at) return false
        try {
          return t.created_at.split('T')[0] === today
        } catch {
          return false
        }
      })

      const totalReceived = completed.reduce((sum: number, t: Transaction) =>
        sum + (Number(t.amount) || 0), 0
      )

      // Buscar saldo real da API (considera saques)
      let availableBalance = 0
      try {
        const balanceResponse = await api.getBalance()
        availableBalance = balanceResponse.balance || 0
      } catch (error) {
        console.log('Erro ao buscar saldo, usando total recebido')
        availableBalance = totalReceived
      }

      setStats({
        totalReceived,
        totalTransactions: validTransactions.length,
        todayTransactions: todayTxs.length,
        availableBalance
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Não mostrar erro para o usuário, apenas logar
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return '-'
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'text-green-600 bg-green-50',
      pending: 'text-yellow-600 bg-yellow-50',
      failed: 'text-red-600 bg-red-50',
      expired: 'text-gray-600 bg-gray-50',
      COMPLETED: 'text-green-600 bg-green-50',
      ACTIVE: 'text-yellow-600 bg-yellow-50',
      EXPIRED: 'text-gray-600 bg-gray-50'
    }
    return colors[status] || colors.pending
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou',
      expired: 'Expirado',
      COMPLETED: 'Pago',
      ACTIVE: 'Pendente',
      EXPIRED: 'Expirado'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-vibeyellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-vibegray-dark font-medium">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Overview</h1>
        <p className="text-vibegray-dark mt-2">Acompanhe suas métricas em tempo real</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-vibegray">Saldo Disponível</CardTitle>
            <div className="w-10 h-10 bg-vibeyellow/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-vibeyellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-vibeblack">
              {formatCurrency(stats.availableBalance)}
            </div>
            <p className="text-xs text-vibegray-dark mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Disponível para saque
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-vibegray">Total Recebido</CardTitle>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-vibeblack">
              {formatCurrency(stats.totalReceived)}
            </div>
            <p className="text-xs text-vibegray-dark mt-2">Todas as transações pagas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-vibegray">Total de Transações</CardTitle>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-vibeblack">{stats.totalTransactions}</div>
            <p className="text-xs text-vibegray-dark mt-2">Cobranças criadas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-vibegray">Transações Hoje</CardTitle>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-vibeblack">{stats.todayTransactions}</div>
            <p className="text-xs text-vibegray-dark mt-2">Nas últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-vibeblack">Últimas Transações</CardTitle>
          <CardDescription>Suas 10 transações mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhuma transação ainda</h3>
              <p className="text-vibegray-dark">Crie sua primeira cobrança para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vibegray uppercase">Cliente</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vibegray uppercase">Descrição</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vibegray uppercase">Valor</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vibegray uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vibegray uppercase">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-vibeblack">
                          {transaction.payer_name || 'Cliente'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-vibegray-dark">{transaction.description || '-'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-vibeblack">{formatCurrency(transaction.amount)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-vibegray-dark">
                          <Clock className="w-4 h-4" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}