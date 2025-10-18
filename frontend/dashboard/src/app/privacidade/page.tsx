import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="Vibe Pay"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-black text-vibeblack mb-6">Política de Privacidade</h1>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-vibegray-dark mb-2">
              <strong>Razão Social:</strong> Vibe Pay Tecnologia LTDA
            </p>
            <p className="text-sm text-vibegray-dark mb-2">
              <strong>CNPJ:</strong> 41.768.146/0001-69
            </p>
            <p className="text-sm text-vibegray-dark mb-2">
              <strong>Contato DPO:</strong> juridico@vibep.com.br
            </p>
            <p className="text-sm text-vibegray-dark">
              <strong>Última atualização:</strong> Janeiro de 2025
            </p>
          </div>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">1. Introdução</h2>
          <p className="text-vibegray-dark mb-4">
            A Vibe Pay respeita sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política de Privacidade
            descreve como coletamos, usamos, armazenamos e compartilhamos suas informações, em conformidade com a Lei Geral de
            Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">2. Dados que Coletamos</h2>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">2.1 Dados Fornecidos por Você</h3>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Dados de Cadastro:</strong> Nome completo, email, telefone, CPF/CNPJ</li>
            <li><strong>Dados da Empresa:</strong> Razão social, nome fantasia, endereço, CNPJ</li>
            <li><strong>Documentos:</strong> RG, CNH, Passaporte, Comprovante de residência, Contrato Social</li>
            <li><strong>Dados Bancários:</strong> Chave PIX para recebimento de saques</li>
            <li><strong>Dados de Transação:</strong> Informações sobre pagamentos recebidos</li>
          </ul>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">2.2 Dados Coletados Automaticamente</h3>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
            <li><strong>Dados de Uso:</strong> Páginas visitadas, tempo de permanência, ações realizadas</li>
            <li><strong>Cookies:</strong> Cookies essenciais para funcionamento da plataforma</li>
            <li><strong>Logs de API:</strong> Requisições feitas à API, timestamps, status codes</li>
          </ul>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">2.3 Dados de Terceiros</h3>
          <p className="text-vibegray-dark mb-4">
            Podemos receber dados de parceiros como OpenPix (processador de pagamentos PIX) e instituições financeiras para
            confirmação de transações.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">3. Como Usamos Seus Dados</h2>
          <p className="text-vibegray-dark mb-4">
            Utilizamos seus dados pessoais para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Prestação de Serviços:</strong> Processar pagamentos PIX, gerenciar sua conta</li>
            <li><strong>Verificação de Identidade:</strong> Cumprir obrigações KYC (Know Your Customer) e prevenir fraudes</li>
            <li><strong>Comunicação:</strong> Enviar notificações sobre transações, atualizações e suporte</li>
            <li><strong>Melhorias:</strong> Análise de uso para aprimorar nossa plataforma</li>
            <li><strong>Segurança:</strong> Detectar e prevenir atividades fraudulentas ou ilegais</li>
            <li><strong>Conformidade Legal:</strong> Cumprir obrigações legais e regulatórias</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">4. Base Legal para Tratamento</h2>
          <p className="text-vibegray-dark mb-4">
            Processamos seus dados com base em:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Consentimento:</strong> Você concorda com estes termos ao criar sua conta</li>
            <li><strong>Execução de Contrato:</strong> Necessário para fornecer os serviços contratados</li>
            <li><strong>Obrigação Legal:</strong> Cumprimento de leis financeiras e tributárias</li>
            <li><strong>Legítimo Interesse:</strong> Prevenção de fraudes e segurança da plataforma</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">5. Compartilhamento de Dados</h2>
          <p className="text-vibegray-dark mb-4">
            Seus dados podem ser compartilhados com:
          </p>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">5.1 Parceiros Essenciais</h3>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>OpenPix:</strong> Processamento de pagamentos PIX</li>
            <li><strong>Supabase:</strong> Armazenamento seguro de dados</li>
            <li><strong>Vercel:</strong> Hospedagem da plataforma</li>
            <li><strong>Railway:</strong> Hospedagem de serviços backend</li>
          </ul>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">5.2 Autoridades</h3>
          <p className="text-vibegray-dark mb-4">
            Podemos compartilhar dados com autoridades governamentais quando exigido por lei ou ordem judicial.
          </p>

          <h3 className="text-xl font-bold text-vibeblack mt-6 mb-3">5.3 Nunca Compartilhamos</h3>
          <p className="text-vibegray-dark mb-4">
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing ou publicidade.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">6. Segurança dos Dados</h2>
          <p className="text-vibegray-dark mb-4">
            Implementamos medidas técnicas e organizacionais para proteger seus dados:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Criptografia:</strong> SSL/TLS para transmissão de dados</li>
            <li><strong>Acesso Restrito:</strong> Apenas funcionários autorizados têm acesso a dados sensíveis</li>
            <li><strong>Monitoramento:</strong> Logs de acesso e detecção de atividades suspeitas</li>
            <li><strong>Backups:</strong> Cópias de segurança regulares</li>
            <li><strong>Auditoria:</strong> Revisões periódicas de segurança</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">7. Retenção de Dados</h2>
          <p className="text-vibegray-dark mb-4">
            Mantemos seus dados pelo tempo necessário para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Conta Ativa:</strong> Durante todo o período em que sua conta estiver ativa</li>
            <li><strong>Obrigações Legais:</strong> Mínimo de 5 anos após encerramento da conta (lei tributária)</li>
            <li><strong>Disputas:</strong> Até resolução completa de quaisquer disputas ou processos</li>
          </ul>
          <p className="text-vibegray-dark mb-4">
            Após esse período, seus dados são anonimizados ou excluídos de forma segura.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">8. Seus Direitos (LGPD)</h2>
          <p className="text-vibegray-dark mb-4">
            De acordo com a LGPD, você tem direito a:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li><strong>Confirmação:</strong> Saber se tratamos seus dados pessoais</li>
            <li><strong>Acesso:</strong> Obter cópia dos seus dados</li>
            <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
            <li><strong>Anonimização:</strong> Solicitar anonimização de dados</li>
            <li><strong>Exclusão:</strong> Solicitar exclusão de dados (exceto quando legalmente obrigatório mantê-los)</li>
            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
            <li><strong>Revogação:</strong> Revogar consentimento (pode limitar acesso a serviços)</li>
            <li><strong>Oposição:</strong> Opor-se ao tratamento em certas circunstâncias</li>
          </ul>
          <p className="text-vibegray-dark mb-4">
            Para exercer seus direitos, entre em contato: juridico@vibep.com.br
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">9. Cookies</h2>
          <p className="text-vibegray-dark mb-4">
            Utilizamos cookies essenciais para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-vibegray-dark mb-4">
            <li>Manter sua sessão autenticada</li>
            <li>Lembrar suas preferências</li>
            <li>Garantir segurança da plataforma</li>
          </ul>
          <p className="text-vibegray-dark mb-4">
            Você pode desabilitar cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade da plataforma.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">10. Transferência Internacional</h2>
          <p className="text-vibegray-dark mb-4">
            Alguns de nossos parceiros (Supabase, Vercel) podem armazenar dados em servidores localizados fora do Brasil.
            Garantimos que todos os parceiros adotam medidas de segurança adequadas e estão em conformidade com a LGPD.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">11. Menores de Idade</h2>
          <p className="text-vibegray-dark mb-4">
            Nossos serviços não são destinados a menores de 18 anos. Não coletamos conscientemente dados de menores.
            Se você é responsável por um menor e acredita que ele forneceu dados para nós, entre em contato para exclusão.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">12. Alterações nesta Política</h2>
          <p className="text-vibegray-dark mb-4">
            Podemos atualizar esta Política de Privacidade periodicamente. As alterações entram em vigor imediatamente após
            publicação nesta página. Recomendamos que você revise esta política regularmente.
          </p>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">13. Contato e DPO</h2>
          <p className="text-vibegray-dark mb-4">
            Para questões sobre privacidade, exercício de direitos ou comunicação com nosso Encarregado de Proteção de Dados (DPO):
          </p>
          <ul className="list-none space-y-2 text-vibegray-dark mb-4">
            <li><strong>Email DPO:</strong> juridico@vibep.com.br</li>
            <li><strong>Assunto:</strong> "LGPD - [Seu Pedido]"</li>
            <li><strong>Prazo de Resposta:</strong> Até 15 dias úteis</li>
          </ul>

          <h2 className="text-2xl font-bold text-vibeblack mt-8 mb-4">14. Autoridade Nacional</h2>
          <p className="text-vibegray-dark mb-4">
            Em caso de dúvidas não resolvidas, você pode contatar a Autoridade Nacional de Proteção de Dados (ANPD):
          </p>
          <ul className="list-none space-y-2 text-vibegray-dark mb-4">
            <li><strong>Website:</strong> www.gov.br/anpd</li>
          </ul>

          <div className="bg-vibeyellow/10 border border-vibeyellow/30 rounded-lg p-6 mt-8">
            <p className="text-sm text-vibeblack font-semibold mb-2">
              Ao utilizar a Vibe Pay, você concorda com esta Política de Privacidade.
            </p>
            <p className="text-xs text-vibegray-dark">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-vibegray-dark">
            © 2025 Vibe Pay - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
