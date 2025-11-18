<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            static::logActivity($model, 'created', 'a créé');
        });

        static::updated(function ($model) {
            static::logActivity($model, 'updated', 'a modifié');
        });

        static::deleted(function ($model) {
            // Ne pas logger la suppression d'un projet (contrainte FK)
            if (!($model instanceof \App\Models\Project)) {
                static::logActivity($model, 'deleted', 'a supprimé');
            }
        });
    }

    protected static function logActivity($model, $action, $actionText)
    {
        if (!Auth::check()) {
            return;
        }

        $modelName = class_basename($model);
        $modelTitle = $model->title ?? $model->name ?? "#{$model->id}";

        // Si le modèle est un Project, utiliser son propre ID comme project_id
        $projectId = $model instanceof \App\Models\Project 
            ? $model->id 
            : ($model->project_id ?? null);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'project_id' => $projectId,
            'action' => $action,
            'entity_type' => get_class($model),
            'entity_id' => $model->id,
            'description' => "{$actionText} {$modelName}: {$modelTitle}",
            'changes' => $action === 'updated' ? $model->getChanges() : null,
        ]);
    }
}
