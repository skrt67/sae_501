<?php

/**
 * Script de démonstration complète de l'application Asano
 * Ce script crée des données de démonstration réalistes
 */

$baseUrl = 'http://127.0.0.1:8000/api';
$token = null;
$users = [];
$projects = [];
$epics = [];
$sprints = [];
$tasks = [];

function request($method, $url, $data = null, $token = null) {
    global $baseUrl;
    
    $ch = curl_init($baseUrl . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'body' => json_decode($response, true)];
}

function step($message) {
    echo "\n" . str_repeat("=", 80) . "\n";
    echo "📍 $message\n";
    echo str_repeat("=", 80) . "\n";
}

function success($message) {
    echo "✅ $message\n";
}

function info($message) {
    echo "ℹ️  $message\n";
}

echo "\n";
echo "╔════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                    🚀 DÉMONSTRATION ASANO PROJECT MANAGEMENT               ║\n";
echo "╚════════════════════════════════════════════════════════════════════════════╝\n";

// ============================================================================
// 1. AUTHENTIFICATION
// ============================================================================
step("1. AUTHENTIFICATION - Création d'un compte utilisateur");

$email = 'demo_' . time() . '@asano.com';
$res = request('POST', '/register', [
    'name' => 'Alice Dupont',
    'email' => $email,
    'password' => 'password123',
    'password_confirmation' => 'password123'
]);

if ($res['code'] === 201) {
    $token = $res['body']['token'];
    $users['alice'] = $res['body']['user'];
    success("Utilisateur créé: {$users['alice']['name']} ({$users['alice']['email']})");
    info("Token d'authentification obtenu");
} else {
    die("❌ Erreur lors de la création du compte\n");
}

// Vérifier le profil
$res = request('GET', '/me', null, $token);
if ($res['code'] === 200) {
    success("Profil utilisateur récupéré: ID {$res['body']['id']}");
}

// ============================================================================
// 2. CRÉATION DE PROJETS
// ============================================================================
step("2. GESTION DE PROJETS - Création de plusieurs projets");

$projectsData = [
    [
        'name' => 'Site E-commerce',
        'description' => 'Refonte complète du site e-commerce avec nouvelle interface utilisateur'
    ],
    [
        'name' => 'Application Mobile',
        'description' => 'Développement d\'une application mobile iOS et Android'
    ],
    [
        'name' => 'API REST',
        'description' => 'Création d\'une API REST pour les services tiers'
    ]
];

foreach ($projectsData as $projectData) {
    $res = request('POST', '/projects', $projectData, $token);
    if ($res['code'] === 201) {
        $projects[] = $res['body'];
        success("Projet créé: {$projectData['name']} (ID: {$res['body']['id']})");
    }
}

// Lister les projets
$res = request('GET', '/projects', null, $token);
if ($res['code'] === 200) {
    info("Total de projets: " . count($res['body']['data']));
}

// ============================================================================
// 3. CRÉATION D'EPICS
// ============================================================================
step("3. EPICS - Création des grandes fonctionnalités");

$epicsData = [
    [
        'project_id' => $projects[0]['id'],
        'name' => 'Authentification Utilisateur',
        'description' => 'Système complet d\'authentification avec OAuth2',
        'color' => '#3B82F6',
        'status' => 'in_progress'
    ],
    [
        'project_id' => $projects[0]['id'],
        'name' => 'Panier d\'Achat',
        'description' => 'Gestion du panier avec calcul des prix et promotions',
        'color' => '#10B981',
        'status' => 'todo'
    ],
    [
        'project_id' => $projects[0]['id'],
        'name' => 'Paiement en Ligne',
        'description' => 'Intégration Stripe et PayPal',
        'color' => '#F59E0B',
        'status' => 'todo'
    ],
    [
        'project_id' => $projects[1]['id'],
        'name' => 'Interface Utilisateur',
        'description' => 'Design et développement de l\'UI mobile',
        'color' => '#8B5CF6',
        'status' => 'in_progress'
    ]
];

foreach ($epicsData as $epicData) {
    $res = request('POST', '/epics', $epicData, $token);
    if ($res['code'] === 201) {
        $epics[] = $res['body'];
        success("Epic créé: {$epicData['name']} (ID: {$res['body']['id']})");
    }
}

