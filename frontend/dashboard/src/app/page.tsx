'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Zap,
  Shield,
  BarChart3,
  Code2,
  Bell,
  MessageSquare,
  Check,
  ArrowRight,
  ChevronRight,
  Calculator
} from 'lucide-react'

export default function Home() {
  const [transactionValue, setTransactionValue] = useState('100')
  const [transactionCount, setTransactionCount] = useState('100')

  const calculateFees = (value: number, count: number) => {
    const vibePay = count * 0.95
    const mercadoPago = count * value * 0.0399 // 3,99%
    const pagseguro = count * value * 0.0449 // 4,49%

    return {
      vibePay,
      mercadoPago,
      pagseguro,
      economyVsMercadoPago: mercadoPago - vibePay,
      economyVsPagSeguro: pagseguro - vibePay
    }
  }

  const fees = calculateFees(parseFloat(transactionValue) || 0, parseInt(transactionCount) || 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Header com Liquid Glass */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 backdrop-blur-xl bg-white/70"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-vibeyellow/50 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 hover:scale-105 transition-transform">
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

            {/* CTAs */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="relative text-vibeblack hover:text-vibeyellow font-semibold backdrop-blur-sm text-sm sm:text-base px-3 sm:px-4"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="relative bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold shadow-lg shadow-vibeyellow/20 hover:shadow-vibeyellow/40 transition-all overflow-hidden text-sm sm:text-base px-4 sm:px-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10">Começar grátis</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-20 sm:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-vibeyellow/5 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-vibeyellow/30 rounded-full px-4 sm:px-5 py-2 shadow-sm">
              <div className="w-2 h-2 bg-vibeyellow rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold text-vibeblack">
                R$ 0,95 por transação PIX
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-vibeblack leading-[0.95] tracking-tight px-4">
              Receba pagamentos
              <span className="block bg-gradient-to-r from-vibeyellow via-vibeyellow-dark to-vibeyellow bg-clip-text text-transparent">
                sem complicação
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-vibegray-dark max-w-3xl mx-auto leading-relaxed px-4">
              Gateway de pagamento PIX completo para <strong className="text-vibeblack">empreendedores digitais</strong>. Receba em tempo real com a menor taxa do mercado.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 px-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold px-8 sm:px-10 h-12 sm:h-14 text-sm sm:text-base shadow-xl shadow-vibeyellow/30 hover:shadow-2xl hover:shadow-vibeyellow/40 transition-all group">
                  Começar agora
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-vibeblack text-vibeblack hover:bg-vibeblack hover:text-white px-8 sm:px-10 h-12 sm:h-14 text-sm sm:text-base font-semibold group">
                  Ver demonstração
                  <ChevronRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="pt-8 sm:pt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-vibegray px-4">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-vibeyellow" />
                <span>Sem mensalidade</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-vibeyellow" />
                <span>Setup em 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-vibeyellow" />
                <span>Receba instantâneo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 bg-vibeblack relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-vibeyellow rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-vibeyellow rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-vibeyellow mb-2 sm:mb-3">R$ 0,95</div>
              <p className="text-white/80 text-base sm:text-lg">Taxa fixa por transação</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-vibeyellow mb-2 sm:mb-3">&lt;2s</div>
              <p className="text-white/80 text-base sm:text-lg">Confirmação instantânea</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-black text-vibeyellow mb-2 sm:mb-3">0</div>
              <p className="text-white/80 text-base sm:text-lg">Taxa de setup ou mensalidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-vibeblack mb-4 sm:mb-6">
                Como funciona
              </h2>
              <p className="text-lg sm:text-xl text-vibegray-dark max-w-2xl mx-auto">
                Três passos simples para começar a receber
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="relative">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-shadow h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-vibeyellow/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl font-black text-vibeyellow">01</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-vibeblack mb-3 sm:mb-4">
                    Crie sua conta
                  </h3>
                  <p className="text-vibegray-dark leading-relaxed">
                    Cadastro rápido em 2 minutos. Não precisa de documentos complicados ou análise de crédito.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-shadow h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-vibeyellow/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl font-black text-vibeyellow">02</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-vibeblack mb-3 sm:mb-4">
                    Gere QR Codes
                  </h3>
                  <p className="text-vibegray-dark leading-relaxed">
                    Crie cobranças PIX instantâneas. Compartilhe via WhatsApp, email ou link direto.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-shadow h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-vibeyellow/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-xl sm:text-2xl font-black text-vibeyellow">03</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-vibeblack mb-3 sm:mb-4">
                    Receba na hora
                  </h3>
                  <p className="text-vibegray-dark leading-relaxed">
                    Confirmação automática em tempo real. O dinheiro cai direto na sua conta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-vibeblack mb-4 sm:mb-6">
                Tudo que você precisa
              </h2>
              <p className="text-lg sm:text-xl text-vibegray-dark max-w-2xl mx-auto">
                Ferramentas completas para seu negócio crescer
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: Zap,
                  title: 'PIX Instantâneo',
                  description: 'Confirmação em menos de 2 segundos com webhook automático'
                },
                {
                  icon: BarChart3,
                  title: 'Dashboard Completo',
                  description: 'Acompanhe métricas e transações em tempo real'
                },
                {
                  icon: Code2,
                  title: 'API REST',
                  description: 'Documentação completa para integrar com seu sistema'
                },
                {
                  icon: Bell,
                  title: 'Webhooks',
                  description: 'Notificações instantâneas de cada pagamento recebido'
                },
                {
                  icon: Shield,
                  title: 'Segurança',
                  description: 'Criptografia de ponta a ponta em todas as operações'
                },
                {
                  icon: MessageSquare,
                  title: 'Suporte Ágil',
                  description: 'Time disponível via WhatsApp para ajudar você'
                },
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-vibeyellow/10 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-vibeyellow/20 transition-colors">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-vibeyellow" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-vibeblack mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-vibegray-dark leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-vibeblack mb-4 sm:mb-6">
                Preço simples e justo
              </h2>
              <p className="text-lg sm:text-xl text-vibegray-dark">
                Sem pegadinhas. Sem taxas escondidas.
              </p>
            </div>

            <div className="bg-white border-2 border-vibeyellow rounded-3xl p-8 sm:p-12 shadow-xl">
              <div className="text-center mb-8 sm:mb-10">
                <div className="text-5xl sm:text-7xl font-black text-vibeblack mb-2">R$ 0,95</div>
                <p className="text-xl sm:text-2xl text-vibegray">por transação PIX</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {[
                  'Sem mensalidade',
                  'Sem taxa de setup',
                  'Recebimento instantâneo',
                  'Dashboard completo incluído',
                  'API e webhooks ilimitados',
                  'Suporte prioritário via WhatsApp',
                  'Sem limite de transações',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-vibeyellow rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-vibeblack" strokeWidth={3} />
                    </div>
                    <span className="text-base sm:text-lg text-vibeblack font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" className="block">
                <Button size="lg" className="w-full bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold h-12 sm:h-14 text-sm sm:text-base shadow-xl shadow-vibeyellow/30 hover:shadow-2xl hover:shadow-vibeyellow/40 transition-all">
                  Começar agora
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Calculadora de Comparação */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-vibeyellow/10 border border-vibeyellow/30 rounded-full px-4 py-2 mb-4 sm:mb-6">
                <Calculator className="w-4 h-4 text-vibeyellow" />
                <span className="text-sm font-semibold text-vibeblack">Calculadora de Economia</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-vibeblack mb-4 sm:mb-6">
                Economize até <span className="text-vibeyellow">90%</span> em taxas
              </h2>
              <p className="text-lg sm:text-xl text-vibegray-dark">
                Compare quanto você pagaria com cada plataforma
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-vibeblack mb-2">
                    Valor médio por transação (R$)
                  </label>
                  <Input
                    type="number"
                    value={transactionValue}
                    onChange={(e) => setTransactionValue(e.target.value)}
                    className="h-12 text-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-vibeblack mb-2">
                    Número de transações por mês
                  </label>
                  <Input
                    type="number"
                    value={transactionCount}
                    onChange={(e) => setTransactionCount(e.target.value)}
                    className="h-12 text-lg"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-vibeyellow to-vibeyellow-dark rounded-2xl p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-vibeblack text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MELHOR
                  </div>
                  <h3 className="font-bold text-vibeblack text-lg mb-2">Vibe Pay</h3>
                  <div className="text-4xl font-black text-vibeblack mb-1">
                    R$ {fees.vibePay.toFixed(2)}
                  </div>
                  <p className="text-sm text-vibeblack/80">R$ 0,95 por transação</p>
                </div>

                <div className="bg-gray-100 rounded-2xl p-6 text-center">
                  <h3 className="font-bold text-vibegray-dark text-lg mb-2">Mercado Pago</h3>
                  <div className="text-4xl font-black text-vibegray-dark mb-1">
                    R$ {fees.mercadoPago.toFixed(2)}
                  </div>
                  <p className="text-sm text-vibegray">3,99% por transação</p>
                  <div className="mt-3 text-sm text-red-600 font-semibold">
                    +R$ {fees.economyVsMercadoPago.toFixed(2)}/mês
                  </div>
                </div>

                <div className="bg-gray-100 rounded-2xl p-6 text-center">
                  <h3 className="font-bold text-vibegray-dark text-lg mb-2">PagSeguro</h3>
                  <div className="text-4xl font-black text-vibegray-dark mb-1">
                    R$ {fees.pagseguro.toFixed(2)}
                  </div>
                  <p className="text-sm text-vibegray">4,49% por transação</p>
                  <div className="mt-3 text-sm text-red-600 font-semibold">
                    +R$ {fees.economyVsPagSeguro.toFixed(2)}/mês
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-lg">
                  <Check className="w-6 h-6" />
                  <span>Você economiza até R$ {Math.max(fees.economyVsMercadoPago, fees.economyVsPagSeguro).toFixed(2)} por mês com Vibe Pay!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 sm:py-32 bg-vibeblack relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-vibeyellow rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
              Comece a receber
              <span className="block text-vibeyellow mt-2">pagamentos hoje</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Junte-se a centenas de empreendedores que já confiam no Vibe Pay
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-vibeyellow hover:bg-vibeyellow-dark text-vibeblack font-bold px-10 sm:px-12 h-12 sm:h-14 text-sm sm:text-base shadow-2xl shadow-vibeyellow/40">
                Criar conta grátis
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-8 sm:gap-12 mb-8 sm:mb-12">
              {/* Logo */}
              <div className="max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Vibe Pay"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm sm:text-base text-vibegray-dark leading-relaxed">
                  Gateway de pagamento PIX completo para empreendedores digitais. Receba com segurança e rapidez.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
                <div>
                  <h4 className="font-bold text-vibeblack mb-3 sm:mb-4 text-sm sm:text-base">Produto</h4>
                  <ul className="space-y-2">
                    <li><a href="#como-funciona" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Como funciona</a></li>
                    <li><a href="#recursos" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Recursos</a></li>
                    <li><a href="#" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Preços</a></li>
                    <li><a href="#" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">API</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-vibeblack mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Sobre</a></li>
                    <li><a href="#" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Blog</a></li>
                    <li><a href="#" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Carreira</a></li>
                    <li><a href="#" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Contato</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-vibeblack mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
                  <ul className="space-y-2">
                    <li><Link href="/termos" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Termos de Uso</Link></li>
                    <li><Link href="/privacidade" className="text-sm text-vibegray-dark hover:text-vibeyellow transition">Privacidade</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright */}
      <div className="relative py-4 sm:py-6 overflow-hidden border-t border-gray-100">
        <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-vibeyellow/5 via-white to-vibeyellow/10"></div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl"></div>
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-vibeyellow/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-vibeyellow/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="backdrop-blur-md bg-white/40 border border-white/60 rounded-full px-6 sm:px-8 py-2 sm:py-3 shadow-xl">
              <p className="text-xs sm:text-sm text-vibeblack font-semibold text-center">
                © 2025 Vibe Pay - Todos os direitos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}