#!/bin/bash

echo "🚀 Deploy Vibe Pay - Produção"
echo "=============================="

# 1. Buildar serviços
echo "📦 Building services..."
cd services/auth-service && npm run build
cd ../payment-service && npm run build
cd ../webhook-service && npm run build
cd ../api-gateway && npm run build

# 2. Buildar frontend
echo "📦 Building frontend..."
cd ../../frontend/dashboard && npm run build

# 3. Reiniciar serviços
echo "🔄 Restarting services..."
pm2 restart auth-service
pm2 restart payment-service
pm2 restart webhook-service
pm2 restart api-gateway
pm2 restart frontend

echo "✅ Deploy concluído!"
echo ""
echo "🔗 URLs:"
echo "   Frontend: https://app.vibep.com.br"
echo "   API: https://api.vibep.com.br"
echo "   Webhook: https://vibep.com.br/webhook/openpix"