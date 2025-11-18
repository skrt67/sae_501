#!/bin/bash

echo "🧹 Nettoyage du cache Laravel..."

php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "✅ Cache nettoyé avec succès !"
echo ""
echo "📧 L'URL du frontend dans les emails est maintenant : http://localhost:5173"
echo ""
echo "🔄 Redémarrez le serveur Laravel si nécessaire :"
echo "   php artisan serve --port=8000"
