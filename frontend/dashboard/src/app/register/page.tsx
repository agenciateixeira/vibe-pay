'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, User, Phone, FileText, Building2, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    company_name: '',
    password: '',
    confirm_password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirm_password) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      await api.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        cpf_cnpj: formData.cpf_cnpj,
        phone: formData.phone,
        company_name: formData.company_name
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full text-center space-y-6">
          <Image
            src="/logo.png"
            alt="Vibe Pay"
            width={200}
            height={80}
            className="object-contain mx-auto"
            priority
          />
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-vibeblack mb-2">Conta criada com sucesso!</h2>
            <p className="text-vibegray-dark">Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Vibe Pay"
              width={200}
              height={80}
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-black text-vibeblack">Crie sua conta</h1>
            <p className="text-vibegray-dark mt-2">Comece a receber pagamentos hoje</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Erro ao criar conta</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-semibold text-vibeblack">
                Nome Completo *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-vibeblack">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-vibeblack">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-11"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj" className="text-sm font-semibold text-vibeblack">
                  CPF/CNPJ
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="cpf_cnpj"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    className="pl-10 h-11"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm font-semibold text-vibeblack">
                Nome da Empresa
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Nome da sua empresa"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-vibeblack">
                Senha *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-sm font-semibold text-vibeblack">
                Confirmar Senha *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="pl-10 h-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-vibegray-dark">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-vibeyellow hover:text-vibeyellow-dark transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-vibeyellow to-vibeyellow-dark items-center justify-center p-12">
        <div className="text-center text-vibeblack max-w-lg">
          <h2 className="text-4xl font-black mb-6">Comece em minutos</h2>
          <p className="text-xl opacity-90 mb-8">
            Configure sua conta em poucos passos e comece a receber pagamentos imediatamente.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Sem mensalidade</h3>
                <p className="opacity-90">Pague apenas por transação realizada</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Receba em segundos</h3>
                <p className="opacity-90">Pagamentos PIX creditados instantaneamente</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">API completa</h3>
                <p className="opacity-90">Integre com sua plataforma facilmente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}