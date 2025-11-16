<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\EpicController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectMemberController;

Route::get('/health', function () {
    return response()->json(['ok' => true]);
});

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Profile
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/user/avatar', [AuthController::class, 'updateAvatar']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // User Settings
    Route::get('/user/settings', [UserSettingsController::class, 'index']);
    Route::put('/user/settings', [UserSettingsController::class, 'update']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{user}/role', [UserController::class, 'updateRole']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // CRUD
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('sprints', SprintController::class);
    Route::apiResource('epics', EpicController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::put('/tasks/{task}/status', [TaskController::class, 'updateStatus']);

    // Board
    Route::get('/kanban', [BoardController::class, 'kanban']);
    Route::get('/roadmap', [BoardController::class, 'roadmap']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Workspaces
    Route::apiResource('workspaces', WorkspaceController::class);
    Route::get('workspaces/{workspace}/members', [WorkspaceController::class, 'members']);
    Route::delete('workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'removeMember']);
    Route::post('workspaces/{workspace}/leave', [WorkspaceController::class, 'leave']);

    // Project Members
    Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

    // Invitations (scopées par workspace)
    Route::get('workspaces/{workspace}/invitations', [InvitationController::class, 'index']);
    Route::post('workspaces/{workspace}/invitations', [InvitationController::class, 'invite']);
    // Invitations reçues par l'utilisateur connecté
    Route::get('invitations/received', [InvitationController::class, 'received']);
    // Accept/Reject par token public (toujours authentifié dans notre app)
    Route::post('invitations/{token}/accept', [InvitationController::class, 'accept']);
    Route::post('invitations/{token}/reject', [InvitationController::class, 'reject']);
    Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy']);
});

