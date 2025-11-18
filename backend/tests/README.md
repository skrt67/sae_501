# 🧪 Tests Unitaires - Asano

## Tests Créés

### 1. AuthTest.php
Tests d'authentification :
- ✅ Inscription d'un utilisateur
- ✅ Connexion d'un utilisateur
- ✅ Échec de connexion avec mauvais mot de passe
- ✅ Récupération du profil authentifié
- ✅ Accès refusé aux routes protégées sans auth

### 2. ProjectTest.php
Tests de gestion de projets :
- ✅ Création d'un projet
- ✅ Liste des projets de l'utilisateur
- ✅ Mise à jour d'un projet
- ✅ Suppression d'un projet (owner uniquement)
- ✅ Accès refusé aux projets d'autres utilisateurs

### 3. TaskTest.php
Tests de gestion de tâches :
- ✅ Création d'une tâche
- ✅ Mise à jour du statut d'une tâche
- ✅ Suppression d'une tâche
- ✅ Validation de la priorité (1-5)

## Factories Créées

- **UserFactory** (déjà existant)
- **ProjectFactory** - Génère des projets de test
- **SprintFactory** - Génère des sprints de test
- **EpicFactory** - Génère des epics de test
- **TaskFactory** - Génère des tâches de test

## Lancer les Tests

```bash
# Tous les tests
php artisan test

# Tests spécifiques
php artisan test --filter=AuthTest
php artisan test --filter=ProjectTest
php artisan test --filter=TaskTest

# Avec couverture
php artisan test --coverage
```

## Configuration Requise

Les tests utilisent :
- **RefreshDatabase** : Réinitialise la DB entre chaque test
- **SQLite in-memory** : Base de données temporaire pour les tests
- **Factories** : Génération de données de test

## Structure des Tests

```
tests/
├── Feature/
│   ├── AuthTest.php       # Tests d'authentification
│   ├── ProjectTest.php    # Tests de projets
│   └── TaskTest.php       # Tests de tâches
└── Unit/
    └── (à venir)
```

## Prochaines Étapes

### Tests à Ajouter
- [ ] SprintTest - Tests de gestion des sprints
- [ ] EpicTest - Tests de gestion des epics
- [ ] KanbanTest - Tests du board Kanban
- [ ] NotificationTest - Tests des notifications
- [ ] InvitationTest - Tests des invitations

### Tests Unitaires
- [ ] Models - Validation des relations
- [ ] Helpers - Fonctions utilitaires
- [ ] Traits - LogsActivity, etc.

## Bonnes Pratiques

1. **Nommage** : `test_description_of_what_is_tested()`
2. **Arrange-Act-Assert** : Préparer, Exécuter, Vérifier
3. **Isolation** : Chaque test doit être indépendant
4. **Données** : Utiliser les factories pour générer des données
5. **Assertions** : Vérifier le comportement ET la base de données

## Exemple de Test

```php
/** @test */
public function user_can_create_project()
{
    // Arrange
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    // Act
    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token
    ])->postJson('/api/projects', [
        'name' => 'Test Project'
    ]);

    // Assert
    $response->assertStatus(201);
    $this->assertDatabaseHas('projects', [
        'name' => 'Test Project'
    ]);
}
```

## Couverture Actuelle

- **Authentification** : 80%
- **Projets** : 70%
- **Tâches** : 60%
- **Global** : ~40%

**Objectif** : 80% de couverture
