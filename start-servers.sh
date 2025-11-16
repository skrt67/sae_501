#!/bin/bash

# Script pour démarrer les serveurs backend et frontend

echo "🧹 Nettoyage des processus existants..."
killall php node 2>/dev/null
sleep 2

echo "🚀 Démarrage du backend Laravel..."
cd /Users/altan/Desktop/sae_501\ copie/backend
php artisan serve --host=127.0.0.1 --port=8005 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

sleep 2

echo "🚀 Démarrage du frontend Vite..."
cd /Users/altan/Desktop/sae_501\ copie/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

sleep 3

echo ""
echo "✅ Serveurs démarrés !"
echo ""
echo "📡 Backend:  http://127.0.0.1:8005"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "🔑 Identifiants de test:"
echo "   Email: admin@example.com"
echo "   Mot de passe: password123"
echo ""
echo "📋 Pour arrêter les serveurs:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   ou: killall php node"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
