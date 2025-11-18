<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;


class ProjectInvitationController extends Controller
{
    /**
     * Inviter un utilisateur à un projet spécifique
     */
    public function invite(Request $request, Project $project)
    {
        // Vérifier que l'utilisateur est membre du projet
        if (!$project->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:owner,member',
        ]);

        // Vérifier si l'email est déjà membre du projet
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser && $project->users()->where('users.id', $existingUser->id)->exists()) {
            return response()->json(['message' => 'Cet utilisateur est déjà membre du projet'], 400);
        }

        // Vérifier si une invitation existe déjà pour ce projet
        $existingInvitation = Invitation::where('project_id', $project->id)
            ->where('email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existingInvitation) {
            return response()->json(['message' => 'Une invitation est déjà en attente pour cet email'], 400);
        }

        // Créer l'invitation
        $invitation = Invitation::create([
            'project_id' => $project->id,
            'email' => $request->email,
            'role' => $request->role,
            'invited_by' => $request->user()->id,
        ]);

        // Email d'invitation désactivé - notification dans l'app uniquement

        return response()->json($invitation->load('project', 'inviter'), 201);
    }

    /**
     * Accepter une invitation à un projet
     */
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

        // Ajouter l'utilisateur au projet
        if (!$invitation->project->users()->where('users.id', $user->id)->exists()) {
            $invitation->project->users()->attach($user->id, ['role' => $invitation->role]);
        }

        // Marquer l'invitation comme acceptée
        $invitation->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Invitation acceptée', 
            'project' => $invitation->project
        ]);
    }

    /**
     * Lister les invitations d'un projet
     */
    public function index(Request $request, Project $project)
    {
        // Vérifier que l'utilisateur est membre du projet
        if (!$project->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $invitations = Invitation::where('project_id', $project->id)
            ->with('inviter')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invitations);
    }

    /**
     * Récupérer les invitations reçues par l'utilisateur
     */
    public function received(Request $request)
    {
        $user = $request->user();
        
        $invitations = Invitation::where('email', $user->email)
            ->with(['project', 'inviter'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($invitations);
    }

    /**
     * Supprimer une invitation
     */
    public function destroy(Request $request, Invitation $invitation)
    {
        $project = $invitation->project;

        // Vérifier que l'utilisateur peut annuler (owner ou celui qui a invité)
        $isOwner = $project->users()
            ->where('users.id', $request->user()->id)
            ->wherePivot('role', 'owner')
            ->exists();

        if (!$isOwner && $invitation->invited_by !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $invitation->delete();

        return response()->json(['message' => 'Invitation annulée'], 200);
    }
}
