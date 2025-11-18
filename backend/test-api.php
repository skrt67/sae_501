<?php

/**
 * Script de test complet de l'API
 * Usage: php test-api.php
 */

$baseUrl = 'http://127.0.0.1:8000/api';
$token = null;
$userId = null;
$projectId = null;
$epicId = null;
$sprintId = null;
$taskId = null;

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

function test($name, $callback) {
    echo "\n🧪 Test: $name\n";
    try {
        $result = $callback();
        if ($result) {
            echo "✅ PASS\n";
            return true;
        } else {
            echo "❌ FAIL\n";
            return false;
        }
    } catch (Exception $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
        return false;
    }
}

$failedTests = [];

echo "🚀 Démarrage des tests API\n";
echo "==========================\n";

// Test 1: Health check
test("Health check", function() {
    $res = request('GET', '/health');
    return $res['code'] === 200 && $res['body']['ok'] === true;
});

// Test 2: Register
test("Register new user", function() use (&$token, &$userId) {
    $email = 'test_' . time() . '@example.com';
    $res = request('POST', '/register', [
        'name' => 'Test User',
        'email' => $email,
        'password' => 'password123',
        'password_confirmation' => 'password123'
    ]);
    
    if ($res['code'] === 201 && isset($res['body']['token'])) {
        $token = $res['body']['token'];
        $userId = $res['body']['user']['id'];
        return true;
    }
    return false;
});

// Test 3: Get current user
test("Get current user (/me)", function() use ($token) {
    $res = request('GET', '/me', null, $token);
    return $res['code'] === 200 && isset($res['body']['id']);
});

// Test 4: Create project
test("Create project", function() use ($token, &$projectId) {
    $res = request('POST', '/projects', [
        'name' => 'Test Project',
        'description' => 'Project for testing'
    ], $token);
    
    if ($res['code'] === 201 && isset($res['body']['id'])) {
        $projectId = $res['body']['id'];
        return true;
    }
    echo "Response: " . json_encode($res) . "\n";
    return false;
});

// Test 5: List projects
test("List projects", function() use ($token) {
    $res = request('GET', '/projects', null, $token);
    return $res['code'] === 200 && isset($res['body']['data']);
});

// Test 6: Get project
test("Get project details", function() use ($token, $projectId) {
    $res = request('GET', "/projects/$projectId", null, $token);
    return $res['code'] === 200 && $res['body']['id'] === $projectId;
});

// Test 7: Update project
test("Update project", function() use ($token, $projectId) {
    $res = request('PUT', "/projects/$projectId", [
        'name' => 'Updated Test Project'
    ], $token);
    return $res['code'] === 200 && $res['body']['name'] === 'Updated Test Project';
});

// Test 8: Create epic
test("Create epic", function() use ($token, $projectId, &$epicId) {
    $res = request('POST', '/epics', [
        'project_id' => $projectId,
        'name' => 'Test Epic',
        'description' => 'Epic for testing'
    ], $token);
    
    if ($res['code'] === 201 && isset($res['body']['id'])) {
        $epicId = $res['body']['id'];
        return true;
    }
    echo "Response: " . json_encode($res) . "\n";
    return false;
});

// Test 9: List epics
test("List epics", function() use ($token, $projectId) {
    $res = request('GET', "/epics?project_id=$projectId", null, $token);
    return $res['code'] === 200;
});

// Test 10: Create sprint
test("Create sprint", function() use ($token, $projectId, &$sprintId) {
    $res = request('POST', '/sprints', [
        'project_id' => $projectId,
        'name' => 'Sprint 1',
        'starts_at' => date('Y-m-d'),
        'ends_at' => date('Y-m-d', strtotime('+2 weeks')),
        'is_active' => true
    ], $token);
    
    if ($res['code'] === 201 && isset($res['body']['id'])) {
        $sprintId = $res['body']['id'];
        return true;
    }
    echo "Response: " . json_encode($res) . "\n";
    return false;
});

