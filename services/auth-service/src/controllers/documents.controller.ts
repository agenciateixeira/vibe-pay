import { FastifyRequest, FastifyReply } from 'fastify'
import { SupabaseService } from '../services/supabase.service.js'

interface UploadDocumentBody {
  document_type: 'cnpj' | 'contrato_social' | 'rg' | 'cnh' | 'passport' | 'comprovante_residencia'
  file_name: string
  file_data: string // Base64
  mime_type: string
}

export async function uploadDocument(
  request: FastifyRequest<{ Body: UploadDocumentBody }>,
  reply: FastifyReply
) {
  try {
    const supabaseService = new SupabaseService()
    const supabase = supabaseService.getClient()
    
    const authHeader = request.headers.authorization
    const { document_type, file_name, file_data, mime_type } = request.body

    console.log('📄 Upload de documento:', document_type)

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      console.error('❌ Usuário não encontrado:', userError)
      return reply.code(404).send({ error: 'User not found' })
    }

    // Converter base64 para buffer
    const base64Data = file_data.includes(',') ? file_data.split(',')[1] : file_data
    const buffer = Buffer.from(base64Data, 'base64')
    const file_size = buffer.length

    console.log('📦 Tamanho do arquivo:', file_size, 'bytes')

    // Validar tamanho (max 10MB)
    if (file_size > 10 * 1024 * 1024) {
      return reply.code(400).send({ error: 'File too large. Max 10MB' })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(mime_type)) {
      return reply.code(400).send({ error: 'Invalid file type. Use JPG, PNG or PDF' })
    }

    // Upload para Supabase Storage
    const timestamp = Date.now()
    const sanitizedFileName = file_name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const file_path = `${user.id}/${document_type}_${timestamp}_${sanitizedFileName}`
    
    console.log('📤 Fazendo upload para:', file_path)
    
    const { error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(file_path, buffer, {
        contentType: mime_type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError)
      return reply.code(500).send({ error: `Upload failed: ${uploadError.message}` })
    }

    console.log('✅ Upload realizado com sucesso')

    // Salvar registro no banco
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .insert({
        user_id: userData.id,
        document_type,
        file_name,
        file_path,
        file_size,
        mime_type,
        status: 'PENDING'
      })
      .select()
      .single()

    if (docError) {
      console.error('❌ Erro ao salvar documento:', docError)
      
      // Tentar deletar o arquivo que foi feito upload
      await supabase.storage
        .from('user-documents')
        .remove([file_path])
      
      return reply.code(500).send({ error: `Failed to save document: ${docError.message}` })
    }

    console.log('✅ Documento registrado no banco:', document.id)

    return reply.send({
      success: true,
      document: {
        id: document.id,
        document_type: document.document_type,
        status: document.status,
        uploaded_at: document.uploaded_at
      }
    })
  } catch (error: any) {
    console.error('❌ Erro geral ao fazer upload:', error)
    return reply.code(500).send({ error: error.message || 'Internal server error' })
  }
}

export async function listDocuments(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const supabaseService = new SupabaseService()
    const supabase = supabaseService.getClient()
    
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    const { data: documents, error: docsError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })

    if (docsError) {
      return reply.code(500).send({ error: 'Failed to fetch documents' })
    }

    return reply.send({
      success: true,
      documents: documents || []
    })
  } catch (error: any) {
    console.error('❌ Erro ao listar documentos:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function deleteDocument(
  request: FastifyRequest<{ Params: { documentId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabaseService = new SupabaseService()
    const supabase = supabaseService.getClient()
    
    const authHeader = request.headers.authorization
    const { documentId } = request.params

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    // Buscar documento
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userData.id)
      .single()

    if (docError || !document) {
      return reply.code(404).send({ error: 'Document not found' })
    }

    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([document.file_path])

    if (storageError) {
      console.error('❌ Erro ao deletar do storage:', storageError)
    }

    // Deletar do banco
    const { error: deleteError } = await supabase
      .from('user_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      return reply.code(500).send({ error: 'Failed to delete document' })
    }

    return reply.send({
      success: true,
      message: 'Document deleted successfully'
    })
  } catch (error: any) {
    console.error('❌ Erro ao deletar documento:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function getDocumentUrl(
  request: FastifyRequest<{ Params: { documentId: string } }>,
  reply: FastifyReply
) {
  try {
    const supabaseService = new SupabaseService()
    const supabase = supabaseService.getClient()
    
    const authHeader = request.headers.authorization
    const { documentId } = request.params

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    // Buscar documento
    const { data: document, error: docError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userData.id)
      .single()

    if (docError || !document) {
      return reply.code(404).send({ error: 'Document not found' })
    }

    // Gerar URL assinada (válida por 1 hora)
    const { data, error: urlError } = await supabase.storage
      .from('user-documents')
      .createSignedUrl(document.file_path, 3600)

    if (urlError || !data) {
      return reply.code(500).send({ error: 'Failed to generate URL' })
    }

    return reply.send({
      success: true,
      url: data.signedUrl
    })
  } catch (error: any) {
    console.error('❌ Erro ao gerar URL:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export async function checkCanWithdraw(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const supabaseService = new SupabaseService()
    const supabase = supabaseService.getClient()
    
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, can_withdraw, two_factor_enabled, documents_verified')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      return reply.code(404).send({ error: 'User not found' })
    }

    // Verificar documentos
    const { data: documents } = await supabase
      .from('user_documents')
      .select('document_type, status')
      .eq('user_id', userData.id)

    const hasIdentityDoc = documents?.some(d => 
      ['rg', 'cnh', 'passport'].includes(d.document_type) && d.status === 'APPROVED'
    )
    const hasAddressProof = documents?.some(d => 
      d.document_type === 'comprovante_residencia' && d.status === 'APPROVED'
    )
    const hasCompanyDoc = documents?.some(d => 
      ['cnpj', 'contrato_social'].includes(d.document_type) && d.status === 'APPROVED'
    )

    const requirements = {
      two_factor_enabled: userData.two_factor_enabled || false,
      has_identity_document: hasIdentityDoc || false,
      has_address_proof: hasAddressProof || false,
      has_company_document: hasCompanyDoc || false
    }

    const can_withdraw = 
      requirements.two_factor_enabled &&
      requirements.has_identity_document &&
      requirements.has_address_proof &&
      requirements.has_company_document

    return reply.send({
      success: true,
      can_withdraw,
      requirements,
      pending_requirements: [
        !requirements.two_factor_enabled && 'Ativar autenticação de dois fatores',
        !requirements.has_identity_document && 'Enviar documento de identidade (RG, CNH ou Passaporte)',
        !requirements.has_address_proof && 'Enviar comprovante de residência',
        !requirements.has_company_document && 'Enviar documento da empresa (CNPJ ou Contrato Social)'
      ].filter(Boolean)
    })
  } catch (error: any) {
    console.error('❌ Erro ao verificar requisitos:', error)
    return reply.code(500).send({ error: error.message })
  }
}