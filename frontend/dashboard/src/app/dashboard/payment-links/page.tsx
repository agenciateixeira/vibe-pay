'use client'

import { useEffect, useState } from 'react'
import { Link as LinkIcon, Plus, Trash2, Copy, Check, ExternalLink, DollarSign, Package, Globe, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToastContext } from '../layout'

interface PaymentLink {
  id: string
  bill_id: string
  amount: number
  product_name: string
  description: string
  payment_link: string
  status: string
  created_at: string
}

interface PaymentLinkCreated {
  id: string
  link_id: string
  amount: number
  product_name: string
  description: string
  payment_link: string
  expires_at: string
}

interface Product {
  id: string
  name: string
  description: string
  amount: number
  frequency: string
  active: boolean
}

export default function PaymentLinksPage() {
  const toast = useToastContext()
  const [links, setLinks] = useState<PaymentLink[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [linkCreated, setLinkCreated] = useState<PaymentLinkCreated | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [formData, setFormData] = useState({
    amount: '',
    product_name: '',
    description: '',
    return_url: '',
    completion_url: ''
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    linkId: string | null
    linkUrl: string
  }>({
    isOpen: false,
    linkId: null,
    linkUrl: ''
  })

  useEffect(() => {
    loadLinks()
    loadProducts()
  }, [])

  const loadLinks = async () => {
    try {
      const response = await api.getPaymentLinks()
      setLinks(response.payment_links || [])
    } catch (error) {
      console.error('Erro ao carregar links:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await api.getProducts()
      setProducts(response.products || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId)

    if (productId === '') {
      // Limpar formulário se deselecionar
      setFormData({
        amount: '',
        product_name: '',
        description: '',
        return_url: '',
        completion_url: ''
      })
      return
    }

    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData({
        ...formData,
        product_name: product.name,
        description: product.description || '',
        amount: product.amount.toFixed(2).replace('.', ',')
      })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    try {
      const response = await api.createPaymentLink({
        amount: parseFloat(formData.amount.replace(',', '.')),
        product_name: formData.product_name,
        description: formData.description,
        return_url: formData.return_url || undefined,
        completion_url: formData.completion_url || undefined
      })

      setLinkCreated(response.payment_link)
      toast.success('Link de pagamento criado!', '✨ Sucesso')
      
      setFormData({
        amount: '',
        product_name: '',
        description: '',
        return_url: '',
        completion_url: ''
      })
      setShowCreateForm(false)
      await loadLinks()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar link', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const openDeleteModal = (linkId: string, linkUrl: string) => {
    setDeleteModal({
      isOpen: true,
      linkId,
      linkUrl
    })
  }

  const handleDelete = async () => {
    if (!deleteModal.linkId) return
    
    try {
      await api.deletePaymentLink(deleteModal.linkId)
      toast.success('Link deletado com sucesso', 'Sucesso')
      await loadLinks()
      setDeleteModal({ isOpen: false, linkId: null, linkUrl: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar link', 'Erro')
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    toast.success('Link copiado!', 'Copiado')
    setTimeout(() => setCopied(null), 2000)
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
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
        <h1 className="text-3xl font-black text-vibeblack">Links de Pagamento</h1>
        <p className="text-vibegray-dark mt-2">Crie links rápidos para receber pagamentos</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-vibeblack mb-2">Como funciona</h3>
              <p className="text-sm text-vibegray-dark">
                Crie um link de pagamento com produto e valor. Envie para o cliente. O cliente preenche os dados dele e paga via PIX!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {linkCreated && (
        <Card className="border-2 border-vibeyellow shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-vibeblack">✨ Link criado!</CardTitle>
            <CardDescription>Compartilhe este link com o cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-vibeblack">Link de Pagamento</Label>
              <div className="flex gap-2">
                <Input
                  value={linkCreated.payment_link}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={() => handleCopy(linkCreated.payment_link, 'created-link')}
                  className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
                >
                  {copied === 'created-link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => window.open(linkCreated.payment_link, '_blank')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-vibeblack mb-3">Detalhes:</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Produto:</span> {linkCreated.product_name}</p>
                <p><span className="font-semibold">Valor:</span> R$ {linkCreated.amount.toFixed(2)}</p>
                {linkCreated.description && (
                  <p><span className="font-semibold">Descrição:</span> {linkCreated.description}</p>
                )}
              </div>
            </div>

            <Button
              onClick={() => setLinkCreated(null)}
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
            <CardTitle className="text-xl font-bold text-vibeblack">Criar link de pagamento</CardTitle>
            <CardDescription>Preencha os dados do produto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              {products.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="select_product" className="text-sm font-semibold text-vibeblack">
                    <Package className="w-4 h-4 inline mr-1" />
                    Usar produto existente (opcional)
                  </Label>
                  <select
                    id="select_product"
                    value={selectedProduct}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibeyellow"
                  >
                    <option value="">-- Selecione um produto ou preencha manualmente --</option>
                    {products.filter(p => p.active).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - R$ {product.amount.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-vibegray-dark">
                    Selecione um produto para preencher automaticamente os campos abaixo
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name" className="text-sm font-semibold text-vibeblack">
                    <Package className="w-4 h-4 inline mr-1" />
                    Produto/Serviço *
                  </Label>
                  <Input
                    id="product_name"
                    type="text"
                    placeholder="Ex: Consultoria Premium"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="return_url" className="text-sm font-semibold text-vibeblack">
                    <Globe className="w-4 h-4 inline mr-1" />
                    URL de Retorno (opcional)
                  </Label>
                  <Input
                    id="return_url"
                    type="url"
                    placeholder="https://seusite.com/voltar"
                    value={formData.return_url}
                    onChange={(e) => setFormData({ ...formData, return_url: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completion_url" className="text-sm font-semibold text-vibeblack">
                    <Globe className="w-4 h-4 inline mr-1" />
                    URL de Conclusão (opcional)
                  </Label>
                  <Input
                    id="completion_url"
                    type="url"
                    placeholder="https://seusite.com/sucesso"
                    value={formData.completion_url}
                    onChange={(e) => setFormData({ ...formData, completion_url: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={creating} className="flex-1 bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-11">
                  {creating ? 'Criando...' : 'Criar link de pagamento'}
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
            <CardTitle className="text-xl font-bold text-vibeblack">Seus links</CardTitle>
            <CardDescription>{links.length} {links.length === 1 ? 'link criado' : 'links criados'}</CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
              <Plus className="w-5 h-5 mr-2" />Criar link
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhum link ainda</h3>
              <p className="text-vibegray-dark mb-6">Crie seu primeiro link de pagamento</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
                <Plus className="w-5 h-5 mr-2" />Criar primeiro link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="border border-gray-200 rounded-xl p-4 hover:border-vibeyellow/50 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-vibeblack">{link.product_name}</h3>
                        <p className="text-sm text-vibegray-dark">{link.description || 'Sem descrição'}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                        link.status === 'PAID' ? 'bg-green-50 text-green-700' : 
                        link.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 
                        link.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {link.status === 'PAID' ? 'Pago' : 
                         link.status === 'ACTIVE' ? 'Aguardando' : 
                         link.status === 'PENDING' ? 'Pendente' : 'Expirado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-vibeblack">
                        R$ {link.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-vibegray-dark bg-gray-50 px-2 py-1 rounded flex-1 truncate">
                        {link.payment_link}
                      </code>
                    </div>

                    <div className="text-xs text-vibegray">
                      Criado em {formatDate(link.created_at)}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleCopy(link.payment_link, link.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                      >
                        {copied === link.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="hidden sm:inline text-green-600">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">Copiar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => window.open(link.payment_link, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-vibeyellow hover:bg-vibeyellow/90 text-vibeblack rounded-lg font-semibold text-sm transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Abrir</span>
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(link.id, link.payment_link)}
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
        title="Deletar Link"
        message="Tem certeza que deseja deletar este link de pagamento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, linkId: null, linkUrl: '' })}
      />
    </div>
  )
}