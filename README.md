@"
# 💜 Vibe Pay

Gateway de pagamento PIX para Geração Z

## 🚀 Rodar o projeto

\`\`\`bash
# Instalar dependências
npm install

# Rodar API Gateway
npm run dev:gateway
\`\`\`

## 🌐 URLs

- API Gateway: http://localhost:4000
- Health Check: http://localhost:4000/health

## 💰 Pricing

Taxa: R\$ 0,95 por transação
"@ | Out-File -FilePath "README.md" -Encoding utf8

Write-Host "✅ README criado!" -ForegroundColor Green