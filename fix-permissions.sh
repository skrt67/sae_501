#!/bin/bash

# Script pour corriger les permissions après déploiement sur Plesk
# Usage: ./fix-permissions.sh [chemin-vers-api]

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Chemin par défaut
API_PATH="${1:-/var/www/vhosts/asano.depeli.etu.mmi-unistra.fr/api}"

echo -e "${YELLOW}🔧 Correction des permissions pour Asano${NC}"
echo -e "${YELLOW}Chemin: $API_PATH${NC}\n"

# Vérifier si le chemin existe
if [ ! -d "$API_PATH" ]; then
    echo -e "${RED}❌ Erreur: Le chemin $API_PATH n'existe pas${NC}"
    exit 1
fi

# Permissions de base
echo -e "${GREEN}📁 Configuration des permissions de base...${NC}"
chmod -R 755 "$API_PATH"

# Permissions spéciales pour storage et cache
echo -e "${GREEN}💾 Configuration des permissions pour storage et cache...${NC}"
chmod -R 775 "$API_PATH/storage"
chmod -R 775 "$API_PATH/bootstrap/cache"

# Changer le propriétaire (nécessite sudo)
echo -e "${GREEN}👤 Configuration du propriétaire...${NC}"
if [ "$EUID" -eq 0 ]; then
    chown -R www-data:www-data "$API_PATH"
    echo -e "${GREEN}✅ Propriétaire changé vers www-data${NC}"
else
    echo -e "${YELLOW}⚠️  Exécute avec sudo pour changer le propriétaire:${NC}"
    echo -e "${YELLOW}   sudo $0 $API_PATH${NC}"
fi

# Vérifier le .htaccess
echo -e "\n${GREEN}📄 Vérification du .htaccess...${NC}"
HTACCESS_FILE="$API_PATH/public/.htaccess"

if [ -f "$HTACCESS_FILE" ]; then
    if grep -q "Require all granted" "$HTACCESS_FILE"; then
        echo -e "${GREEN}✅ .htaccess contient 'Require all granted'${NC}"
    else
        echo -e "${YELLOW}⚠️  .htaccess ne contient pas 'Require all granted'${NC}"
        echo -e "${YELLOW}   Ajoute ces lignes au début du fichier:${NC}"
        echo -e "${YELLOW}   <IfModule mod_authz_core.c>${NC}"
        echo -e "${YELLOW}       Require all granted${NC}"
        echo -e "${YELLOW}   </IfModule>${NC}"
    fi
else
    echo -e "${RED}❌ .htaccess introuvable dans $API_PATH/public/${NC}"
fi

# Nettoyer le cache Laravel
echo -e "\n${GREEN}🧹 Nettoyage du cache Laravel...${NC}"
cd "$API_PATH" || exit

if [ -f "artisan" ]; then
    php artisan cache:clear 2>/dev/null && echo -e "${GREEN}✅ Cache vidé${NC}"
    php artisan config:clear 2>/dev/null && echo -e "${GREEN}✅ Config vidée${NC}"
    php artisan route:clear 2>/dev/null && echo -e "${GREEN}✅ Routes vidées${NC}"
    php artisan view:clear 2>/dev/null && echo -e "${GREEN}✅ Vues vidées${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier artisan introuvable${NC}"
fi

# Résumé
echo -e "\n${GREEN}✅ Permissions corrigées !${NC}"
echo -e "\n${YELLOW}📋 Prochaines étapes:${NC}"
echo -e "1. Vérifie la configuration Apache dans Plesk"
echo -e "2. Ajoute ces directives dans 'Apache & nginx Settings':"
echo -e ""
echo -e "${YELLOW}<Directory $API_PATH/public>${NC}"
echo -e "${YELLOW}    Options -Indexes +FollowSymLinks${NC}"
echo -e "${YELLOW}    AllowOverride All${NC}"
echo -e "${YELLOW}    Require all granted${NC}"
echo -e "${YELLOW}</Directory>${NC}"
echo -e ""
echo -e "3. Redémarre Apache: ${YELLOW}service apache2 restart${NC}"
echo -e "4. Vérifie les logs: ${YELLOW}tail -f /var/log/apache2/error.log${NC}"
