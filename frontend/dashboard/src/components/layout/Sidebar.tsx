'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Receipt, 
  Key,
  Webhook,
  Settings,
  Menu,
  X,
  ChevronRight,
  Link as LinkIcon,
  Repeat,
  Users,
  DollarSign,
  FileText,
  Package
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Links de Pagamento',
    href: '/dashboard/payment-links',
    icon: LinkIcon
  },
  {
    title: 'Cobranças',
    href: '/dashboard/charges',
    icon: Repeat
  },
  {
    title: 'Produtos',
    href: '/dashboard/products',
    icon: Package
  },
  {
    title: 'Clientes',
    href: '/dashboard/customers',
    icon: Users
  },
  {
    title: 'Saques',
    href: '/dashboard/withdrawals',
    icon: DollarSign
  },
  {
    title: 'Documentos',
    href: '/dashboard/documents',
    icon: FileText
  },
  {
    title: 'Transações',
    href: '/dashboard/transactions',
    icon: Receipt
  },
  {
    title: 'API Keys',
    href: '/dashboard/api',
    icon: Key
  },
  {
    title: 'Webhooks',
    href: '/dashboard/webhooks',
    icon: Webhook
  },
  {
    title: 'Logs de Webhooks',
    href: '/dashboard/webhook-logs',
    icon: Webhook
  },
  {
    title: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header - Fixed top */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-21 h-12 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Vibe Pay" 
              width={64} 
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-vibeblack hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out z-40
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="hidden lg:flex items-center justify-center p-6 border-b border-gray-100">
            <div className="relative w-26 h-12 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Vibe Pay" 
                width={96} 
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>

          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative w-16 h-10 flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Vibe Pay" 
                  width={64} 
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-vibeblack hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 font-medium text-sm group
                    ${
                      active
                        ? 'bg-vibeyellow/10 text-vibeblack'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-vibeyellow' : 'text-gray-500'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-vibeyellow" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1.5">Ambiente</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold text-green-700 truncate">Produção</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}