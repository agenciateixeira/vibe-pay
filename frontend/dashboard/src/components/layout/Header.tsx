'use client'

import { useState, useEffect } from 'react'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export function Header() {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 lg:relative lg:z-auto">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-vibeblack hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-vibeyellow rounded-full" />
        </button>

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