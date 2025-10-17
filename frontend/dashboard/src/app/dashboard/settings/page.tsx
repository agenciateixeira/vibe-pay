'use client'

import { useEffect, useState } from 'react'
import { User, Building2, Key, Save, Loader2, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToastContext } from '../layout'

export default function SettingsPage() {
  const toast = useToastContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    company_name: ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await api.getProfile()
      setProfile(response)
      
      setFormData({
        full_name: response.userData?.full_name || '',
        email: response.user?.email || '',
        phone: response.userData?.phone || '',
        cpf_cnpj: response.userData?.cpf_cnpj || '',
        company_name: response.userData?.company_name || ''
      })
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      toast.error('Erro ao carregar perfil', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        cpf_cnpj: formData.cpf_cnpj,
        company_name: formData.company_name
      })
      
      toast.success('Perfil atualizado com sucesso!', 'Sucesso')
      await loadProfile()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil', 'Erro')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('As senhas não coincidem', 'Erro')
      return
    }

    if (passwordData.new_password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres', 'Erro')
      return
    }

    try {
      await api.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      toast.success('Senha alterada com sucesso!', 'Sucesso')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha', 'Erro')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-vibeyellow animate-spin" />
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-vibeblack">Configurações</h1>
        <p className="text-vibegray-dark mt-2">Gerencie suas informações e preferências</p>
      </div>

      {/* Informações Pessoais */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-xl font-bold text-vibeblack">Informações Pessoais</CardTitle>
          </div>
          <CardDescription>Atualize seus dados pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-vibegray-dark">O email não pode ser alterado</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informações da Empresa */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-xl font-bold text-vibeblack">Informações da Empresa</CardTitle>
          </div>
          <CardDescription>Dados da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Nome da sua empresa"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Documentos da Empresa:</strong> Acesse a aba{' '}
              <a href="/dashboard/documents" className="underline font-semibold">
                Documentos
              </a>{' '}
              para enviar CNPJ, Contrato Social e outros documentos necessários.
            </p>
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-red-600" />
            <CardTitle className="text-xl font-bold text-vibeblack">Segurança</CardTitle>
          </div>
          <CardDescription>Altere sua senha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Senha Atual</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">Nova Senha</Label>
            <Input
              id="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              placeholder="Confirme sua nova senha"
            />
          </div>

          <Button 
            onClick={handleChangePassword}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            <Shield className="w-4 h-4 mr-2" />
            Alterar Senha
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}