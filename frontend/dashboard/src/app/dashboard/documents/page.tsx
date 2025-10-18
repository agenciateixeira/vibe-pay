'use client'

import { useEffect, useState } from 'react'
import { FileText, Upload, Trash2, Eye, CheckCircle, Clock, XCircle, AlertCircle, Loader2, User, Building2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToastContext } from '../layout'

interface Document {
  id: string
  document_type: string
  file_name: string
  file_size: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejection_reason: string | null
  uploaded_at: string
}

export default function DocumentsPage() {
  const toast = useToastContext()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [canWithdraw, setCanWithdraw] = useState<any>(null)
  const [accountType, setAccountType] = useState<'pf' | 'pj' | null>(null)

  useEffect(() => {
    loadDocuments()
    checkWithdrawStatus()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await api.getDocuments()
      setDocuments(response.documents || [])
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
      toast.error('Erro ao carregar documentos', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const checkWithdrawStatus = async () => {
    try {
      const response = await api.checkCanWithdraw()
      setCanWithdraw(response)
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const handleFileUpload = async (
    documentType: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB', 'Erro')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPG, PNG ou PDF', 'Erro')
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result as string

        await api.uploadDocument({
          document_type: documentType as any,
          file_name: file.name,
          file_data: base64Data,
          mime_type: file.type
        })

        toast.success('Documento enviado com sucesso!', 'Sucesso')
        await loadDocuments()
        await checkWithdrawStatus()
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar documento', 'Erro')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Deseja realmente deletar este documento?')) return

    try {
      await api.deleteDocument(documentId)
      toast.success('Documento deletado com sucesso', 'Sucesso')
      await loadDocuments()
      await checkWithdrawStatus()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar documento', 'Erro')
    }
  }

  const handleView = async (documentId: string) => {
    try {
      const response = await api.getDocumentUrl(documentId)
      window.open(response.url, '_blank')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao visualizar documento', 'Erro')
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'Em análise', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
      APPROVED: { label: 'Aprovado', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
      REJECTED: { label: 'Rejeitado', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
    }
    return configs[status] || configs.PENDING
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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

  const getDocumentByType = (type: string) => {
    return documents.find(d => d.document_type === type)
  }

  const renderDocumentCard = (type: string, label: string, description: string) => {
    const doc = getDocumentByType(type)
    const statusConfig = doc ? getStatusConfig(doc.status) : null
    const StatusIcon = statusConfig?.icon

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-vibeblack">{label}</h4>
            <p className="text-sm text-vibegray-dark">{description}</p>
          </div>
          {doc && StatusIcon && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {statusConfig.label}
            </span>
          )}
        </div>

        {doc ? (
          <div className="space-y-2">
            <p className="text-sm text-vibegray-dark">
              {doc.file_name} ({formatFileSize(doc.file_size)})
            </p>
            <p className="text-xs text-vibegray">
              Enviado em {formatDate(doc.uploaded_at)}
            </p>
            {doc.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <p className="text-xs text-red-800">
                  <strong>Motivo:</strong> {doc.rejection_reason}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => handleView(doc.id)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              <Button
                onClick={() => handleDelete(doc.id)}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Deletar
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Label
              htmlFor={`upload-${type}`}
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-all ${
                uploading
                  ? 'border-vibeyellow bg-yellow-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-vibeyellow hover:bg-gray-50 cursor-pointer'
              }`}
            >
              <div className="flex flex-col items-center">
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-vibeyellow mb-2 animate-spin" />
                    <p className="text-sm text-vibeyellow font-semibold">Enviando...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Clique para enviar</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG ou PDF (máx 10MB)</p>
                  </>
                )}
              </div>
              <input
                id={`upload-${type}`}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => handleFileUpload(type, e)}
                disabled={uploading}
              />
            </Label>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
          <p className="text-vibegray-dark font-medium">Carregando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Documentos</h1>
        <p className="text-vibegray-dark mt-2">Envie seus documentos para verificação</p>
      </div>

      {/* Status de Verificação */}
      {canWithdraw && (
        <Card className={`border-0 shadow-lg mb-8 ${canWithdraw.can_withdraw ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${canWithdraw.can_withdraw ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                {canWithdraw.can_withdraw ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-vibeblack mb-2">
                  {canWithdraw.can_withdraw ? 'Verificação Completa!' : 'Verificação Pendente'}
                </h3>
                {canWithdraw.can_withdraw ? (
                  <p className="text-sm text-green-800">
                    Todos os requisitos foram atendidos. Você já pode solicitar saques!
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-yellow-800 mb-2">
                      Complete os requisitos abaixo para poder solicitar saques:
                    </p>
                    <ul className="text-sm text-yellow-900 space-y-1">
                      {canWithdraw.pending_requirements.map((req: string, index: number) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seleção de Tipo de Conta */}
      {!accountType && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-vibeblack">Tipo de Conta</CardTitle>
            <CardDescription>Selecione o tipo da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAccountType('pf')}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-vibeblack text-lg mb-2">Pessoa Física</h3>
                <p className="text-sm text-vibegray-dark">
                  CPF + Documento de Identidade + Comprovante de Endereço
                </p>
              </button>

              <button
                onClick={() => setAccountType('pj')}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <Building2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-vibeblack text-lg mb-2">Pessoa Jurídica</h3>
                <p className="text-sm text-vibegray-dark">
                  CNPJ + Contrato Social + CNH + Comprovante de Endereço
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos Pessoa Física */}
      {accountType === 'pf' && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-vibeblack">
                  <User className="w-5 h-5 inline mr-2" />
                  Documentos Pessoa Física
                </CardTitle>
                <CardDescription>Envie os documentos necessários</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAccountType(null)}>
                Alterar Tipo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {renderDocumentCard('rg', 'RG', 'Registro Geral (frente e verso)')}
              {renderDocumentCard('cnh', 'CNH', 'Carteira Nacional de Habilitação')}
              {renderDocumentCard('passport', 'Passaporte', 'Passaporte válido')}
              <div className="col-span-full">
                <p className="text-sm text-vibegray-dark mb-4">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Escolha UMA das opções acima (RG, CNH ou Passaporte)
                </p>
              </div>
              {renderDocumentCard('comprovante_residencia', 'Comprovante de Residência', 'Conta de luz, água ou telefone (máx 90 dias)')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos Pessoa Jurídica */}
      {accountType === 'pj' && (
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-vibeblack">
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Documentos Pessoa Jurídica
                </CardTitle>
                <CardDescription>Envie os documentos da empresa e do representante legal</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAccountType(null)}>
                Alterar Tipo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-vibeblack mb-4">Documentos da Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDocumentCard('cnpj', 'CNPJ', 'Cartão CNPJ da empresa')}
                  {renderDocumentCard('contrato_social', 'Contrato Social', 'Contrato social ou documento MEI')}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-vibeblack mb-4">Documentos do Representante Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderDocumentCard('cnh', 'CNH', 'CNH do representante legal')}
                  {renderDocumentCard('comprovante_residencia', 'Comprovante de Residência', 'Conta de luz, água ou telefone (máx 90 dias)')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}