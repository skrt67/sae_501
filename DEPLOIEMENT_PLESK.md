# 🚀 Guide de Déploiement sur Plesk - Asano

## 📋 Prérequis

### Sur Plesk
- Accès à un serveur Plesk
- PHP 8.2+ installé
- Composer installé
- Node.js 18+ installé
- Base de données MySQL ou PostgreSQL
- Accès SSH (recommandé)

### Sur ton ordinateur
- Git installé
- Accès au repository

## 🎯 Étape 1 : Préparer le Backend pour la Production

### 1.1 Créer un fichier .env de production

Crée `backend/.env.production` :

```env
APP_NAME=Asano
APP_ENV=production
APP_KEY=base64:VOTRE_CLE_ICI
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Base de données MySQL
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nom_de_votre_base
DB_USERNAME=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database
QUEUE_CONNECTION=database

# Email (Gmail ou autre)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe-app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=votre-email@gmail.com
MAIL_FROM_NAME="Asano"

# URL du frontend
APP_FRONTEND_URL=https://votre-domaine.com
```

### 1.2 Optimiser le backend

```bash
cd backend

# Installer les dépendances de production uniquement
composer install --optimize-autoloader --no-dev

# Générer la clé d'application (si nécessaire)
php artisan key:generate

# Optimiser les configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🎯 Étape 2 : Préparer le Frontend pour la Production

### 2.1 Créer un fichier .env de production

Crée `frontend/.env.production` :

```env
VITE_API_URL=https://votre-domaine.com/api
VITE_APP_NAME=Asano
VITE_APP_ENV=production
```

### 2.2 Build du frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Build de production
npm run build
```

Cela créera un dossier `frontend/dist/` avec les fichiers optimisés.

## 🎯 Étape 3 : Déploiement sur Plesk

### 3.1 Créer un domaine/sous-domaine dans Plesk

1. Connecte-toi à Plesk
2. Va dans "Domaines" → "Ajouter un domaine"
3. Entre ton domaine (ex: asano.ton-domaine.com)
4. Configure le document root

### 3.2 Structure des dossiers sur Plesk

```
/httpdocs/                    ← Document root (frontend)
  ├── index.html
  ├── assets/
  └── ...
/api/                         ← Backend Laravel
  ├── app/
  ├── bootstrap/
  ├── config/
  ├── database/
  ├── public/
  ├── routes/
  ├── storage/
  ├── vendor/
  ├── .env
  └── artisan
```

### 3.3 Upload des fichiers

#### Option A : Via FTP/SFTP (FileZilla)

1. **Upload du backend** :
   - Upload tout le dossier `backend/` vers `/api/`
   - Copie `.env.production` vers `/api/.env`

2. **Upload du frontend** :
   - Upload le contenu de `frontend/dist/` vers `/httpdocs/`

#### Option B : Via Git (Recommandé)

```bash
# Sur le serveur via SSH
cd /var/www/vhosts/votre-domaine.com

# Cloner le repository
git clone votre-repo.git temp
cd temp

# Déplacer les fichiers
mv backend ../api
mv frontend/dist/* ../httpdocs/

# Nettoyer
cd ..
rm -rf temp
```

### 3.4 Configuration du backend sur Plesk

```bash
# Via SSH
cd /var/www/vhosts/votre-domaine.com/api

# Installer les dépendances
composer install --optimize-autoloader --no-dev

# Configurer les permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Générer la clé
php artisan key:generate

# Exécuter les migrations
php artisan migrate --force

# Optimiser
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3.5 Configurer les permissions des fichiers

```bash
# Via SSH
cd /var/www/vhosts/votre-domaine.com

# Permissions pour le backend
chmod -R 755 api/
chmod -R 775 api/storage api/bootstrap/cache
chown -R www-data:www-data api/

# Permissions pour le frontend
chmod -R 755 httpdocs/
chown -R www-data:www-data httpdocs/
```

### 3.6 Vérifier le .htaccess de l'API

Le fichier `/api/public/.htaccess` doit contenir :

```apache
# Allow access to this directory
<IfModule mod_authz_core.c>
    Require all granted
</IfModule>

# For Apache 2.2
<IfModule !mod_authz_core.c>
    Order allow,deny
    Allow from all
</IfModule>

<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 3.7 Configurer Apache pour autoriser .htaccess

Dans Plesk, va dans "Apache & nginx Settings" pour ton domaine :

**Directives Apache supplémentaires** :
```apache
<Directory /var/www/vhosts/votre-domaine.com/api/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

Alias /api /var/www/vhosts/votre-domaine.com/api/public

<Directory /var/www/vhosts/votre-domaine.com/api/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
    
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ index.php [L]
    </IfModule>
</Directory>
```

**OU si tu utilises nginx comme proxy** :

**Directives nginx supplémentaires** :
```nginx
location /api {
    alias /var/www/vhosts/votre-domaine.com/api/public;
    try_files $uri $uri/ /api/index.php?$query_string;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        include fastcgi_params;
    }
}
```

## 🎯 Étape 4 : Configuration de la Base de Données

