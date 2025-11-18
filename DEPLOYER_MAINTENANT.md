# 🚀 DÉPLOYER SUR PLESK - MAINTENANT

## Étape 1 : Commit et Push (sur ta machine)

```bash
git add -A
git commit -m "Nettoyage base de données et suppression colonnes inutilisées"
git push origin main
```

---

## Étape 2 : Ouvrir le terminal SSH dans Plesk

1. Connecte-toi à Plesk (interface web)
2. Va dans ton domaine
3. Clique sur **"Terminal Web"** ou **"SSH Terminal"** dans le menu
4. Le terminal s'ouvre dans le navigateur

---

## Étape 3 : Aller dans le dossier du projet

```bash
cd httpdocs
```

ou si c'est ailleurs :

```bash
cd domains/votre-domaine.fr/httpdocs
```

---

## Étape 4 : Récupérer les modifications

```bash
git pull origin main
```

---

## Étape 5 : Mettre à jour le Backend

```bash
cd backend

# Mettre à jour les dépendances
composer install --optimize-autoloader --no-dev

# Exécuter la migration (supprime les colonnes inutilisées)
php artisan migrate --force

# Nettoyer le cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Re-optimiser
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Étape 6 : Mettre à jour le Frontend

```bash
cd ../frontend

# Mettre à jour les dépendances
npm install

# Rebuild
npm run build

# Copier dans public
cp -r dist/* ../backend/public/
```

---

## Étape 7 : Vérifier que ça marche

```bash
curl https://votre-domaine.fr/api/health
```

Devrait afficher : `{"ok":true}`

Puis ouvre ton navigateur : `https://votre-domaine.fr`

---

## ✅ C'EST TOUT !

Si tu as une erreur, envoie-moi le message d'erreur.

---

## 🆘 Si erreur pendant la migration

Si `php artisan migrate --force` donne une erreur genre "column doesn't exist", c'est normal, la migration vérifie avant de supprimer.

Si vraiment ça bloque :

```bash
# Voir les logs
tail -f backend/storage/logs/laravel.log
```

Et envoie-moi l'erreur.
