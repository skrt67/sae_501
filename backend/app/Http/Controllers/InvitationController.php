<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class InvitationController extends Controller
{
    public function index(Request $request, Workspace $workspace)
    {
        // Vérifier que l'utilisateur est membre
        if (!$workspace->isMember($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $invitations = $workspace->invitations()->with('inviter')->get();
        return response()->json($invitations);
    }

    public function invite(Request $request, Workspace $workspace)
    {
        // Vérifier que l'utilisateur peut inviter (owner ou admin)
        if (!$workspace->isOwner($request->user()->id) && !$workspace->isAdmin($request->user()->id)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,member',
        ]);

        // Vérifier si l'email est déjà membre
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser && $workspace->isMember($existingUser->id)) {
            return response()->json(['message' => 'Cet utilisateur est déjà membre'], 400);
        }

        // Vérifier si une invitation existe déjà
        $existingInvitation = Invitation::where('workspace_id', $workspace->id)
            ->where('email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return response()->json(['message' => 'Une invitation est déjà en attente pour cet email'], 400);
        }

        // Créer l'invitation
        $invitation = Invitation::create([
            'workspace_id' => $workspace->id,
            'email' => $request->email,
            'role' => $request->role,
            'invited_by' => $request->user()->id,
        ]);

        // TODO: Envoyer l'email d'invitation
        // Mail::to($invitation->email)->send(new WorkspaceInvitationMail($invitation));

        return response()->json($invitation, 201);
    }

    public function accept(Request $request, $token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if (!$invitation->isPending()) {
            return response()->json(['message' => 'Cette invitation n\'est plus valide'], 400);
        }

        if ($invitation->isExpired()) {
            return response()->json(['message' => 'Cette invitation a expiré'], 400);
        }

        // Vérifier si l'utilisateur existe
        $user = User::where('email', $invitation->email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Veuillez créer un compte avec cet email'], 400);
        }

        // Ajouter l'utilisateur au workspace
        $invitation->workspace->users()->attach($user->id, ['role' => $invitation->role]);

        // Ajouter automatiquement l'utilisateur à tous les projets du workspace
        $workspaceProjects = $invitation->workspace->projects;
        foreach ($workspaceProjects as $project) {
            // Vérifier que l'utilisateur n'est pas déjà membre du projet
            if (!$project->users()->where('users.id', $user->id)->exists()) {
                $project->users()->attach($user->id, ['role' => 'member']);
            }
        }

        // Marquer l'invitation comme acceptée
        $invitation->update(['status' => 'accepted']);

        return response()->json(['message' => 'Invitation acceptée', 'workspace' => $invitation->workspace]);
    }

    public function reject(Request $request, $token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if (!$invitation->isPending()) {
            return response()->json(['message' => 'Cette invitation n\'est plus valide'], 400);
        }

        $invitation->update(['status' => 'rejected']);

        return response()->json(['message' => 'Invitation refusée']);
    }

    public function received(Request $request)
    {
        $user = $request->user();
        
        // Récupérer toutes les invitations pour cet email
        $invitations = Invitation::where('email', $user->email)
            ->with(['workspace', 'inviter'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invitations);
    }

    public function destroy(Request $request, Invitation $invitation)
    {
        $workspace = $invitation->workspace;

        // Vérifier que l'utilisateur peut annuler (owner, admin ou celui qui a invité)
        if (!$workspace->isOwner($request->user()->id) && 
            !$workspace->isAdmin($request->user()->id) && 
            $invitation->invited_by !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $invitation->delete();

        return response()->json(['message' => 'Invitation annulée'], 200);
    }
}