### 4.1 Créer la base de données dans Plesk

1. Va dans "Bases de données"
2. Clique sur "Ajouter une base de données"
3. Nom : `asano_db`
4. Utilisateur : `asano_user`
5. Mot de passe : Génère un mot de passe fort
6. Note les informations de connexion

### 4.2 Mettre à jour le .env

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=asano_db
DB_USERNAME=asano_user
DB_PASSWORD=ton_mot_de_passe
```

### 4.3 Importer les données (optionnel)

Si tu veux importer tes données de développement :

```bash
# Sur ton ordinateur
cd backend
sqlite3 database/database.sqlite .dump > dump.sql

# Adapter pour MySQL (remplacer les types SQLite)
# Puis sur le serveur
mysql -u asano_user -p asano_db < dump.sql
```

## 🎯 Étape 5 : Configuration SSL (HTTPS)

### 5.1 Activer Let's Encrypt dans Plesk

1. Va dans ton domaine
2. Clique sur "SSL/TLS Certificates"
3. Clique sur "Install" pour Let's Encrypt
4. Coche "Secure the domain and www subdomain"
5. Clique sur "Get it free"

### 5.2 Forcer HTTPS

Dans `.htaccess` à la racine :

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🎯 Étape 6 : Configuration des Tâches Planifiées (Cron)

Dans Plesk, va dans "Tâches planifiées" et ajoute :

**Commande** :
```bash
cd /var/www/vhosts/votre-domaine.com/api && php artisan schedule:run >> /dev/null 2>&1
```

**Fréquence** : Chaque minute (*/1 * * * *)

## 🎯 Étape 7 : Configuration de la Queue (Optionnel)

Pour les emails et notifications asynchrones :

### 7.1 Créer un service supervisor

Crée `/etc/supervisor/conf.d/asano-worker.conf` :

```ini
[program:asano-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/vhosts/votre-domaine.com/api/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/vhosts/votre-domaine.com/api/storage/logs/worker.log
```

### 7.2 Démarrer le worker

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start asano-worker:*
```

## 🎯 Étape 8 : Vérifications Finales

### 8.1 Tester l'API

```bash
curl https://votre-domaine.com/api/health
# Devrait retourner: {"ok":true}
```

### 8.2 Tester le frontend

Ouvre https://votre-domaine.com dans ton navigateur

### 8.3 Tester l'inscription

1. Crée un compte
2. Vérifie que l'email arrive
3. Connecte-toi
4. Crée un projet

### 8.4 Vérifier les logs

```bash
# Logs Laravel
tail -f /var/www/vhosts/votre-domaine.com/api/storage/logs/laravel.log

# Logs nginx
tail -f /var/log/nginx/error.log
```

## 🔧 Dépannage

### Erreur 403 Forbidden

Si tu vois "client denied by server configuration" dans les logs :

**Solution 1 : Vérifier les permissions**
```bash
# Permissions correctes
chmod -R 755 /var/www/vhosts/votre-domaine.com/api/
chmod -R 775 /var/www/vhosts/votre-domaine.com/api/storage
chmod -R 775 /var/www/vhosts/votre-domaine.com/api/bootstrap/cache
chown -R www-data:www-data /var/www/vhosts/votre-domaine.com/api/
```

**Solution 2 : Vérifier le .htaccess**

Assure-toi que `/api/public/.htaccess` contient bien :
```apache
<IfModule mod_authz_core.c>
    Require all granted
</IfModule>
```

**Solution 3 : Configuration Apache dans Plesk**

Dans Plesk → Apache & nginx Settings, ajoute :
```apache
<Directory /var/www/vhosts/votre-domaine.com/api/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

**Solution 4 : Vérifier les logs Apache**
```bash
tail -f /var/log/apache2/error.log
# ou
tail -f /var/www/vhosts/votre-domaine.com/logs/error_log
```

**Solution 5 : Redémarrer Apache**
```bash
sudo systemctl restart apache2
# ou via Plesk
service apache2 restart
```

### Erreur 500

```bash
# Vérifier les permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Erreur de base de données

```bash
# Vérifier la connexion
php artisan tinker
>>> DB::connection()->getPdo();
```

### Erreur CORS

Dans `backend/config/cors.php`, vérifie que ton domaine est autorisé :

```php
'allowed_origins' => ['https://votre-domaine.com'],
```

## 📊 Checklist de Déploiement

- [ ] Domaine configuré dans Plesk
- [ ] Base de données MySQL créée
- [ ] Backend uploadé dans `/api/`
- [ ] Frontend buildé et uploadé dans `/httpdocs/`
- [ ] `.env` de production configuré
- [ ] Migrations exécutées
- [ ] Permissions configurées (775 sur storage)
- [ ] SSL activé (Let's Encrypt)
- [ ] Cron job configuré
- [ ] Tests effectués (inscription, login, création projet)
- [ ] Emails fonctionnels

## 🎉 Résultat

Ton application Asano sera accessible sur :
- **Frontend** : https://votre-domaine.com
- **API** : https://votre-domaine.com/api

**Prêt pour la production !** 🚀
