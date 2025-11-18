#!/bin/bash

echo "🚀 Préparation du déploiement Asano..."

# Créer un dossier temporaire
rm -rf deploy-temp
mkdir -p deploy-temp

echo "📦 Copie des fichiers backend..."
# Copier le backend (sans node_modules, vendor, et fichiers inutiles)
rsync -av --exclude='node_modules' \
         --exclude='vendor' \
         --exclude='.git' \
         --exclude='.env' \
         --exclude='storage/logs/*' \
         --exclude='storage/framework/cache/*' \
         --exclude='storage/framework/sessions/*' \
         --exclude='storage/framework/views/*' \
         --exclude='database/database.sqlite' \
         backend/ deploy-temp/

echo "🎨 Copie du build frontend dans public/..."
# Copier le contenu du build frontend dans public/
cp -r frontend/dist/* deploy-temp/public/

echo "📝 Création du .env.example..."
# Copier le .env.example
cp backend/.env.example deploy-temp/.env.example

echo "📁 Création des dossiers storage nécessaires..."
# Créer les dossiers storage vides
mkdir -p deploy-temp/storage/framework/cache
mkdir -p deploy-temp/storage/framework/sessions
mkdir -p deploy-temp/storage/framework/views
mkdir -p deploy-temp/storage/logs
mkdir -p deploy-temp/storage/app/public

echo "🗜️  Création de l'archive ZIP..."
cd deploy-temp
zip -r ../asano-deploy.zip . -x "*.DS_Store"
cd ..

echo "✅ Archive créée : asano-deploy.zip"
echo "📊 Taille du fichier :"
ls -lh asano-deploy.zip

echo ""
echo "🎯 Prochaines étapes :"
echo "1. Upload asano-deploy.zip sur Plesk"
echo "2. Extraire dans le File Manager"
echo "3. Installer les dépendances : composer install --no-dev"
echo "4. Configurer le .env"
echo "5. Lancer les migrations : php artisan migrate"

# Nettoyer
rm -rf deploy-temp
