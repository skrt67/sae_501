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
use App\Http\Controllers\ExportController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

Route::get('/health', function () {
    return response()->json(['ok' => true]);
});

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset
Route::post('/password/forgot', [App\Http\Controllers\PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [App\Http\Controllers\PasswordResetController::class, 'reset']);
Route::post('/password/verify-token', [App\Http\Controllers\PasswordResetController::class, 'verifyToken']);

// Email Verification
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/email/verification-notification', function (Illuminate\Http\Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Email de vérification envoyé']);
    })->middleware('throttle:6,1')->name('verification.send');

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();
        return response()->json(['message' => 'Email vérifié avec succès']);
    })->middleware('signed')->name('verification.verify');
});

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



    // Project Members
    Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
    Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

    // Project Invitations
    Route::get('projects/{project}/invitations', [App\Http\Controllers\ProjectInvitationController::class, 'index']);
    Route::post('projects/{project}/invitations', [App\Http\Controllers\ProjectInvitationController::class, 'invite']);
    Route::post('invitations/{token}/accept', [App\Http\Controllers\ProjectInvitationController::class, 'accept']);

    // Invitations reçues par l'utilisateur connecté
    Route::get('invitations/received', [App\Http\Controllers\ProjectInvitationController::class, 'received']);
    Route::delete('invitations/{invitation}', [App\Http\Controllers\ProjectInvitationController::class, 'destroy']);

    // Export de données
    Route::get('export/tasks/csv', [ExportController::class, 'exportTasksCSV']);
    Route::get('export/tasks/excel', [ExportController::class, 'exportTasksExcel']);
    Route::get('export/tasks/pdf', [ExportController::class, 'exportTasksPDF']);

    // Activity Logs
    Route::get('activities', [App\Http\Controllers\ActivityLogController::class, 'index']);
});

