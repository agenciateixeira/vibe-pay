'use client'

import { useState, useCallback } from 'react'

interface ToastOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      type: 'info',
      duration: 5000,
      ...options
    }
    setToasts((prev) => [...prev, toast])
    return id
  }, [])

  const success = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'success' })
  }, [showToast])

  const error = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'error' })
  }, [showToast])

  const warning = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'warning' })
  }, [showToast])

  const info = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'info' })
  }, [showToast])

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    closeToast
  }
}