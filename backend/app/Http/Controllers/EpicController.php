<?php

namespace App\Http\Controllers;

use App\Models\Epic;
use Illuminate\Http\Request;

class EpicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Retourner uniquement les epics des projets dont l'utilisateur est membre
        return Epic::with('project')
            ->withCount('tasks')
            ->whereHas('project.users', function($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->latest()
            ->paginate(20);
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
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'color' => ['nullable','string','max:20'],
            'start_date' => ['nullable','date'],
            'end_date' => ['nullable','date','after_or_equal:start_date'],
            'status' => ['nullable','string','in:planned,in_progress,completed,on_hold'],
            'phase' => ['nullable','string','max:255'],
        ]);
        $epic = Epic::create($data);
        return response()->json($epic, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Epic $epic)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet de l'epic
        if (!$epic->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        return $epic->loadCount('tasks')->load('project','tasks');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Epic $epic)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Epic $epic)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet de l'epic
        if (!$epic->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'description' => ['nullable','string'],
            'color' => ['nullable','string','max:20'],
            'start_date' => ['nullable','date'],
            'end_date' => ['nullable','date','after_or_equal:start_date'],
            'status' => ['nullable','string','in:planned,in_progress,completed,on_hold'],
            'phase' => ['nullable','string','max:255'],
        ]);
        $epic->update($data);
        return $epic;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Epic $epic)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet de l'epic
        if (!$epic->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $epic->delete();
        return response()->noContent();
    }
}
