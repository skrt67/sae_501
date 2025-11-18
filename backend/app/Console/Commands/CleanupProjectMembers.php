<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupProjectMembers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'project:cleanup-members';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Nettoie les membres de projets - garde uniquement les owners';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧹 Nettoyage des membres de projets...');

        $projects = \App\Models\Project::with('users')->get();
        $totalRemoved = 0;

        foreach ($projects as $project) {
            $this->info("Projet: {$project->name}");
            
            // Garder uniquement les owners
            $owners = $project->users()->wherePivot('role', 'owner')->pluck('users.id')->toArray();
            $allMembers = $project->users()->pluck('users.id')->toArray();
            $toRemove = array_diff($allMembers, $owners);
            
            if (count($toRemove) > 0) {
                $project->users()->detach($toRemove);
                $this->warn("  ✂️  Retiré " . count($toRemove) . " membre(s)");
                $totalRemoved += count($toRemove);
            } else {
                $this->line("  ✅ Aucun membre à retirer");
            }
        }

        $this->info("✅ Terminé ! Total retiré: {$totalRemoved} membre(s)");
        $this->newLine();
        $this->info("💡 Les utilisateurs peuvent maintenant être invités projet par projet.");
        
        return 0;
    }
}
