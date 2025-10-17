'use client'

import { useEffect, useState } from 'react'
import { Package, Plus, Edit2, Trash2, DollarSign, FileText, AlertCircle, Loader2, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToastContext } from '../layout'

interface Product {
  id: string
  name: string
  description: string | null
  amount: number
  frequency: 'weekly' | 'monthly' | 'semiannual' | 'annual' | 'one-time'
  active: boolean
  created_at: string
}

export default function ProductsPage() {
  const toast = useToastContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'one-time' as 'weekly' | 'monthly' | 'semiannual' | 'annual' | 'one-time',
    active: true
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await api.getProducts()
      setProducts(response.products || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      await api.createProduct({
        name: formData.name,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount.replace(',', '.')),
        frequency: formData.frequency,
        active: formData.active
      })

      toast.success('Produto criado!', '✨ Sucesso')

      setFormData({
        name: '',
        description: '',
        amount: '',
        frequency: 'one-time',
        active: true
      })
      setShowCreateForm(false)
      await loadProducts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar produto', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = async (product: Product) => {
    setEditing(product.id)
    setFormData({
      name: product.name,
      description: product.description || '',
      amount: product.amount.toString(),
      frequency: product.frequency,
      active: product.active
    })
    setShowCreateForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return

    setCreating(true)

    try {
      await api.updateProduct(editing, {
        name: formData.name,
        description: formData.description || undefined,
        amount: parseFloat(formData.amount.replace(',', '.')),
        frequency: formData.frequency,
        active: formData.active
      })

      toast.success('Produto atualizado!', '✨ Sucesso')

      setFormData({
        name: '',
        description: '',
        amount: '',
        frequency: 'one-time',
        active: true
      })
      setShowCreateForm(false)
      setEditing(null)
      await loadProducts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar produto', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const openDeleteModal = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    })
  }

  const handleDelete = async () => {
    if (!deleteModal.productId) return

    try {
      await api.deleteProduct(deleteModal.productId)
      toast.success('Produto deletado com sucesso', 'Sucesso')
      await loadProducts()
      setDeleteModal({ isOpen: false, productId: null, productName: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar produto', 'Erro')
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'one-time': 'Pagamento único',
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
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Produtos e Serviços</h1>
        <p className="text-vibegray-dark mt-2">Gerencie seus produtos para usar em cobranças</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-vibeblack mb-2">Catálogo de Produtos</h3>
              <p className="text-sm text-vibegray-dark">
                Crie produtos/serviços para facilitar a criação de cobranças recorrentes e links de pagamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">
              {editing ? 'Editar produto' : 'Criar novo produto'}
            </CardTitle>
            <CardDescription>
              {editing ? 'Atualize as informações do produto' : 'Preencha os dados do produto/serviço'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editing ? handleUpdate : handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-vibeblack">
                    <Package className="w-4 h-4 inline mr-1" />
                    Nome do Produto/Serviço *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Consultoria Premium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold text-vibeblack">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Valor (R$) *
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-vibeblack">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Descrição (opcional)
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Consultoria de 2 horas"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-sm font-semibold text-vibeblack">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tipo de Cobrança *
                </Label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vibeyellow"
                  required
                >
                  <option value="one-time">Pagamento Único</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="semiannual">Semestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-vibeyellow border-gray-300 rounded focus:ring-vibeyellow"
                />
                <Label htmlFor="active" className="text-sm font-semibold text-vibeblack cursor-pointer">
                  Produto ativo
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-11"
                >
                  {creating ? 'Salvando...' : (editing ? 'Atualizar produto' : 'Criar produto')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditing(null)
                    setFormData({
                      name: '',
                      description: '',
                      amount: '',
                      frequency: 'one-time',
                      active: true
                    })
                  }}
                  className="h-11"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-vibeblack">Seus produtos</CardTitle>
            <CardDescription>{products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}</CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
              <Plus className="w-5 h-5 mr-2" />Criar produto
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhum produto ainda</h3>
              <p className="text-vibegray-dark mb-6">Crie seu primeiro produto/serviço</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
                <Plus className="w-5 h-5 mr-2" />Criar primeiro produto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-vibeblack">{product.name}</h3>
                          {!product.active && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
                              Inativo
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-vibegray-dark mt-1">{product.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-vibegray">Valor</p>
                          <p className="text-sm font-semibold text-vibeblack">R$ {product.amount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-vibegray">Tipo</p>
                          <p className="text-sm font-semibold text-vibeblack">{getFrequencyLabel(product.frequency)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        onClick={() => openDeleteModal(product.id, product.name)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Deletar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar Produto"
        message={`Tem certeza que deseja deletar "${deleteModal.productName}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, productId: null, productName: '' })}
      />
    </div>
  )
}
