<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    /**
     * Récupérer les membres d'un projet
     */
    public function index(Project $project)
    {
        $members = $project->users()->get();
        return response()->json($members);
    }

    /**
     * Ajouter un membre au projet
     */
    public function store(Request $request, Project $project)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:owner,member'
        ]);

        // Vérifier si l'utilisateur est déjà membre
        if ($project->users()->where('user_id', $request->user_id)->exists()) {
            return response()->json(['message' => 'Cet utilisateur est déjà membre du projet'], 400);
        }

        // Ajouter le membre
        $project->users()->attach($request->user_id, ['role' => $request->role]);

        return response()->json(['message' => 'Membre ajouté au projet'], 201);
    }

    /**
     * Retirer un membre du projet
     */
    public function destroy(Project $project, User $user)
    {
        // Vérifier si l'utilisateur est membre
        if (!$project->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Cet utilisateur n\'est pas membre du projet'], 404);
        }

        // Retirer le membre
        $project->users()->detach($user->id);

        return response()->json(['message' => 'Membre retiré du projet']);
    }
}
