# Guide de Déploiement Asano sur Plesk

## 📋 Prérequis

### Sur votre machine locale
- Git installé
- Accès au dépôt : `git@git.unistra.fr:depeli/sae_501.git`

### Sur le serveur Plesk
- PHP >= 8.1
- Composer
- Node.js >= 18.x
- MySQL >= 8.0
- Accès SSH au serveur
- Domaine configuré dans Plesk

---

## 🚀 Étape 1 : Préparation de la Base de Données

### 1.1 Créer la base de données dans Plesk

1. Connectez-vous à Plesk
2. Allez dans **Bases de données** > **Ajouter une base de données**
3. Créez une base de données :
   - **Nom** : `asano_db` (ou votre choix)
   - **Utilisateur** : `asano_user`
   - **Mot de passe** : Générez un mot de passe fort
4. Notez ces informations pour plus tard

---

## 🚀 Étape 2 : Connexion SSH et Clonage du Projet

### 2.1 Se connecter en SSH

```bash
ssh votre_utilisateur@votre-domaine.fr
```

### 2.2 Aller dans le répertoire web

```bash
cd httpdocs
# ou
cd domains/votre-domaine.fr/httpdocs
```

### 2.3 Nettoyer le répertoire (si nécessaire)

```bash
rm -rf *
rm -rf .htaccess
```

### 2.4 Cloner le projet

```bash
git clone git@git.unistra.fr:depeli/sae_501.git .
```

Si vous n'avez pas configuré SSH, utilisez HTTPS :
```bash
git clone https://git.unistra.fr/depeli/sae_501.git .
```

---

## 🚀 Étape 3 : Configuration du Backend (Laravel)

### 3.1 Aller dans le dossier backend

```bash
cd backend
```

### 3.2 Installer les dépendances PHP

```bash
composer install --optimize-autoloader --no-dev
```

### 3.3 Configurer l'environnement

```bash
cp .env.example .env
nano .env
```

Modifiez les variables suivantes :

```env
APP_NAME=Asano
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://votre-domaine.fr

# Base de données (utilisez les infos de l'étape 1.1)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=asano_db
DB_USERNAME=asano_user
DB_PASSWORD=votre_mot_de_passe

# Mail (configurez avec vos paramètres SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.votre-domaine.fr
MAIL_PORT=587
MAIL_USERNAME=noreply@votre-domaine.fr
MAIL_PASSWORD=votre_mot_de_passe_email
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@votre-domaine.fr
MAIL_FROM_NAME="${APP_NAME}"

# Frontend URL
FRONTEND_URL=https://votre-domaine.fr

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=database
```

Sauvegardez avec `Ctrl+O`, puis `Ctrl+X`

### 3.4 Générer la clé d'application

```bash
php artisan key:generate
```

### 3.5 Créer le lien symbolique pour le storage

```bash
php artisan storage:link
```

### 3.6 Exécuter les migrations

```bash
php artisan migrate --force
```

### 3.7 Optimiser Laravel pour la production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3.8 Définir les permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R votre_utilisateur:psacln storage bootstrap/cache
```

---

## 🚀 Étape 4 : Configuration du Frontend (React)

### 4.1 Retourner à la racine et aller dans frontend

```bash
cd ../frontend
```

### 4.2 Installer les dépendances Node.js

```bash
npm install
```

### 4.3 Configurer l'environnement

```bash
nano .env
```

Ajoutez :

```env
VITE_API_URL=https://votre-domaine.fr/api
```

### 4.4 Build de production

```bash
npm run build
```

Cela créera un dossier `dist/` avec les fichiers optimisés.

---

## 🚀 Étape 5 : Configuration de Plesk

### 5.1 Configurer le Document Root

1. Dans Plesk, allez dans **Paramètres d'hébergement**
2. Changez le **Document Root** vers : `/httpdocs/backend/public`
3. Sauvegardez

### 5.2 Copier le frontend dans public

```bash
cd ..
cp -r frontend/dist/* backend/public/
```

### 5.3 Vérifier le fichier .htaccess

Le fichier `backend/public/.htaccess` doit contenir :

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Redirect to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # API Routes
    RewriteCond %{REQUEST_URI} ^/api/
    RewriteRule ^ index.php [L]

    # Frontend Routes - serve index.html for all non-API routes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteRule ^ index.html [L]
</IfModule>
```

### 5.4 Configuration PHP dans Plesk

1. Allez dans **Paramètres PHP**
2. Vérifiez que ces extensions sont activées :
   - `pdo_mysql`
   - `mbstring`
   - `openssl`
   - `tokenizer`
   - `xml`
   - `ctype`
   - `json`
   - `bcmath`
   - `fileinfo`
   - `gd`

3. Augmentez les limites :
   - `memory_limit` : 256M
   - `upload_max_filesize` : 20M
   - `post_max_size` : 20M
   - `max_execution_time` : 300

---

## 🚀 Étape 6 : Configuration des Tâches Planifiées (Cron)

### 6.1 Ajouter un Cron Job dans Plesk

1. Allez dans **Tâches planifiées**
2. Cliquez sur **Ajouter une tâche**
3. Configurez :
   - **Commande** : `/usr/bin/php /var/www/vhosts/votre-domaine.fr/httpdocs/backend/artisan schedule:run >> /dev/null 2>&1`
   - **Fréquence** : Chaque minute (*/1 * * * *)

