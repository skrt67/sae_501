<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request)
    {
        $workspaces = $request->user()->workspaces()->with('owner')->get();
        return response()->json($workspaces);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace = Workspace::create([
            'name' => $request->name,
            'owner_id' => $request->user()->id,
        ]);

        // Ajouter le créateur comme membre owner
        $workspace->users()->attach($request->user()->id, ['role' => 'owner']);

        return response()->json($workspace, 201);
    }

    public function show(Request $request, Workspace $workspace)
    {
        // Vérifier que l'utilisateur est membre
        if (!$workspace->isMember($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $workspace->load(['owner', 'users', 'projects']);
        return response()->json($workspace);
    }

    public function update(Request $request, Workspace $workspace)
    {
        // Seul l'owner peut modifier
        if (!$workspace->isOwner($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace->update($request->only('name'));

        return response()->json($workspace);
    }

    public function destroy(Request $request, Workspace $workspace)
    {
        // Seul l'owner peut supprimer
        if (!$workspace->isOwner($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $workspace->delete();

        return response()->json(['message' => 'Workspace supprimé'], 200);
    }

    public function members(Request $request, Workspace $workspace)
    {
        // Vérifier que l'utilisateur est membre
        if (!$workspace->isMember($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $members = $workspace->users()->get();
        return response()->json($members);
    }

    public function removeMember(Request $request, Workspace $workspace, $userId)
    {
        // Seul l'owner ou admin peut retirer des membres
        if (!$workspace->isOwner($request->user()->id) && !$workspace->isAdmin($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        // Ne peut pas retirer l'owner
        if ($workspace->isOwner($userId)) {
            return response()->json(['message' => 'Impossible de retirer le propriétaire'], 400);
        }

        $workspace->users()->detach($userId);

        return response()->json(['message' => 'Membre retiré'], 200);
    }

    public function leave(Request $request, Workspace $workspace)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est membre
        if (!$workspace->isMember($user->id)) {
            return response()->json(['message' => 'Vous n\'êtes pas membre de cette équipe'], 404);
        }

        // L'owner ne peut pas quitter son propre workspace
        if ($workspace->isOwner($user->id)) {
            return response()->json(['message' => 'Le propriétaire ne peut pas quitter son équipe'], 400);
        }

        // Retirer l'utilisateur du workspace
        $workspace->users()->detach($user->id);

        return response()->json(['message' => 'Vous avez quitté l\'équipe'], 200);
    }
}
