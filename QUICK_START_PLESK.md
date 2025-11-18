# 🚀 Guide Rapide - Déploiement Plesk

## Avant de commencer

1. **Préparez ces informations** :
   - URL de votre domaine
   - Accès SSH à votre serveur Plesk
   - Identifiants de base de données (créés dans Plesk)
   - Configuration SMTP pour les emails

2. **Exécutez le script de préparation** (sur votre machine locale) :
```bash
./prepare-deploy.sh
```

---

## 📝 Checklist Rapide

### Sur Plesk (Interface Web)

- [ ] **Créer la base de données**
  - Bases de données > Ajouter
  - Nom: `asano_db`
  - Utilisateur: `asano_user`
  - Notez le mot de passe

- [ ] **Configurer le Document Root**
  - Paramètres d'hébergement
  - Document Root: `/httpdocs/backend/public`

- [ ] **Activer les extensions PHP**
  - Paramètres PHP
  - Activer: pdo_mysql, mbstring, openssl, tokenizer, xml, ctype, json, bcmath, fileinfo, gd

- [ ] **Configurer le Cron**
  - Tâches planifiées > Ajouter
  - Commande: `/usr/bin/php /var/www/vhosts/VOTRE_DOMAINE/httpdocs/backend/artisan schedule:run`
  - Fréquence: Chaque minute

- [ ] **Activer SSL/HTTPS**
  - SSL/TLS > Let's Encrypt

### Sur le Serveur (SSH)

```bash
# 1. Se connecter
ssh votre_user@votre-domaine.fr

# 2. Aller dans httpdocs
cd httpdocs

# 3. Cloner le projet
git clone git@git.unistra.fr:depeli/sae_501.git .
# ou avec HTTPS:
# git clone https://git.unistra.fr/depeli/sae_501.git .

# 4. Backend
cd backend
composer install --optimize-autoloader --no-dev
cp .env.example .env
nano .env  # Configurer (voir ci-dessous)
php artisan key:generate
php artisan storage:link
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 755 storage bootstrap/cache

# 5. Frontend
cd ../frontend
npm install
echo "VITE_API_URL=https://votre-domaine.fr/api" > .env
npm run build
cp -r dist/* ../backend/public/

# 6. Tester
curl https://votre-domaine.fr/api/health
```

---

## ⚙️ Configuration .env (Backend)

```env
APP_NAME=Asano
APP_ENV=production
APP_KEY=  # Sera généré par php artisan key:generate
APP_DEBUG=false
APP_URL=https://votre-domaine.fr

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=asano_db
DB_USERNAME=asano_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE

MAIL_MAILER=smtp
MAIL_HOST=smtp.votre-domaine.fr
MAIL_PORT=587
MAIL_USERNAME=noreply@votre-domaine.fr
MAIL_PASSWORD=VOTRE_MOT_DE_PASSE_EMAIL
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votre-domaine.fr
MAIL_FROM_NAME="${APP_NAME}"

FRONTEND_URL=https://votre-domaine.fr

SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=database
```

---

## ✅ Vérification

1. **API** : `https://votre-domaine.fr/api/health` → `{"ok":true}`
2. **Frontend** : `https://votre-domaine.fr` → Page d'accueil
3. **Inscription** : Créer un compte de test
4. **Email** : Vérifier la réception de l'email de vérification

---

## 🔄 Mise à Jour

Pour mettre à jour après des modifications :

```bash
ssh votre_user@votre-domaine.fr
cd httpdocs
./update-production.sh
```

---

## 🐛 Problèmes Courants

### Erreur 500
```bash
tail -f backend/storage/logs/laravel.log
chmod -R 755 backend/storage backend/bootstrap/cache
```

### API ne fonctionne pas
- Vérifier `backend/public/.htaccess`
- Vérifier que Document Root = `/httpdocs/backend/public`

### Frontend page blanche
```bash
cd frontend
npm run build
cp -r dist/* ../backend/public/
```

### Emails non envoyés
- Vérifier la config SMTP dans `.env`
- Tester: `php artisan tinker` puis `Mail::raw('Test', fn($m) => $m->to('test@test.com')->subject('Test'));`

---

## 📞 Support

- **Logs Laravel** : `backend/storage/logs/laravel.log`
- **Logs Apache** : Dans Plesk > Logs
- **Documentation complète** : `DEPLOIEMENT_PLESK.md`

---

**Temps estimé : 30-45 minutes** ⏱️
