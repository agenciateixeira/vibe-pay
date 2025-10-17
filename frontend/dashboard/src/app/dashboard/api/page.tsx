'use client'

import { useEffect, useState } from 'react'
import { Key, Plus, Trash2, Copy, Check, AlertCircle, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToastContext } from '../layout'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  environment: string
  created_at: string
}

export default function ApiKeysPage() {
  const toast = useToastContext()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    environment: 'production'
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    keyId: string | null
    keyName: string
  }>({
    isOpen: false,
    keyId: null,
    keyName: ''
  })

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const response = await api.getApiKeys()
      setKeys(response.api_keys || [])
    } catch (error) {
      console.error('Erro ao carregar keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const response = await api.createApiKey(formData)
      
      if (response.key) {
        setNewKey(response.key)
        toast.success('API Key criada com sucesso!', '✨ Sucesso')
      }
      
      setFormData({ name: '', environment: 'production' })
      setShowCreateForm(false)
      await loadKeys()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar API key', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const openDeleteModal = (keyId: string, keyName: string) => {
    setDeleteModal({
      isOpen: true,
      keyId,
      keyName
    })
  }

  const handleDelete = async () => {
    if (!deleteModal.keyId) return
    
    try {
      await api.deleteApiKey(deleteModal.keyId)
      toast.success('API Key deletada com sucesso', 'Sucesso')
      await loadKeys()
      setDeleteModal({ isOpen: false, keyId: null, keyName: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar API key', 'Erro')
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(text)
    toast.success('Copiado para a área de transferência', 'Copiado!')
    setTimeout(() => setCopiedKey(null), 2000)
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
          <p className="text-vibegray-dark font-medium">Carregando API keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Chaves de API</h1>
        <p className="text-vibegray-dark mt-2">Gerencie suas chaves de integração</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-vibeblack mb-2">Documentação</h3>
                <p className="text-sm text-vibegray-dark mb-3">
                  Aprenda a integrar o Vibe Pay em sua aplicação
                </p>
                <a 
                  href="https://docs.vibepay.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-yellow-700 hover:text-yellow-800 inline-flex items-center gap-1"
                >
                  Ver documentação →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-vibeblack mb-2">Segurança</h3>
                <p className="text-sm text-vibegray-dark">
                  Suas chaves são criptografadas e nunca poderão ser visualizadas novamente após a criação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {newKey && (
        <Card className="border-2 border-vibeyellow shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">✨ API Key criada com sucesso!</CardTitle>
            <CardDescription>Copie esta chave agora. Ela não será exibida novamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm font-mono text-vibeblack flex-1 break-all">
                  {newKey}
                </code>
                <Button
                  onClick={() => handleCopy(newKey)}
                  className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold flex-shrink-0"
                >
                  {copiedKey === newKey ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Button
              onClick={() => setNewKey(null)}
              variant="outline"
              className="mt-4 w-full"
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">Criar nova API key</CardTitle>
            <CardDescription>Gere uma chave para integrar com a API do Vibe Pay</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-vibeblack">Nome da chave</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Produção - Loja Online"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-vibegray-dark">Escolha um nome descritivo para identificar esta chave</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment" className="text-sm font-semibold text-vibeblack">Ambiente</Label>
                <select
                  id="environment"
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibeyellow"
                  required
                >
                  <option value="production">Produção</option>
                  <option value="test">Teste</option>
                </select>
                <p className="text-xs text-vibegray-dark">
                  {formData.environment === 'production' 
                    ? 'Use esta chave em produção com transações reais' 
                    : 'Use esta chave para testes e desenvolvimento'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={creating} className="flex-1 bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-11">
                  {creating ? 'Criando...' : 'Criar API key'}
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
            <CardTitle className="text-xl font-bold text-vibeblack">Suas chaves de API</CardTitle>
            <CardDescription>{keys.length} {keys.length === 1 ? 'chave criada' : 'chaves criadas'}</CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
              <Plus className="w-5 h-5 mr-2" />Criar chave API
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhuma chave ainda</h3>
              <p className="text-vibegray-dark mb-6">Crie sua primeira API key para começar a integração</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
                <Plus className="w-5 h-5 mr-2" />Criar primeira chave
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {keys.map((apiKey) => (
                <div key={apiKey.id} className="border border-gray-200 rounded-xl p-4 hover:border-vibeyellow/50 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-vibeblack truncate">{apiKey.name}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${apiKey.environment === 'production' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {apiKey.environment === 'production' ? 'Produção' : 'Teste'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-vibegray-dark bg-gray-50 px-2 py-1 rounded flex-1 truncate">
                        {apiKey.key_prefix}{'•'.repeat(20)}
                      </code>
                    </div>

                    <div className="text-xs text-vibegray">
                      Criada em {formatDate(apiKey.created_at)}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleCopy(apiKey.key_prefix)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                        title="Copiar prefixo"
                      >
                        {copiedKey === apiKey.key_prefix ? (
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
                        onClick={() => openDeleteModal(apiKey.id, apiKey.name)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors ml-auto"
                        title="Deletar"
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
        title="Deletar API Key"
        message={`Tem certeza que deseja deletar a chave "${deleteModal.keyName}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, keyId: null, keyName: '' })}
      />
    </div>
  )
}