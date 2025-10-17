'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  RefreshCw,
  Search,
  Plus,
  Eye,
  Copy,
  Check,
  Clock,
  Calendar,
  X
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface Transaction {
  id: string
  correlation_id: string
  amount: number
  status: string
  payer_name?: string | null
  payer_email?: string | null
  created_at?: string | null
  description?: string | null
  qr_code_text?: string | null
}

interface Stats {
  totalReceived: number
  completedCount: number
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalReceived: 0,
    completedCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [searchTerm, statusFilter, transactions])

  const loadTransactions = async () => {
  try {
    const response = await api.getPayments()
    const allTransactions = response.transactions || []
    
    // Filtrar apenas transações válidas (com correlation_id e amount válido)
    const validTransactions = allTransactions.filter((t: Transaction) => 
      t.correlation_id && 
      t.amount !== null && 
      t.amount !== undefined && 
      !isNaN(Number(t.amount))
    )
    
    setTransactions(validTransactions)

    const completed = validTransactions.filter((t: Transaction) => t.status === 'completed')
    const totalReceived = completed.reduce((sum: number, t: Transaction) => 
      sum + (Number(t.amount) || 0), 0
    )

    setStats({
      totalReceived,
      completedCount: completed.length
    })
  } catch (error) {
    console.error('Erro ao carregar transações:', error)
  } finally {
    setLoading(false)
  }
}

  const filterTransactions = () => {
    let filtered = [...transactions]

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t => 
        t.correlation_id?.toLowerCase().includes(term) ||
        t.payer_name?.toLowerCase().includes(term) ||
        t.payer_email?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      )
    }

    setFilteredTransactions(filtered)
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
      expired: 'text-gray-600 bg-gray-50'
    }
    return colors[status] || colors.pending
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou',
      expired: 'Expirado'
    }
    return labels[status] || status
  }

  const handleCopyId = async (id: string) => {
    await navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyPixCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-vibeyellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-vibegray-dark font-medium">Carregando transações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-vibeblack">
            Transações
          </h1>
          <p className="text-vibegray-dark mt-2">
            Gerencie todas as suas cobranças
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/payments')}
          className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar cobrança
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-vibegray">
              Total bruto recebido em vendas
            </CardTitle>
            <div className="w-10 h-10 bg-vibeyellow/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-vibeyellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-vibeblack">
              {formatCurrency(stats.totalReceived)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-vibegray">
              Transações completas
            </CardTitle>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-vibeblack">
              {stats.completedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vibegray" />
              <Input
                placeholder="Pesquisar por ID, nome, e-mail"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 h-11"
            >
              <option value="ALL">Todos os status</option>
              <option value="completed">Pago</option>
              <option value="pending">Pendente</option>
              <option value="expired">Expirado</option>
              <option value="failed">Falhou</option>
            </Select>

            <Button
              onClick={loadTransactions}
              variant="outline"
              className="h-11"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-vibegray-dark">
                Tente ajustar os filtros ou criar uma nova cobrança
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-vibegray uppercase">
                      ID de Pagamento
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-vibegray uppercase">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-vibegray uppercase">
                      Valor
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-vibegray uppercase">
                      E-mail
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-vibegray uppercase">
                      Data de Criação
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-vibegray uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-vibeblack">
                            {transaction.correlation_id?.slice(0, 8)}...
                          </p>
                          <button
                            onClick={() => handleCopyId(transaction.correlation_id)}
                            className="text-vibegray-dark hover:text-vibeyellow transition-colors"
                          >
                            {copiedId === transaction.correlation_id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-vibeblack">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-vibegray-dark">
                          {transaction.payer_email || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-vibegray-dark">
                          <Clock className="w-4 h-4" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle className="text-xl font-bold text-vibeblack">
                  Detalhes da Transação
                </CardTitle>
                <CardDescription>
                  ID: {selectedTransaction.correlation_id}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-vibegray mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusLabel(selectedTransaction.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-vibegray mb-1">Valor</p>
                  <p className="text-2xl font-black text-vibeblack">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-bold text-vibeblack mb-3">Dados do Cliente</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-vibegray">Nome</p>
                    <p className="text-sm font-medium text-vibeblack">
                      {selectedTransaction.payer_name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-vibegray">Email</p>
                    <p className="text-sm font-medium text-vibeblack">
                      {selectedTransaction.payer_email || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="border-t pt-4">
                  <p className="text-sm text-vibegray mb-1">Descrição</p>
                  <p className="text-sm text-vibeblack">
                    {selectedTransaction.description}
                  </p>
                </div>
              )}

              {selectedTransaction.qr_code_text && (
                <div className="border-t pt-4">
                  <p className="text-sm font-bold text-vibeblack mb-2">PIX Copia e Cola</p>
                  <div className="flex gap-2">
                    <Input
                      value={selectedTransaction.qr_code_text}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      onClick={() => handleCopyPixCode(selectedTransaction.qr_code_text!)}
                      className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack"
                    >
                      {copiedId === selectedTransaction.qr_code_text ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-vibegray mb-1">Data de Criação</p>
                <div className="flex items-center gap-2 text-sm font-medium text-vibeblack">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedTransaction.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}