// ============================================================================
// 4. CRÉATION DE SPRINTS
// ============================================================================
step("4. SPRINTS - Planification des itérations");

$sprintsData = [
    [
        'project_id' => $projects[0]['id'],
        'name' => 'Sprint 1 - Foundation',
        'starts_at' => date('Y-m-d'),
        'ends_at' => date('Y-m-d', strtotime('+2 weeks')),
        'is_active' => true
    ],
    [
        'project_id' => $projects[0]['id'],
        'name' => 'Sprint 2 - Core Features',
        'starts_at' => date('Y-m-d', strtotime('+2 weeks')),
        'ends_at' => date('Y-m-d', strtotime('+4 weeks')),
        'is_active' => false
    ],
    [
        'project_id' => $projects[1]['id'],
        'name' => 'Sprint 1 - MVP',
        'starts_at' => date('Y-m-d'),
        'ends_at' => date('Y-m-d', strtotime('+2 weeks')),
        'is_active' => true
    ]
];

foreach ($sprintsData as $sprintData) {
    $res = request('POST', '/sprints', $sprintData, $token);
    if ($res['code'] === 201) {
        $sprints[] = $res['body'];
        $status = $sprintData['is_active'] ? '🟢 ACTIF' : '⚪ PLANIFIÉ';
        success("Sprint créé: {$sprintData['name']} $status (ID: {$res['body']['id']})");
    }
}

// ============================================================================
// 5. CRÉATION DE TÂCHES
// ============================================================================
step("5. TÂCHES - Création des tâches détaillées");

$tasksData = [
    // Sprint 1 - E-commerce
    [
        'project_id' => $projects[0]['id'],
        'sprint_id' => $sprints[0]['id'],
        'epic_id' => $epics[0]['id'],
        'title' => 'Créer le modèle User',
        'description' => 'Implémenter le modèle User avec les champs nécessaires',
        'status' => 'done',
        'priority' => 5,
        'due_date' => date('Y-m-d', strtotime('+3 days'))
    ],
    [
        'project_id' => $projects[0]['id'],
        'sprint_id' => $sprints[0]['id'],
        'epic_id' => $epics[0]['id'],
        'title' => 'Implémenter le login JWT',
        'description' => 'Système d\'authentification avec JWT tokens',
        'status' => 'in_progress',
        'priority' => 5,
        'due_date' => date('Y-m-d', strtotime('+5 days'))
    ],
    [
        'project_id' => $projects[0]['id'],
        'sprint_id' => $sprints[0]['id'],
        'epic_id' => $epics[0]['id'],
        'title' => 'Ajouter OAuth2 Google',
        'description' => 'Permettre la connexion via Google',
        'status' => 'todo',
        'priority' => 3,
        'due_date' => date('Y-m-d', strtotime('+7 days'))
    ],
    [
        'project_id' => $projects[0]['id'],
        'sprint_id' => $sprints[0]['id'],
        'epic_id' => $epics[1]['id'],
        'title' => 'Créer le composant Panier',
        'description' => 'Interface React pour le panier d\'achat',
        'status' => 'in_progress',
        'priority' => 4,
        'due_date' => date('Y-m-d', strtotime('+6 days'))
    ],
    [
        'project_id' => $projects[0]['id'],
        'sprint_id' => $sprints[0]['id'],
        'epic_id' => $epics[1]['id'],
        'title' => 'Calculer les totaux',
        'description' => 'Logique de calcul des prix avec taxes et promotions',
        'status' => 'todo',
        'priority' => 4,
        'due_date' => date('Y-m-d', strtotime('+8 days'))
    ],
    [
        'project_id' => $projects[0]['id'],
        'sprint_id' => $sprints[0]['id'],
        'epic_id' => $epics[2]['id'],
        'title' => 'Intégrer Stripe',
        'description' => 'Configuration et intégration de Stripe Payment',
        'status' => 'todo',
        'priority' => 5,
        'due_date' => date('Y-m-d', strtotime('+10 days'))
    ],
    // Sprint 1 - Mobile App
    [
        'project_id' => $projects[1]['id'],
        'sprint_id' => $sprints[2]['id'],
        'epic_id' => $epics[3]['id'],
        'title' => 'Design des écrans principaux',
        'description' => 'Maquettes Figma pour les écrans Home, Profile, Settings',
        'status' => 'done',
        'priority' => 5,
        'due_date' => date('Y-m-d', strtotime('+2 days'))
    ],
    [
        'project_id' => $projects[1]['id'],
        'sprint_id' => $sprints[2]['id'],
        'epic_id' => $epics[3]['id'],
        'title' => 'Implémenter la navigation',
        'description' => 'React Navigation avec stack et tab navigators',
        'status' => 'in_progress',
        'priority' => 4,
        'due_date' => date('Y-m-d', strtotime('+5 days'))
    ],
    [
        'project_id' => $projects[1]['id'],
        'sprint_id' => $sprints[2]['id'],
        'epic_id' => $epics[3]['id'],
        'title' => 'Créer les composants UI',
        'description' => 'Bibliothèque de composants réutilisables',
        'status' => 'todo',
        'priority' => 3,
        'due_date' => date('Y-m-d', strtotime('+7 days'))
    ]
];