// Test 11: List sprints
test("List sprints", function() use ($token, $projectId) {
    $res = request('GET', "/sprints?project_id=$projectId", null, $token);
    return $res['code'] === 200;
});

// Test 12: Create task
test("Create task", function() use ($token, $projectId, $epicId, $sprintId, &$taskId) {
    $res = request('POST', '/tasks', [
        'project_id' => $projectId,
        'epic_id' => $epicId,
        'sprint_id' => $sprintId,
        'title' => 'Test Task',
        'description' => 'Task for testing',
        'status' => 'todo',
        'priority' => 3
    ], $token);
    
    if ($res['code'] === 201 && isset($res['body']['id'])) {
        $taskId = $res['body']['id'];
        return true;
    }
    echo "Response: " . json_encode($res) . "\n";
    return false;
});

// Test 13: List tasks
test("List tasks", function() use ($token) {
    $res = request('GET', '/tasks', null, $token);
    return $res['code'] === 200;
});

// Test 14: Update task status
test("Update task status", function() use ($token, $taskId) {
    $res = request('PUT', "/tasks/$taskId/status", [
        'status' => 'in_progress'
    ], $token);
    return $res['code'] === 200;
});

// Test 15: Get kanban board
test("Get kanban board", function() use ($token, $projectId) {
    $res = request('GET', "/kanban?project_id=$projectId", null, $token);
    if ($res['code'] !== 200) {
        echo "Response: " . json_encode($res) . "\n";
    }
    return $res['code'] === 200 && isset($res['body']['columns']);
});

// Test 16: Get dashboard
test("Get dashboard", function() use ($token) {
    $res = request('GET', '/dashboard', null, $token);
    if ($res['code'] !== 200) {
        echo "Response: " . json_encode($res) . "\n";
    }
    return $res['code'] === 200;
});

// Test 17: Get notifications
test("Get notifications", function() use ($token) {
    $res = request('GET', '/notifications', null, $token);
    return $res['code'] === 200;
});

// Test 18: Get activity logs
test("Get activity logs", function() use ($token, $projectId) {
    $res = request('GET', "/activities?project_id=$projectId", null, $token);
    if ($res['code'] !== 200) {
        echo "Response: " . json_encode($res) . "\n";
    }
    return $res['code'] === 200;
});

// Test 19: Get user settings
test("Get user settings", function() use ($token) {
    $res = request('GET', '/user/settings', null, $token);
    return $res['code'] === 200;
});

// Test 20: Update user settings
test("Update user settings", function() use ($token) {
    $res = request('PUT', '/user/settings', [
        'theme' => 'dark',
        'language' => 'fr'
    ], $token);
    if ($res['code'] !== 200) {
        echo "Response: " . json_encode($res) . "\n";
    }
    return $res['code'] === 200;
});

// Cleanup tests
echo "\n🧹 Nettoyage\n";
echo "============\n";

test("Delete task", function() use ($token, $taskId) {
    $res = request('DELETE', "/tasks/$taskId", null, $token);
    return $res['code'] === 204;
});

test("Delete sprint", function() use ($token, $sprintId) {
    $res = request('DELETE', "/sprints/$sprintId", null, $token);
    return $res['code'] === 204;
});

test("Delete epic", function() use ($token, $epicId) {
    $res = request('DELETE', "/epics/$epicId", null, $token);
    return $res['code'] === 204;
});

test("Delete project", function() use ($token, $projectId) {
    $res = request('DELETE', "/projects/$projectId", null, $token);
    if ($res['code'] !== 204) {
        echo "Response: " . json_encode($res) . "\n";
    }
    return $res['code'] === 204;
});

test("Logout", function() use ($token) {
    $res = request('POST', '/logout', null, $token);
    return $res['code'] === 200;
});

echo "\n✨ Tests terminés!\n";
