<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Retourner UNIQUEMENT les projets dont l'utilisateur est membre direct
        return Project::with(['users', 'sprints'])
            ->whereHas('users', function($q) use ($user) {
                $q->where('users.id', $user->id);
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
            'name' => ['required','string','max:255'],
            'description' => ['nullable','string'],
        ]);

        $project = Project::create($data);

        // Ajouter l'utilisateur créateur comme owner du projet
        $project->users()->attach($request->user()->id, ['role' => 'owner']);

        return response()->json($project->load('users'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Project $project)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est membre DIRECT du projet
        if (!$project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project->load('users', 'sprints', 'epics', 'tasks');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est membre DIRECT du projet
        if (!$project->users()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'description' => ['nullable','string'],
        ]);
        $project->update($data);
        return $project->load('users');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Project $project)
    {
        $user = $request->user();

        // Seul un owner du projet peut supprimer
        $isProjectOwner = $project->users()
            ->where('users.id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists();

        if (!$isProjectOwner) {
            return response()->json(['message' => 'Unauthorized. Only project owners can delete projects.'], 403);
        }

        $project->delete();
        return response()->noContent();
    }
}
