<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Récupérer l'historique des activités d'un projet
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $projectId = $request->query('project_id');

        if (!$projectId) {
            return response()->json(['message' => 'project_id requis'], 400);
        }

        // Vérifier que l'utilisateur a accès au projet
        $project = $user->projects()->find($projectId);
        if (!$project) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $activities = ActivityLog::with('user:id,name,email')
            ->where('project_id', $projectId)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($activities);
    }

    /**
     * Créer une entrée d'activité
     */
    public static function log(
        int $userId,
        int $projectId,
        string $action,
        string $entityType,
        int $entityId,
        string $description,
        ?array $changes = null
    ) {
        ActivityLog::create([
            'user_id' => $userId,
            'project_id' => $projectId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'changes' => $changes,
            'description' => $description,
        ]);
    }
}
