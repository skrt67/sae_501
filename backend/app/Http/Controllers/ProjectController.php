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

        // Retourner les projets dont l'utilisateur est membre directement
        // OU les projets des workspaces dont l'utilisateur est membre
        return Project::with(['users', 'sprints', 'workspace'])
            ->where(function($query) use ($user) {
                // Projets dont l'utilisateur est membre direct
                $query->whereHas('users', function($q) use ($user) {
                    $q->where('users.id', $user->id);
                })
                // OU projets des workspaces dont l'utilisateur est membre
                ->orWhereHas('workspace.users', function($q) use ($user) {
                    $q->where('users.id', $user->id);
                });
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
            'workspace_id' => ['required','exists:workspaces,id'],
        ]);

        // Vérifier que l'utilisateur est membre du workspace
        $workspace = \App\Models\Workspace::findOrFail($data['workspace_id']);
        if (!$workspace->isMember($request->user()->id) && !$workspace->isOwner($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project = Project::create($data);

        // Ajouter l'utilisateur créateur comme owner du projet
        $project->users()->attach($request->user()->id, ['role' => 'owner']);

        // Ajouter automatiquement tous les membres du workspace au projet
        $workspaceMembers = $workspace->users()->where('users.id', '!=', $request->user()->id)->get();
        foreach ($workspaceMembers as $member) {
            $project->users()->attach($member->id, ['role' => 'member']);
        }

        return response()->json($project->load('users', 'workspace'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Project $project)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur a accès au projet
        $hasAccess = $project->users()->where('users.id', $user->id)->exists()
            || ($project->workspace && $project->workspace->users()->where('users.id', $user->id)->exists());

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $project->load('users', 'workspace', 'sprints', 'epics', 'tasks');
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

        // Vérifier que l'utilisateur a accès au projet (membre direct ou via workspace)
        $hasAccess = $project->users()->where('users.id', $user->id)->exists()
            || ($project->workspace && $project->workspace->users()->where('users.id', $user->id)->exists());

        if (!$hasAccess) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'description' => ['nullable','string'],
        ]);
        $project->update($data);
        return $project->load('users', 'workspace');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Project $project)
    {
        $user = $request->user();

        // Seul un owner du projet ou du workspace peut supprimer
        $isProjectOwner = $project->users()
            ->where('users.id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists();

        $isWorkspaceOwner = $project->workspace && $project->workspace->isOwner($user->id);

        if (!$isProjectOwner && !$isWorkspaceOwner) {
            return response()->json(['message' => 'Unauthorized. Only project or workspace owners can delete projects.'], 403);
        }

        $project->delete();
        return response()->noContent();
    }
}
