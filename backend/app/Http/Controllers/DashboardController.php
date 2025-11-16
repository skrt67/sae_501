<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $projectId = $validated['project_id'] ?? null;

        $query = Task::query();
        if ($projectId) {
            // Vérifier que l'utilisateur a accès à ce projet
            $project = Project::findOrFail($projectId);
            if (!$project->users()->where('users.id', $request->user()->id)->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $query->where('project_id', $projectId);
        }

        $total = (clone $query)->count();
        $byStatus = [
            'todo' => (clone $query)->where('status','todo')->count(),
            'in_progress' => (clone $query)->where('status','in_progress')->count(),
            'done' => (clone $query)->where('status','done')->count(),
        ];
        $overdue = (clone $query)->whereNotNull('due_date')->where('due_date','<', now()->toDateString())->where('status','!=','done')->count();
        $byAssignee = (clone $query)
            ->selectRaw('assignee_id, count(*) as cnt')
            ->groupBy('assignee_id')
            ->get()
            ->map(function($row){ return ['assignee_id' => $row->assignee_id, 'count' => (int)$row->cnt]; });

        return [
            'totalTasks' => $total,
            'byStatus' => $byStatus,
            'overdue' => $overdue,
            'byAssignee' => $byAssignee,
        ];
    }
}


