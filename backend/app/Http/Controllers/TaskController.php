<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Sprint;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;


class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Task::with('project','sprint','epic','assignee')
            ->whereHas('project.users', function($q) use ($user) {
                $q->where('users.id', $user->id);
            });
        
        // Filtrer par projet si spécifié
        if ($request->has('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }
        
        // Filtrer par sprint si spécifié
        if ($request->has('sprint_id')) {
            $query->where('sprint_id', $request->input('sprint_id'));
        }
        
        // Filtrer par epic si spécifié
        if ($request->has('epic_id')) {
            $query->where('epic_id', $request->input('epic_id'));
        }
        
        return $query->latest()->paginate(20);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'project_id' => ['required','exists:projects,id'],
            'workspace_id' => ['nullable','exists:workspaces,id'],
            'sprint_id' => ['nullable','exists:sprints,id'],
            'epic_id' => ['nullable','exists:epics,id'],
            'assignee_id' => ['nullable','exists:users,id'],
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'status' => ['in:todo,in_progress,done'],
            'due_date' => ['nullable','date'],
            'priority' => ['nullable','integer','between:1,5'],
            'dependencies' => ['array'],
            'dependencies.*' => ['integer','exists:tasks,id'],
        ]);

        // Règle: si on met une tâche en "in_progress", toutes ses dépendances doivent être "done"
        if (($data['status'] ?? 'todo') === 'in_progress' && !empty($data['dependencies'])) {
            $blocking = Task::whereIn('id', $data['dependencies'])->where('status','!=','done')->exists();
            if ($blocking) {
                return response()->json(['message' => 'Dependencies must be done before starting this task'], 422);
            }
        }

        $dependencies = $data['dependencies'] ?? [];
        unset($data['dependencies']);

        $task = Task::create($data);
        if (!empty($dependencies)) {
            $task->dependencies()->sync($dependencies);
        }

        // Envoyer notification si tâche assignée
        if ($task->assignee_id) {
            $assignee = User::find($task->assignee_id);
            if ($assignee) {
                $assignee->notify(new \App\Notifications\TaskAssignedNotification($task, $request->user()));
                
                // Vérifier l'échéance immédiatement
                if ($task->due_date && $task->status !== 'done') {
                    $dueDate = \Carbon\Carbon::parse($task->due_date);
                    $now = \Carbon\Carbon::now();
                    $daysUntilDue = $now->diffInDays($dueDate, false);
                    
                    // Tâche en retard
                    if ($daysUntilDue < 0) {
                        $assignee->notify(new \App\Notifications\TaskOverdueNotification($task, abs($daysUntilDue)));
                    }
                    // Tâche échéance dans 3 jours ou moins
                    elseif ($daysUntilDue >= 0 && $daysUntilDue <= 3) {
                        $assignee->notify(new \App\Notifications\TaskDueSoonNotification($task, (int)$daysUntilDue));
                    }
                }
            }
        }

        return response()->json($task->load('project','sprint','epic','assignee','dependencies'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Task $task)
    {
        $user = $request->user();
        
       
        if (!$task->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        return $task->load('project','sprint','epic','assignee','dependencies');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet de la tâche
        if (!$task->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $data = $request->validate([
            'workspace_id' => ['nullable','exists:workspaces,id'],
            'sprint_id' => ['nullable','exists:sprints,id'],
            'epic_id' => ['nullable','exists:epics,id'],
            'assignee_id' => ['nullable','exists:users,id'],
            'title' => ['sometimes','string','max:255'],
            'description' => ['nullable','string'],
            'status' => ['sometimes','in:todo,in_progress,done'],
            'due_date' => ['nullable','date'],
            'priority' => ['nullable','integer','between:1,5'],
            'dependencies' => ['array'],
            'dependencies.*' => ['integer','exists:tasks,id'],
        ]);

        // Interdire passage à in_progress si dépendances non done
        if (($data['status'] ?? null) === 'in_progress') {
            $deps = $data['dependencies'] ?? $task->dependencies()->pluck('tasks.id');
            if (!empty($deps)) {
                $blocking = Task::whereIn('id', $deps)->where('status','!=','done')->exists();
                if ($blocking) {
                    return response()->json(['message' => 'Dependencies must be done before starting this task'], 422);
                }
            }
        }

        $dependencies = $data['dependencies'] ?? null;
        unset($data['dependencies']);

        // Vérifier si l'assignation a changé
        $oldAssigneeId = $task->assignee_id;
        $newAssigneeId = $data['assignee_id'] ?? null;

        $task->update($data);
        if (is_array($dependencies)) {
            $task->dependencies()->sync($dependencies);
        }

        // Envoyer notification si assignation a changé
        if ($newAssigneeId && $newAssigneeId !== $oldAssigneeId) {
            $assignee = User::find($newAssigneeId);
            if ($assignee) {
                $assignee->notify(new \App\Notifications\TaskAssignedNotification($task->fresh(), $request->user()));
            }
        }

        // Vérifier l'échéance si due_date a changé ou si assignee_id présent
        if ($task->assignee_id && $task->due_date && $task->status !== 'done') {
            $assignee = User::find($task->assignee_id);
            if ($assignee) {
                $dueDate = \Carbon\Carbon::parse($task->due_date);
                $now = \Carbon\Carbon::now();
                $daysUntilDue = $now->diffInDays($dueDate, false);
                
                // Tâche en retard
                if ($daysUntilDue < 0) {
                    $assignee->notify(new \App\Notifications\TaskOverdueNotification($task, abs($daysUntilDue)));
                }
                // Tâche échéance dans 3 jours ou moins
                elseif ($daysUntilDue >= 0 && $daysUntilDue <= 3) {
                    $assignee->notify(new \App\Notifications\TaskDueSoonNotification($task, (int)$daysUntilDue));
                }
            }
        }

        return $task->load('project','sprint','epic','assignee','dependencies');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Task $task)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet de la tâche
        if (!$task->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $task->delete();
        return response()->noContent();
    }

    public function updateStatus(Request $request, Task $task)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet de la tâche
        if (!$task->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['todo', 'in_progress', 'done'])],
        ]);

        // Interdire passage à in_progress si dépendances non done
        if ($data['status'] === 'in_progress') {
            $deps = $task->dependencies()->pluck('tasks.id');
            if (!empty($deps)) {
                $blocking = Task::whereIn('id', $deps)->where('status', '!=', 'done')->exists();
                if ($blocking) {
                    return response()->json(['message' => 'Dependencies must be done before starting this task'], 422);
                }
            }
        }

        $task->status = $data['status'];
        $task->save();

        return response()->json($task->load('project', 'sprint', 'epic', 'assignee', 'dependencies'));
    }
}