foreach ($tasksData as $taskData) {
    $res = request('POST', '/tasks', $taskData, $token);
    if ($res['code'] === 201) {
        $tasks[] = $res['body'];
        $statusEmoji = [
            'todo' => '⚪',
            'in_progress' => '🔵',
            'done' => '✅'
        ];
        $priorityStars = str_repeat('⭐', $taskData['priority']);
        success("Tâche créée: {$taskData['title']} {$statusEmoji[$taskData['status']]} $priorityStars");
    }
}

// ============================================================================
// 6. KANBAN BOARD
// ============================================================================
step("6. KANBAN BOARD - Visualisation du sprint actif");

$res = request('GET', "/kanban?project_id={$projects[0]['id']}", null, $token);
if ($res['code'] === 200) {
    $kanban = $res['body'];
    success("Kanban chargé pour: {$kanban['sprint']['name']}");
    info("📋 TODO: " . count($kanban['columns']['todo']) . " tâches");
    info("🔄 IN PROGRESS: " . count($kanban['columns']['in_progress']) . " tâches");
    info("✅ DONE: " . count($kanban['columns']['done']) . " tâches");
    
    echo "\nDétail des colonnes:\n";
    foreach ($kanban['columns'] as $status => $columnTasks) {
        echo "\n  " . strtoupper($status) . ":\n";
        foreach ($columnTasks as $task) {
            $epicName = $task['epic'] ? "[{$task['epic']['name']}]" : "";
            echo "    • {$task['title']} $epicName\n";
        }
    }
}

// ============================================================================
// 7. DASHBOARD
// ============================================================================
step("7. DASHBOARD - Statistiques du projet");

$res = request('GET', "/dashboard?project_id={$projects[0]['id']}", null, $token);
if ($res['code'] === 200) {
    $dashboard = $res['body'];
    success("Dashboard chargé");
    echo "\n📊 Statistiques:\n";
    echo "  • Total de tâches: {$dashboard['totalTasks']}\n";
    echo "  • TODO: {$dashboard['byStatus']['todo']}\n";
    echo "  • EN COURS: {$dashboard['byStatus']['in_progress']}\n";
    echo "  • TERMINÉES: {$dashboard['byStatus']['done']}\n";
    echo "  • En retard: {$dashboard['overdue']}\n";
    
    $completion = $dashboard['totalTasks'] > 0 
        ? round(($dashboard['byStatus']['done'] / $dashboard['totalTasks']) * 100) 
        : 0;
    echo "\n  📈 Progression: $completion%\n";
    echo "  " . str_repeat("█", $completion / 5) . str_repeat("░", (100 - $completion) / 5) . "\n";
}

// ============================================================================
// 8. MISE À JOUR DE TÂCHE
// ============================================================================
step("8. MISE À JOUR - Déplacer une tâche dans le Kanban");

if (!empty($tasks)) {
    $taskToUpdate = $tasks[2]; // Une tâche en "todo"
    $res = request('PUT', "/tasks/{$taskToUpdate['id']}/status", [
        'status' => 'in_progress'
    ], $token);
    
    if ($res['code'] === 200) {
        success("Tâche déplacée: '{$taskToUpdate['title']}' → IN PROGRESS");
    }
}

// ============================================================================
// 9. NOTIFICATIONS
// ============================================================================
step("9. NOTIFICATIONS - Centre de notifications");

