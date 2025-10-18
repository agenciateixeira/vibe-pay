import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Scale, Calendar, Mail } from 'lucide-react'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-vibeyellow/5">
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-14 h-14 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Vibe Pay"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="hidden sm:block text-xl font-bold text-vibeblack">Vibe Pay</span>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2 border-vibeyellow/30 hover:bg-vibeyellow/10 hover:border-vibeyellow">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-vibeyellow to-vibeyellow/70 rounded-3xl mb-6 shadow-lg shadow-vibeyellow/30">
            <Scale className="w-10 h-10 text-vibeblack" />
          </div>
          <h1 className="text-5xl font-black text-vibeblack mb-4 bg-gradient-to-r from-vibeblack to-vibeblack/70 bg-clip-text">
            Termos de Uso
          </h1>
          <p className="text-lg text-vibegray-dark max-w-2xl mx-auto">
            Regras claras e transparentes para uso da plataforma Vibe Pay
          </p>
        </div>

        {/* Company Info Card */}
        <div className="bg-gradient-to-br from-vibeyellow/10 via-vibeyellow/5 to-transparent border-2 border-vibeyellow/20 rounded-2xl p-8 mb-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-vibeyellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-vibeblack" />
              </div>
              <div>
                <p className="text-xs font-semibold text-vibegray-dark uppercase tracking-wide mb-1">Razão Social</p>
                <p className="text-base font-bold text-vibeblack">Vibe Pay Tecnologia LTDA</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-vibeyellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-vibeblack" />
              </div>
              <div>
                <p className="text-xs font-semibold text-vibegray-dark uppercase tracking-wide mb-1">CNPJ</p>
                <p className="text-base font-bold text-vibeblack">41.768.146/0001-69</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-vibeyellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-vibeblack" />
              </div>
              <div>
                <p className="text-xs font-semibold text-vibegray-dark uppercase tracking-wide mb-1">Contato</p>
                <p className="text-base font-bold text-vibeblack">juridico@vibep.com.br</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-vibeyellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-vibeblack" />
              </div>
              <div>
                <p className="text-xs font-semibold text-vibegray-dark uppercase tracking-wide mb-1">Última atualização</p>
                <p className="text-base font-bold text-vibeblack">Janeiro de 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">1. Definições</h2>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark">
            <li><strong>Vibe Pay:</strong> Empresa responsável pela plataforma e serviços de pagamento PIX</li>
            <li><strong>Usuário:</strong> Pessoa física ou jurídica que utiliza os serviços da plataforma</li>
            <li><strong>Cliente Final:</strong> Pessoa que realiza pagamentos ao usuário através da plataforma</li>
            <li><strong>Plataforma:</strong> Sistema web e API fornecidos pela Vibe Pay para processamento de pagamentos</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">2. Aceitação dos Termos</h2>
          <p className="text-vibegray-dark mb-4">
            Ao criar uma conta e utilizar os serviços da Vibe Pay, você concorda com estes Termos de Uso e nossa Política de Privacidade.
            Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">3. Serviços Oferecidos</h2>
          <p className="text-vibegray-dark mb-4">
            A Vibe Pay oferece uma plataforma de gateway de pagamento PIX com as seguintes funcionalidades:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Criação de cobranças PIX instantâneas</li>
            <li>Geração de QR Codes para pagamento</li>
            <li>Dashboard para gestão de transações</li>
            <li>API REST para integração</li>
            <li>Webhooks para notificações em tempo real</li>
            <li>Links de pagamento personalizados</li>
            <li>Cobranças recorrentes</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">4. Taxas e Pagamentos</h2>
          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">4.1 Taxas de Transação</h3>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Taxa por transação PIX:</strong> R$ 0,95 (valor fixo)</li>
            <li><strong>Taxa de setup:</strong> R$ 0,00 (gratuito)</li>
            <li><strong>Mensalidade:</strong> R$ 0,00 (sem mensalidade)</li>
          </ul>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">4.2 Saques</h3>
          <p className="text-vibegray-dark mb-4">
            Você pode solicitar saques do seu saldo disponível a qualquer momento, desde que:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Tenha completado a verificação de documentos (KYC)</li>
            <li>Possua saldo mínimo de R$ 10,00</li>
            <li>Informe uma chave PIX válida</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">5. Verificação de Identidade (KYC)</h2>
          <p className="text-vibegray-dark mb-4">
            Para poder solicitar saques, você deve completar o processo de verificação enviando:
          </p>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">5.1 Pessoa Física</h3>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>RG, CNH ou Passaporte válido</li>
            <li>Comprovante de residência (máximo 90 dias)</li>
          </ul>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">5.2 Pessoa Jurídica</h3>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Cartão CNPJ</li>
            <li>Contrato Social ou Documento MEI</li>
            <li>CNH do representante legal</li>
            <li>Comprovante de residência (máximo 90 dias)</li>
          </ul>

          <p className="text-vibegray-dark mb-4">
            <strong>Tempo de análise:</strong> Geralmente minutos, máximo 72 horas úteis.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">6. Obrigações do Usuário</h2>
          <p className="text-vibegray-dark mb-4">
            Ao utilizar a Vibe Pay, você se compromete a:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Fornecer informações verdadeiras, atualizadas e completas</li>
            <li>Manter a segurança de sua senha e chaves de API</li>
            <li>Não utilizar a plataforma para atividades ilegais ou fraudulentas</li>
            <li>Não criar múltiplas contas para o mesmo negócio</li>
            <li>Respeitar as leis e regulamentações aplicáveis</li>
            <li>Pagar todas as taxas devidas pelos serviços</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">7. Atividades Proibidas</h2>
          <p className="text-vibegray-dark mb-4">
            É estritamente proibido utilizar a Vibe Pay para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Venda de produtos ou serviços ilegais</li>
            <li>Esquemas de pirâmide ou marketing multinível</li>
            <li>Pornografia ou conteúdo adulto</li>
            <li>Jogos de azar não regulamentados</li>
            <li>Lavagem de dinheiro</li>
            <li>Fraudes financeiras</li>
            <li>Venda de medicamentos sem prescrição</li>
            <li>Armas e munições</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">8. Segurança e Privacidade</h2>
          <p className="text-vibegray-dark mb-4">
            A Vibe Pay adota medidas de segurança para proteger seus dados:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Criptografia de ponta a ponta (SSL/TLS)</li>
            <li>Armazenamento seguro de dados pessoais</li>
            <li>Conformidade com a LGPD (Lei Geral de Proteção de Dados)</li>
            <li>Monitoramento 24/7 contra fraudes</li>
          </ul>
          <p className="text-vibegray-dark mb-4">
            Para mais informações, consulte nossa <Link href="/privacidade" className="text-vibeyellow hover:underline">Política de Privacidade</Link>.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">9. Limitação de Responsabilidade</h2>
          <p className="text-vibegray-dark mb-4">
            A Vibe Pay não se responsabiliza por:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Problemas técnicos ou falhas temporárias no sistema PIX operado pelo Banco Central</li>
            <li>Disputas entre você e seus clientes finais</li>
            <li>Perdas financeiras decorrentes de uso indevido de suas credenciais</li>
            <li>Bloqueios ou suspensões determinadas por ordem judicial</li>
            <li>Atrasos em saques causados por instituições financeiras terceiras</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">10. Suspensão e Encerramento</h2>
          <p className="text-vibegray-dark mb-4">
            A Vibe Pay reserva-se o direito de suspender ou encerrar sua conta imediatamente em caso de:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Violação destes Termos de Uso</li>
            <li>Atividade suspeita ou fraudulenta</li>
            <li>Inadimplência no pagamento de taxas</li>
            <li>Fornecimento de informações falsas</li>
            <li>Solicitação do próprio usuário</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">11. Alterações nos Termos</h2>
          <p className="text-vibegray-dark mb-4">
            A Vibe Pay pode modificar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após
            publicação nesta página. Recomendamos que você revise periodicamente estes termos.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">12. Lei Aplicável e Foro</h2>
          <p className="text-vibegray-dark mb-4">
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro
            da comarca da sede da Vibe Pay.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">13. Contato</h2>
          <p className="text-vibegray-dark mb-4">
            Para dúvidas, sugestões ou reclamações sobre estes Termos de Uso, entre em contato:
          </p>
          <ul className="list-none space-y-2 text-vibegray-dark mb-4">
            <li><strong>Email:</strong> juridico@vibep.com.br</li>
            <li><strong>Website:</strong> https://vibep.com.br</li>
          </ul>

          <div className="bg-vibeyellow/10 border border-vibeyellow/30 rounded-lg p-6 mt-8">
            <p className="text-sm text-vibeblack font-semibold mb-2">
              Ao utilizar a Vibe Pay, você declara ter lido, compreendido e concordado com estes Termos de Uso.
            </p>
            <p className="text-xs text-vibegray-dark">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="Vibe Pay"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-vibeblack mb-2">
                Vibe Pay Tecnologia LTDA
              </p>
              <p className="text-xs text-vibegray-dark mb-1">
                CNPJ: 41.768.146/0001-69
              </p>
              <p className="text-xs text-vibegray-dark">
                © 2025 Vibe Pay - Todos os direitos reservados
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/termos" className="text-vibegray-dark hover:text-vibeyellow transition-colors font-medium">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="text-vibegray-dark hover:text-vibeyellow transition-colors font-medium">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
