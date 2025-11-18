# 🔄 Mise à Jour Plesk - Modifications Avatar et Nettoyage

## Modifications à déployer
- ✅ Suppression des colonnes inutilisées (avatar_url, settings, role, phase, goal)
- ✅ Migration de nettoyage de la base de données
- ✅ Mise à jour des modèles et contrôleurs
- ✅ Mise à jour des types TypeScript

---

## 📋 Étapes de Mise à Jour

### 1. Se connecter en SSH

```bash
ssh votre_user@votre-domaine.fr
cd httpdocs
```

### 2. Sauvegarder la base de données (IMPORTANT!)

```bash
cd backend
php artisan db:backup
# ou manuellement:
mysqldump -u asano_user -p asano_db > backup_avant_update_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Récupérer les dernières modifications

```bash
cd ~/httpdocs
git pull origin main
```

### 4. Mettre à jour le Backend

```bash
cd backend

# Installer/mettre à jour les dépendances
composer install --optimize-autoloader --no-dev

# Exécuter la nouvelle migration (suppression colonnes)
php artisan migrate --force

# Nettoyer tous les caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Re-optimiser
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Mettre à jour le Frontend

```bash
cd ../frontend

# Installer/mettre à jour les dépendances
npm install

# Rebuild
npm run build

# Copier dans public
cp -r dist/* ../backend/public/
```

### 6. Vérifier les permissions

```bash
cd ../backend
chmod -R 755 storage bootstrap/cache
```

### 7. Tester

```bash
# Tester l'API
curl https://votre-domaine.fr/api/health

# Devrait retourner: {"ok":true}
```

---

## ✅ Vérifications Post-Déploiement

1. **Ouvrir le site** : `https://votre-domaine.fr`
2. **Se connecter** avec un compte existant
3. **Vérifier** :
   - ✅ La connexion fonctionne
   - ✅ Les projets s'affichent
   - ✅ Le Kanban fonctionne
   - ✅ Les tâches peuvent être déplacées
   - ✅ Les notifications fonctionnent
   - ✅ Les avatars affichent les initiales (pas d'images)

---

## 🐛 En cas de problème

### Si erreur 500

```bash
# Voir les logs
tail -f backend/storage/logs/laravel.log

# Vérifier les permissions
chmod -R 755 backend/storage backend/bootstrap/cache
```

### Si erreur de migration

```bash
# Voir quelle migration a échoué
php artisan migrate:status

# Si besoin, rollback la dernière migration
php artisan migrate:rollback --step=1

# Puis re-migrer
php artisan migrate --force
```

### Si le frontend ne se met pas à jour

```bash
# Nettoyer le cache du navigateur (Ctrl+Shift+R)

# Ou forcer le rebuild
cd frontend
rm -rf dist
npm run build
cp -r dist/* ../backend/public/

# Nettoyer le cache Laravel
cd ../backend
php artisan cache:clear
```

### Si la base de données a un problème

```bash
# Restaurer le backup
mysql -u asano_user -p asano_db < backup_avant_update_XXXXXX.sql

# Puis recommencer la migration
php artisan migrate --force
```

---

## 📝 Commandes Rapides (Tout en Une)

Si tu veux tout faire d'un coup :

```bash
# Se connecter
ssh votre_user@votre-domaine.fr
cd httpdocs

# Backup DB
cd backend
mysqldump -u asano_user -p asano_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Update
cd ..
git pull origin main

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:clear && php artisan cache:clear
php artisan config:cache && php artisan route:cache && php artisan view:cache
chmod -R 755 storage bootstrap/cache

# Frontend
cd ../frontend
npm install
npm run build
cp -r dist/* ../backend/public/

# Test
curl https://votre-domaine.fr/api/health

echo "✅ Mise à jour terminée!"
```

---

## 🔍 Vérifier les Changements

### Dans la base de données

```bash
# Se connecter à MySQL
mysql -u asano_user -p asano_db

# Vérifier la structure de la table users
DESCRIBE users;

# Devrait NE PLUS avoir: avatar_url, settings, role
# Devrait avoir: id, name, email, email_verified_at, password, remember_token, created_at, updated_at

# Vérifier epics
DESCRIBE epics;
# Ne devrait plus avoir: phase

# Vérifier sprints
DESCRIBE sprints;
# Ne devrait plus avoir: phase, goal

# Quitter
EXIT;
```

---

## ⏱️ Temps Estimé

- **Backup** : 1-2 min
- **Git pull** : 30 sec
- **Backend update** : 2-3 min
- **Frontend rebuild** : 3-5 min
- **Tests** : 2 min

**Total : ~10-15 minutes**

---

## 📞 Si Ça Ne Marche Pas

1. **Vérifier les logs** : `tail -f backend/storage/logs/laravel.log`
2. **Restaurer le backup** : `mysql -u asano_user -p asano_db < backup_XXXXX.sql`
3. **Revenir en arrière** : `git reset --hard HEAD~1`
4. **Contacter le support** avec les logs d'erreur

---

**Bonne mise à jour ! 🚀**