$res = request('GET', '/notifications', null, $token);
if ($res['code'] === 200) {
    $notifications = $res['body'];
    success("Notifications chargées");
    info("Nombre de notifications: " . count($notifications));
    
    if (count($notifications) > 0) {
        echo "\n📬 Dernières notifications:\n";
        foreach (array_slice($notifications, 0, 5) as $notif) {
            $message = isset($notif['data']['message']) ? $notif['data']['message'] : 'Notification';
            echo "  • $message\n";
        }
    } else {
        info("Aucune notification pour le moment");
    }
}

// ============================================================================
// 10. ACTIVITY LOGS
// ============================================================================
step("10. HISTORIQUE - Logs d'activité du projet");

$res = request('GET', "/activities?project_id={$projects[0]['id']}", null, $token);
if ($res['code'] === 200) {
    $activities = $res['body'];
    success("Historique chargé");
    info("Nombre d'activités: " . $activities['total']);
    
    echo "\n📜 Dernières activités:\n";
    foreach (array_slice($activities['data'], 0, 10) as $activity) {
        $time = date('H:i', strtotime($activity['created_at']));
        $user = isset($activity['user']['name']) ? $activity['user']['name'] : 'Utilisateur';
        echo "  [$time] $user - {$activity['description']}\n";
    }
}

// ============================================================================
// 11. USER SETTINGS
// ============================================================================
step("11. PARAMÈTRES UTILISATEUR - Configuration personnelle");

// Récupérer les paramètres actuels
$res = request('GET', '/user/settings', null, $token);
if ($res['code'] === 200) {
    success("Paramètres actuels récupérés");
}

// Mettre à jour les paramètres
$res = request('PUT', '/user/settings', [
    'theme' => 'dark',
    'language' => 'fr',
    'notif_task_assigned' => true,
    'notif_due_soon' => true,
    'timezone' => 'Europe/Paris'
], $token);

if ($res['code'] === 200) {
    success("Paramètres mis à jour");
    echo "\n⚙️  Configuration:\n";
    foreach ($res['body'] as $key => $value) {
        $displayValue = is_bool($value) ? ($value ? 'Oui' : 'Non') : $value;
        echo "  • $key: $displayValue\n";
    }
}

// ============================================================================
// 12. ROADMAP
// ============================================================================
step("12. ROADMAP - Vue d'ensemble du projet");

$res = request('GET', "/roadmap?project_id={$projects[0]['id']}", null, $token);
if ($res['code'] === 200) {
    $roadmap = $res['body'];
    success("Roadmap chargée");
    
    echo "\n🗓️  Sprints planifiés:\n";
    foreach ($roadmap['sprints'] as $sprint) {
        $start = date('d/m', strtotime($sprint['starts_at']));
        $end = date('d/m', strtotime($sprint['ends_at']));
        echo "  • {$sprint['name']} ($start - $end)\n";
    }
    
    echo "\n🎯 Epics:\n";
    foreach ($roadmap['epics'] as $epic) {
        echo "  • {$epic['name']}\n";
    }
}

// ============================================================================
// RÉSUMÉ FINAL
// ============================================================================
echo "\n";
echo "╔════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                           📊 RÉSUMÉ DE LA DÉMONSTRATION                    ║\n";
echo "╚════════════════════════════════════════════════════════════════════════════╝\n";
echo "\n";
echo "✅ Utilisateurs créés: 1\n";
echo "✅ Projets créés: " . count($projects) . "\n";
echo "✅ Epics créés: " . count($epics) . "\n";
echo "✅ Sprints créés: " . count($sprints) . "\n";
echo "✅ Tâches créées: " . count($tasks) . "\n";
echo "\n";
echo "🌐 Accès à l'application:\n";
echo "   Frontend: http://localhost:5173\n";
echo "   Backend:  http://127.0.0.1:8000\n";
echo "\n";
echo "🔑 Identifiants de connexion:\n";
echo "   Email:    $email\n";
echo "   Password: password123\n";
echo "\n";
echo "💡 Vous pouvez maintenant vous connecter avec ces identifiants\n";
echo "   et explorer toutes les fonctionnalités de l'application!\n";
echo "\n";
echo "╔════════════════════════════════════════════════════════════════════════════╗\n";
echo "║                        ✨ DÉMONSTRATION TERMINÉE ✨                        ║\n";
echo "╚════════════════════════════════════════════════════════════════════════════╝\n";
echo "\n";
