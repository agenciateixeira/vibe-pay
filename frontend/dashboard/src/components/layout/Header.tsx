'use client'

import { useState, useEffect } from 'react'
import { Bell, LogOut, User, ChevronDown, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

interface HeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (value: boolean) => void
}

export function Header({ isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [userName, setUserName] = useState('Usuário')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadUserName()
  }, [])

  const loadUserName = async () => {
    try {
      const response = await api.getProfile()
      setUserName(response.userData?.full_name || 'Usuário')
      setUserEmail(response.user?.email || '')
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const handleLogout = async () => {
    try {
      // Tentar fazer logout no backend
      await api.logout().catch(() => {
        // Ignorar erro do backend
        console.log('Erro ao fazer logout no backend (ignorado)')
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      // Sempre limpar token e redirecionar
      api.clearToken()
      router.push('/login')
    }
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 fixed top-0 left-0 right-0 z-50 lg:relative lg:z-auto lg:left-auto lg:right-auto">
      {/* Menu Sanduíche - Mobile Only */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden w-10 h-10 flex items-center justify-center text-vibeblack hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Logo Centralizada - Mobile Only */}
      <Link href="/dashboard" className="lg:hidden absolute left-1/2 -translate-x-1/2">
        <div className="relative w-20 h-20">
          <Image
            src="/logo.png"
            alt="Vibe Pay"
            width={80}
            height={80}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </Link>

      {/* Espaço vazio para desktop */}
      <div className="hidden lg:block flex-1" />

      <div className="flex items-center gap-4">
        {/* Sino de Notificações */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-gray-600 hover:text-vibeblack hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-vibeyellow rounded-full" />
          </button>

          {isNotificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-4xl">👨‍🍳</span>
                  </div>
                  <p className="text-lg font-semibold text-vibeblack mb-2">
                    Estamos cozinhando...
                  </p>
                  <p className="text-sm text-vibegray-dark">
                    Em breve você terá notificações aqui!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dropdown do Usuário */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-vibeyellow rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-vibeblack" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-vibeblack">{userName}</p>
              <p className="text-xs text-vibegray-dark">{userEmail}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Configurações
                </Link>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}