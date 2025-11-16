<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Invitation;

class InvitationSeeder extends Seeder
{
    public function run()
    {
        // Récupérer ou créer un utilisateur test
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        // Créer un workspace
        $workspace = Workspace::firstOrCreate(
            ['name' => 'Mon Équipe'],
            ['owner_id' => $user->id]
        );

        // Ajouter l'utilisateur comme membre du workspace
        if (!$workspace->users()->where('user_id', $user->id)->exists()) {
            $workspace->users()->attach($user->id, ['role' => 'owner']);
        }

        // Créer une invitation pour cet utilisateur
        Invitation::firstOrCreate(
            [
                'workspace_id' => $workspace->id,
                'email' => $user->email,
            ],
            [
                'role' => 'member',
                'status' => 'pending',
                'invited_by' => $user->id,
            ]
        );

        $this->command->info('✅ Invitation de test créée pour ' . $user->email);
    }
}
