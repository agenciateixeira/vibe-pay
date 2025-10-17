'use client'

import { useEffect, useState } from 'react'
import { Users, Mail, Phone, CreditCard, TrendingUp, DollarSign, Loader2, Search } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToastContext } from '../layout'

interface Customer {
  name: string
  email: string
  phone: string
  tax_id: string
  created_at: string
}

interface CustomerStats {
  total_transactions: number
  total_paid: number
  total_pending: number
  recurring_subscriptions: number
}

export default function CustomersPage() {
  const toast = useToastContext()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const response = await api.getCustomers()
      setCustomers(response.customers || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast.error('Erro ao carregar clientes', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const handleViewStats = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setLoadingStats(true)
    
    try {
      const response = await api.getCustomerStats(customer.email)
      setCustomerStats(response.stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas', 'Erro')
    } finally {
      setLoadingStats(false)
    }
  }

  const exportToCSV = () => {
    try {
      // Criar cabeçalho do CSV
      const headers = ['Nome', 'Email', 'Telefone', 'CPF/CNPJ', 'Data de Cadastro']
      
      // Criar linhas do CSV
      const rows = filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone,
        customer.tax_id,
        formatDate(customer.created_at)
      ])
      
      // Combinar cabeçalho e linhas
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Criar blob e fazer download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Arquivo CSV exportado com sucesso!', 'Sucesso')
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar CSV', 'Erro')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.tax_id.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Clientes</h1>
        <p className="text-vibegray-dark mt-2">Gerencie seus clientes e veja estatísticas</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-vibeblack mb-2">Base de Clientes</h3>
              <p className="text-sm text-vibegray-dark">
                Todos os clientes que já realizaram pelo menos uma transação aparecem aqui.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-vibeblack">
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente' : 'clientes'}
                </CardTitle>
                <CardDescription>Lista completa de clientes</CardDescription>
              </div>
              {filteredCustomers.length > 0 && (
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="flex items-center gap-2 font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar CSV
                </Button>
              )}
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, email, telefone ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
              </h3>
              <p className="text-vibegray-dark">
                {searchTerm ? 'Tente buscar com outros termos' : 'Os clientes aparecerão aqui quando realizarem transações'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-vibeblack text-lg">{customer.name}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-vibegray-dark truncate">{customer.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-vibegray-dark">{customer.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-vibegray-dark">{customer.tax_id}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-vibegray">
                        Cliente desde {formatDate(customer.created_at)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleViewStats(customer)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Ver Estatísticas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Estatísticas */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-vibeblack">
                    Estatísticas do Cliente
                  </CardTitle>
                  <CardDescription>{selectedCustomer.name}</CardDescription>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null)
                    setCustomerStats(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingStats ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-vibeyellow animate-spin mx-auto mb-4" />
                  <p className="text-vibegray-dark">Carregando estatísticas...</p>
                </div>
              ) : customerStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 font-semibold">Total de Transações</p>
                        <p className="text-2xl font-black text-blue-900">{customerStats.total_transactions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-semibold">Total Pago</p>
                        <p className="text-2xl font-black text-green-900">{formatCurrency(customerStats.total_paid)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-xs text-yellow-700 font-semibold">Pendente</p>
                        <p className="text-2xl font-black text-yellow-900">{formatCurrency(customerStats.total_pending)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-700 font-semibold">Assinaturas Ativas</p>
                        <p className="text-2xl font-black text-purple-900">{customerStats.recurring_subscriptions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-vibegray-dark">Sem dados disponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}