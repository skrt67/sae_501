<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function kanban(Request $request)
    {
        $request->validate([
            'project_id' => ['required_without:sprint_id','exists:projects,id'],
            'sprint_id' => ['nullable','exists:sprints,id'],
        ]);

        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet
        if ($request->filled('project_id')) {
            $project = Project::findOrFail($request->integer('project_id'));
            if (!$project->users()->where('users.id', $user->id)->exists()) {
                return response()->json(['message' => 'Accès non autorisé à ce projet'], 403);
            }
        }

        $sprint = null;
        if ($request->filled('sprint_id')) {
            $sprint = Sprint::with('tasks.epic')->findOrFail($request->integer('sprint_id'));
            // Vérifier l'accès au projet du sprint
            if (!$sprint->project->users()->where('users.id', $user->id)->exists()) {
                return response()->json(['message' => 'Accès non autorisé à ce projet'], 403);
            }
        } else {
            $sprint = Sprint::where('project_id', $request->integer('project_id'))
                ->where('is_active', true)
                ->with('tasks.epic')
                ->orderByDesc('starts_at')
                ->first();
        }

        if (!$sprint) {
            return response()->json(['message' => 'No active sprint'], 404);
        }

        $tasks = $sprint->tasks()->with('epic','assignee')->get();

        $columns = [
            'todo' => [],
            'in_progress' => [],
            'done' => [],
        ];

        foreach ($tasks as $task) {
            $columns[$task->status][] = [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'epic' => $task->epic ? ['id' => $task->epic->id, 'name' => $task->epic->name, 'color' => $task->epic->color] : null,
                'assignee' => $task->assignee ? ['id' => $task->assignee->id, 'name' => $task->assignee->name] : null,
                'due_date' => $task->due_date,
                'priority' => $task->priority,
            ];
        }

        return [
            'sprint' => [
                'id' => $sprint->id,
                'name' => $sprint->name,
                'starts_at' => $sprint->starts_at,
                'ends_at' => $sprint->ends_at,
            ],
            'columns' => $columns,
        ];
    }

    public function roadmap(Request $request)
    {
        $data = $request->validate([
            'project_id' => ['required','exists:projects,id'],
        ]);

        $user = $request->user();
        $project = Project::findOrFail($data['project_id']);
        
        // Vérifier que l'utilisateur a accès au projet
        if (!$project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé à ce projet'], 403);
        }
        $sprints = $project->sprints()->orderBy('starts_at')->get(['id','name','starts_at','ends_at']);
        $epics = $project->epics()->withCount(['tasks as done_tasks_count' => function($q){ $q->where('status','done'); }])->get(['id','name','color']);

        $tasks = $project->tasks()->get(['id','title','status','sprint_id','epic_id']);
        $tasksBySprint = [];
        foreach ($sprints as $s) { $tasksBySprint[$s->id] = []; }
        foreach ($tasks as $t) {
            if ($t->sprint_id && isset($tasksBySprint[$t->sprint_id])) {
                $tasksBySprint[$t->sprint_id][] = [
                    'id' => $t->id,
                    'title' => $t->title,
                    'status' => $t->status,
                    'epic_id' => $t->epic_id,
                ];
            }
        }

        return [
            'sprints' => $sprints,
            'epics' => $epics,
            'tasksBySprint' => $tasksBySprint,
        ];
    }
}


