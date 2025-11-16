<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Retourner uniquement les sprints des projets dont l'utilisateur est membre
        return Sprint::with('project')
            ->whereHas('project.users', function($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->latest('starts_at')
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
            'phase' => ['nullable','string','max:255'],
            'goal' => ['nullable','string'],
            'starts_at' => ['required','date'],
            'ends_at' => ['required','date','after:starts_at'],
            'is_active' => ['boolean'],
        ]);
        $sprint = Sprint::create($data);
        return response()->json($sprint, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Sprint $sprint)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet du sprint
        if (!$sprint->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        return $sprint->load('project','tasks');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sprint $sprint)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sprint $sprint)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet du sprint
        if (!$sprint->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'phase' => ['sometimes','nullable','string','max:255'],
            'goal' => ['sometimes','nullable','string'],
            'starts_at' => ['sometimes','date'],
            'ends_at' => ['sometimes','date','after:starts_at'],
            'is_active' => ['sometimes','boolean'],
        ]);
        $sprint->update($data);
        return $sprint;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Sprint $sprint)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur a accès au projet du sprint
        if (!$sprint->project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }
        
        $sprint->delete();
        return response()->noContent();
    }
}
