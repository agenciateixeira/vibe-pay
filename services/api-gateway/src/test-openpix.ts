import { config } from 'dotenv'

config({ path: '../../.env' })

async function testOpenPix() {
  const appId = process.env.OPENPIX_APP_ID
  
  console.log('🔑 Client ID:', appId?.substring(0, 30) + '...')
  console.log('🌐 Testando conexão com OpenPix/Woovi...\n')
  
  try {
    // Criar uma cobrança de teste de R$ 1,00
    const response = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: {
        'Authorization': appId!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value: 100, // R$ 1,00 em centavos
        correlationID: `vibe_test_${Date.now()}`,
        comment: 'Teste Vibe Pay - Gateway de Pagamento',
        customer: {
          name: 'João da Silva',
          email: '[email protected]',
          phone: '+5511987654321',
          taxID: '44015458850' // CPF válido de teste
        }
      })
    })
    
    const data = await response.json()
    
    console.log('📊 Status:', response.status)
    
    if (response.ok && data.charge) {
      console.log('\n✅ SUCESSO! Cobrança criada:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💰 Valor: R$ 1,00')
      console.log('🆔 ID:', data.charge.correlationID)
      console.log('📌 Status:', data.charge.status)
      console.log('🔗 URL de Pagamento:', data.charge.paymentLinkUrl)
      console.log('\n📱 QR Code PIX (Copia e Cola):')
      console.log(data.charge.brCode?.substring(0, 80) + '...')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n💜 OpenPix/Woovi funcionando PERFEITAMENTE!')
      console.log('✅ Pronto para criar o Payment Service!')
    } else {
      console.log('\n❌ Erro ao criar cobrança')
      console.log('📦 Resposta:', JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error('\n❌ Erro na requisição:', error)
  }
}

testOpenPix()