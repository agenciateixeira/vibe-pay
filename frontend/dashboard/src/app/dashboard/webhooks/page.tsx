'use client'

import { useEffect, useState } from 'react'
import { 
  Webhook, 
  Plus,
  Trash2,
  Play,
  RefreshCw,
  Check,
  X,
  Copy,
  Eye,
  AlertCircle
} from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { useToastContext } from '../layout'

interface WebhookData {
  id: string
  url: string
  events: string[]
  secret: string
  is_active: boolean
  created_at: string
}

interface WebhookLog {
  id: string
  event: string
  status_code: number
  success: boolean
  created_at: string
  response_body?: string
}

const AVAILABLE_EVENTS = [
  { value: 'payment.completed', label: 'Pagamento Concluído' },
  { value: 'payment.failed', label: 'Pagamento Falhou' },
  { value: 'payment.pending', label: 'Pagamento Pendente' },
  { value: 'payment.expired', label: 'Pagamento Expirado' }
]

export default function WebhooksPage() {
  const toast = useToastContext()
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null)
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    url: '',
    events: ['payment.completed']
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    webhookId: string | null
    webhookUrl: string
  }>({
    isOpen: false,
    webhookId: null,
    webhookUrl: ''
  })

  useEffect(() => {
    loadWebhooks()
  }, [])

  const loadWebhooks = async () => {
    try {
      const response = await api.getWebhooks()
      setWebhooks(response.webhooks || [])
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.createWebhook(formData)
      setFormData({ url: '', events: ['payment.completed'] })
      setShowCreateForm(false)
      toast.success('Webhook criado com sucesso!', '✨ Sucesso')
      await loadWebhooks()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar webhook', 'Erro')
    } finally {
      setCreating(false)
    }
  }

  const openDeleteModal = (webhookId: string, webhookUrl: string) => {
    setDeleteModal({
      isOpen: true,
      webhookId,
      webhookUrl
    })
  }

  const handleDelete = async () => {
    if (!deleteModal.webhookId) return
    
    try {
      await api.deleteWebhook(deleteModal.webhookId)
      toast.success('Webhook deletado com sucesso', 'Sucesso')
      await loadWebhooks()
      setDeleteModal({ isOpen: false, webhookId: null, webhookUrl: '' })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar webhook', 'Erro')
    }
  }

  const handleTest = async (webhookId: string) => {
    try {
      const response = await api.testWebhook(webhookId)
      toast.info(response.test_result.message, 'Teste de Webhook')
      if (selectedWebhook?.id === webhookId) {
        await loadLogs(webhookId)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao testar webhook', 'Erro')
    }
  }

  const loadLogs = async (webhookId: string) => {
    try {
      const response = await api.getWebhookLogs(webhookId)
      setLogs(response.logs || [])
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
  }

  const handleViewLogs = async (webhook: WebhookData) => {
    setSelectedWebhook(webhook)
    await loadLogs(webhook.id)
  }

  const handleRetry = async (logId: string) => {
    try {
      const response = await api.retryWebhook(logId)
      toast.info(response.retry_result.message, 'Reenvio de Webhook')
      if (selectedWebhook) {
        await loadLogs(selectedWebhook.id)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar webhook', 'Erro')
    }
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(id)
    toast.success('Copiado para a área de transferência', 'Copiado!')
    setTimeout(() => setCopiedText(null), 2000)
  }

  const toggleEvent = (event: string) => {
    if (formData.events.includes(event)) {
      setFormData({ ...formData, events: formData.events.filter(e => e !== event) })
    } else {
      setFormData({ ...formData, events: [...formData.events, event] })
    }
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
          <p className="text-vibegray-dark font-medium">Carregando webhooks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Webhooks</h1>
        <p className="text-vibegray-dark mt-2">Receba notificações em tempo real sobre eventos</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-vibeblack mb-2">Como funcionam os Webhooks?</h3>
              <p className="text-sm text-vibegray-dark mb-3">
                Webhooks são notificações HTTP enviadas automaticamente para sua aplicação quando eventos específicos ocorrem. Configure uma URL e escolha quais eventos deseja receber.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">Criar novo webhook</CardTitle>
            <CardDescription>Configure uma URL para receber notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-semibold text-vibeblack">URL do Webhook</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://seu-site.com/webhook"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  className="h-11"
                />
                <p className="text-xs text-vibegray-dark">A URL deve aceitar requisições POST com JSON</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-vibeblack">Eventos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_EVENTS.map((event) => (
                    <label key={event.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event.value)}
                        onChange={() => toggleEvent(event.value)}
                        className="w-4 h-4 text-vibeyellow rounded focus:ring-vibeyellow"
                      />
                      <span className="text-sm font-medium text-vibeblack">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={creating || formData.events.length === 0} className="flex-1 bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-11">
                  {creating ? 'Criando...' : 'Criar webhook'}
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
            <CardTitle className="text-xl font-bold text-vibeblack">Seus webhooks</CardTitle>
            <CardDescription>{webhooks.length} {webhooks.length === 1 ? 'webhook configurado' : 'webhooks configurados'}</CardDescription>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
              <Plus className="w-5 h-5 mr-2" />Criar webhook
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vibeyellow/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Webhook className="w-8 h-8 text-vibeyellow" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhum webhook ainda</h3>
              <p className="text-vibegray-dark mb-6">Crie seu primeiro webhook para receber notificações</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold">
                <Plus className="w-5 h-5 mr-2" />Criar primeiro webhook
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border border-gray-200 rounded-xl p-4 hover:border-vibeyellow/50 transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-vibeblack truncate">{webhook.url}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${webhook.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                        {webhook.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span key={event} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                          {AVAILABLE_EVENTS.find(e => e.value === event)?.label || event}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-vibegray-dark bg-gray-50 px-2 py-1 rounded flex-1 truncate">
                        {webhook.secret.slice(0, 20)}...
                      </code>
                      <button 
                        onClick={() => handleCopy(webhook.secret, webhook.id)} 
                        className="text-vibegray-dark hover:text-vibeyellow transition-colors p-1"
                        title="Copiar secret"
                      >
                        {copiedText === webhook.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="text-xs text-vibegray">
                      Criado em {formatDate(webhook.created_at)}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleTest(webhook.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-vibeyellow hover:bg-vibeyellow/90 text-vibeblack rounded-lg font-semibold text-sm transition-colors"
                        title="Testar webhook"
                      >
                        <Play className="w-4 h-4" />
                        <span className="hidden sm:inline">Testar</span>
                      </button>
                      
                      <button
                        onClick={() => handleViewLogs(webhook)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
                        title="Ver logs"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Logs</span>
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(webhook.id, webhook.url)}
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

      {selectedWebhook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle className="text-xl font-bold text-vibeblack">Logs do Webhook</CardTitle>
                <CardDescription className="text-sm">{selectedWebhook.url}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedWebhook(null)}><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="pt-6">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Webhook className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhum log ainda</h3>
                  <p className="text-vibegray-dark">Os eventos aparecerão aqui quando forem enviados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className={`border rounded-xl p-4 ${log.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${log.success ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center`}>
                            {log.success ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold text-vibeblack">{log.event}</p>
                            <p className="text-xs text-vibegray-dark">{formatDate(log.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.status_code || 'N/A'}
                          </span>
                          {!log.success && <Button variant="ghost" size="sm" onClick={() => handleRetry(log.id)} title="Reenviar"><RefreshCw className="w-4 h-4" /></Button>}
                        </div>
                      </div>
                      {log.response_body && (
                        <details className="mt-3">
                          <summary className="text-xs font-medium text-vibegray-dark cursor-pointer hover:text-vibeblack">Ver resposta</summary>
                          <pre className="mt-2 text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">{log.response_body}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar Webhook"
        message={`Tem certeza que deseja deletar o webhook "${deleteModal.webhookUrl}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, webhookId: null, webhookUrl: '' })}
      />
    </div>
  )
}