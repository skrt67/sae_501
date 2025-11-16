<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Workspace;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un utilisateur de test
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
            ]
        );

        $this->command->info('✅ Utilisateur créé: ' . $user->email);

        // Créer un workspace
        $workspace = Workspace::firstOrCreate(
            ['owner_id' => $user->id],
            [
                'name' => "Équipe {$user->name}",
                'owner_id' => $user->id,
            ]
        );

        // Ajouter l'utilisateur au workspace
        if (!$workspace->users()->where('user_id', $user->id)->exists()) {
            $workspace->users()->attach($user->id, ['role' => 'owner']);
            $this->command->info('✅ Utilisateur ajouté au workspace');
        }

        $this->command->info('');
        $this->command->info('🔑 Identifiants de connexion:');
        $this->command->info('Email: admin@example.com');
        $this->command->info('Mot de passe: password123');
    }
}
