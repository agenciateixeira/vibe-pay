'use client'

import { useEffect, useState } from 'react'
import { Webhook, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Loader2, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToastContext } from '../layout'

interface WebhookLog {
  id: string
  event_type: string
  correlation_id: string | null
  charge_id: string | null
  transaction_id: string | null
  status: string
  value: number | null
  payload: any
  processed: boolean
  error_message: string | null
  created_at: string
  processed_at: string | null
}

export default function WebhookLogsPage() {
  const toast = useToastContext()
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/openpix/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setLogs(data.logs || [])
      } else {
        toast.error('Erro ao carregar logs', 'Erro')
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(dateString))
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusConfig = (log: WebhookLog) => {
    if (log.processed && !log.error_message) {
      return {
        label: 'Processado',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle
      }
    } else if (log.error_message) {
      return {
        label: 'Erro',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle
      }
    } else {
      return {
        label: 'Pendente',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-vibeblack">Logs de Webhooks</h1>
            <p className="text-vibegray-dark mt-2">Histórico de notificações da OpenPix</p>
          </div>
          <Button onClick={loadLogs} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Webhook className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-vibeblack mb-2">Webhooks da OpenPix</h3>
              <p className="text-sm text-vibegray-dark">
                Todos os webhooks recebidos da OpenPix são registrados aqui. Você pode ver detalhes de cada notificação e verificar se foram processados com sucesso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-vibeblack">
            {logs.length} {logs.length === 1 ? 'webhook recebido' : 'webhooks recebidos'}
          </CardTitle>
          <CardDescription>Histórico completo de notificações</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Webhook className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-vibeblack mb-2">Nenhum webhook ainda</h3>
              <p className="text-vibegray-dark">Os webhooks da OpenPix aparecerão aqui quando forem recebidos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const statusConfig = getStatusConfig(log)
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-vibeblack text-lg">{log.event_type}</span>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 border ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                            {log.correlation_id && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="text-vibegray-dark truncate">ID: {log.correlation_id}</span>
                              </div>
                            )}
                            
                            {log.transaction_id && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-vibegray-dark truncate">TX: {log.transaction_id}</span>
                              </div>
                            )}
                            
                            {log.value && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                <span className="text-vibegray-dark font-semibold">{formatCurrency(log.value)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-vibegray">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(log.created_at)}
                          </div>
                        </div>
                      </div>

                      {log.error_message && (
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-sm text-red-900">
                            <XCircle className="w-4 h-4 inline mr-1" />
                            <strong>Erro:</strong> {log.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-vibeblack">
                    Detalhes do Webhook
                  </CardTitle>
                  <CardDescription>{selectedLog.event_type}</CardDescription>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="font-semibold text-vibeblack">Event Type:</span>
                  <span className="text-vibegray-dark ml-2">{selectedLog.event_type}</span>
                </div>
                
                {selectedLog.correlation_id && (
                  <div>
                    <span className="font-semibold text-vibeblack">Correlation ID:</span>
                    <span className="text-vibegray-dark ml-2 font-mono text-sm">{selectedLog.correlation_id}</span>
                  </div>
                )}
                
                {selectedLog.transaction_id && (
                  <div>
                    <span className="font-semibold text-vibeblack">Transaction ID:</span>
                    <span className="text-vibegray-dark ml-2 font-mono text-sm">{selectedLog.transaction_id}</span>
                  </div>
                )}
                
                {selectedLog.value && (
                  <div>
                    <span className="font-semibold text-vibeblack">Valor:</span>
                    <span className="text-vibegray-dark ml-2 font-bold">{formatCurrency(selectedLog.value)}</span>
                  </div>
                )}
                
                <div>
                  <span className="font-semibold text-vibeblack">Status:</span>
                  <span className="text-vibegray-dark ml-2">{selectedLog.status}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-vibeblack">Processado:</span>
                  <span className="text-vibegray-dark ml-2">{selectedLog.processed ? 'Sim' : 'Não'}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-vibeblack">Recebido em:</span>
                  <span className="text-vibegray-dark ml-2">{formatDateTime(selectedLog.created_at)}</span>
                </div>
                
                {selectedLog.processed_at && (
                  <div>
                    <span className="font-semibold text-vibeblack">Processado em:</span>
                    <span className="text-vibegray-dark ml-2">{formatDateTime(selectedLog.processed_at)}</span>
                  </div>
                )}
              </div>

              {selectedLog.error_message && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-900">
                    <strong>Erro:</strong> {selectedLog.error_message}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-bold text-vibeblack mb-2">Payload Completo:</h3>
                <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-auto max-h-96 text-xs">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}