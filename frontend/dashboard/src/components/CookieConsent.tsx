'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { Button } from './ui/button'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('vibe-pay-cookie-consent')
    if (!consent) {
      // Mostrar banner após 1 segundo
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('vibe-pay-cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem('vibe-pay-cookie-consent', 'declined')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-5 duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-white border-2 border-vibeyellow rounded-2xl shadow-2xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-vibeyellow/5 via-transparent to-vibeyellow/10"></div>

          {/* Close button */}
          <button
            onClick={declineCookies}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-vibegray" />
          </button>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-vibeyellow/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-vibeyellow" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-vibeblack mb-2">
                  Nós valorizamos sua privacidade
                </h3>
                <p className="text-sm sm:text-base text-vibegray-dark leading-relaxed">
                  Utilizamos cookies essenciais para melhorar sua experiência, manter sua sessão segura e analisar o uso da plataforma.
                  Ao continuar navegando, você concorda com nossa{' '}
                  <Link href="/privacidade" className="text-vibeyellow hover:underline font-semibold">
                    Política de Privacidade
                  </Link>
                  {' '}e{' '}
                  <Link href="/termos" className="text-vibeyellow hover:underline font-semibold">
                    Termos de Uso
                  </Link>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={declineCookies}
                  className="w-full sm:w-auto border-vibegray-dark text-vibegray-dark hover:bg-gray-100"
                >
                  Recusar
                </Button>
                <Button
                  onClick={acceptCookies}
                  className="w-full sm:w-auto bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold shadow-lg shadow-vibeyellow/30"
                >
                  Aceitar Cookies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