Cela permettra d'exécuter les tâches planifiées Laravel (notifications, etc.)

---

## 🚀 Étape 7 : Configuration du Queue Worker (Optionnel mais recommandé)

Pour traiter les emails et notifications en arrière-plan :

### 7.1 Créer un script de démarrage

```bash
cd ~/httpdocs/backend
nano queue-worker.sh
```

Ajoutez :

```bash
#!/bin/bash
cd /var/www/vhosts/votre-domaine.fr/httpdocs/backend
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

Rendez-le exécutable :

```bash
chmod +x queue-worker.sh
```

### 7.2 Configurer comme service (demandez à votre hébergeur)

Ou ajoutez un cron qui vérifie si le worker tourne :

```bash
*/5 * * * * cd /var/www/vhosts/votre-domaine.fr/httpdocs/backend && php artisan queue:work --stop-when-empty
```

---

## 🚀 Étape 8 : Vérification et Tests

### 8.1 Tester l'API

```bash
curl https://votre-domaine.fr/api/health
```

Devrait retourner : `{"ok":true}`

### 8.2 Tester le frontend

Ouvrez votre navigateur et allez sur : `https://votre-domaine.fr`

### 8.3 Créer un compte de test

1. Allez sur `/register`
2. Créez un compte
3. Vérifiez que l'email de vérification est envoyé
4. Testez la connexion

---

## 🔄 Mise à Jour du Projet

Pour mettre à jour l'application après des modifications :

```bash
# Se connecter en SSH
ssh votre_utilisateur@votre-domaine.fr
cd httpdocs

# Pull les dernières modifications
git pull origin main

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd ../frontend
npm install
npm run build
cp -r dist/* ../backend/public/

# Nettoyer le cache
cd ../backend
php artisan cache:clear
php artisan config:clear
```

---

## 🐛 Dépannage

### Erreur 500

1. Vérifiez les logs Laravel :
```bash
tail -f backend/storage/logs/laravel.log
```

2. Vérifiez les permissions :
```bash
chmod -R 755 backend/storage backend/bootstrap/cache
```

### Erreur de connexion à la base de données

1. Vérifiez le fichier `.env`
2. Testez la connexion :
```bash
php artisan tinker
DB::connection()->getPdo();
```

### Les routes API ne fonctionnent pas

1. Vérifiez le `.htaccess` dans `backend/public/`
2. Vérifiez que `mod_rewrite` est activé dans Apache

### Le frontend affiche une page blanche

1. Vérifiez la console du navigateur (F12)
2. Vérifiez que `VITE_API_URL` est correct dans le build
3. Rebuild le frontend :
```bash
cd frontend
npm run build
cp -r dist/* ../backend/public/
```

### Les emails ne sont pas envoyés

1. Vérifiez la configuration SMTP dans `.env`
2. Testez l'envoi d'email :
```bash
php artisan tinker
Mail::raw('Test', function($msg) { $msg->to('votre@email.com')->subject('Test'); });
```

---

## 📝 Checklist de Déploiement

- [ ] Base de données créée dans Plesk
- [ ] Projet cloné via Git
- [ ] Dépendances backend installées (`composer install`)
- [ ] Fichier `.env` configuré
- [ ] Clé d'application générée (`php artisan key:generate`)
- [ ] Migrations exécutées (`php artisan migrate`)
- [ ] Storage link créé (`php artisan storage:link`)
- [ ] Permissions définies (755 sur storage et bootstrap/cache)
- [ ] Dépendances frontend installées (`npm install`)
- [ ] Frontend buildé (`npm run build`)
- [ ] Frontend copié dans public
- [ ] Document Root configuré vers `backend/public`
- [ ] Extensions PHP activées
- [ ] Cron job configuré pour le scheduler
- [ ] Tests effectués (API + Frontend)
- [ ] HTTPS activé

---

## 🔒 Sécurité

### Recommandations

1. **Toujours utiliser HTTPS** (activez le certificat SSL dans Plesk)
2. **Ne jamais commiter le fichier `.env`**
3. **Utilisez des mots de passe forts** pour la base de données
4. **Limitez l'accès SSH** aux IPs de confiance
5. **Activez le firewall** dans Plesk
6. **Faites des backups réguliers** de la base de données

### Backup de la base de données

```bash
mysqldump -u asano_user -p asano_db > backup_$(date +%Y%m%d).sql
```

---

## 📞 Support

En cas de problème :
1. Consultez les logs Laravel : `backend/storage/logs/laravel.log`
2. Consultez les logs Apache dans Plesk
3. Vérifiez la documentation Laravel : https://laravel.com/docs
4. Contactez le support de votre hébergeur pour les problèmes serveur

---

**Bon déploiement ! 🚀**
