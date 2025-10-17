'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ToastContainer } from '@/components/ui/toast-container'
import { useToast } from '@/hooks/useToast'
import { api } from '@/lib/api'

// Criar contexto global para toast
const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.getProfile()
        setLoading(false)
      } catch (error) {
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-vibeyellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-vibegray-dark font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastContext.Provider value={toast}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64 pt-14 lg:pt-0">
          <Header />
          <main>
            {children}
          </main>
        </div>
        <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      </div>
    </ToastContext.Provider>
  )
}