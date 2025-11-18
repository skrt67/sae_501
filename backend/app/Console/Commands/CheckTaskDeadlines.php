<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskDueSoonNotification;
use App\Notifications\TaskOverdueNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckTaskDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:check-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifie les échéances des tâches et envoie des notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Vérification des échéances des tâches...');

        $now = Carbon::now();
        $notificationsSent = 0;

        // Récupérer toutes les tâches non terminées avec une échéance et un assigné
        $tasks = Task::whereNotNull('due_date')
            ->whereNotNull('assignee_id')
            ->whereNotIn('status', ['done'])
            ->with('assignee')
            ->get();

        foreach ($tasks as $task) {
            if (!$task->assignee) {
                continue;
            }

            $dueDate = Carbon::parse($task->due_date);
            $daysUntilDue = $now->diffInDays($dueDate, false);

            // Tâche en retard
            if ($daysUntilDue < 0) {
                $daysOverdue = abs($daysUntilDue);
                
                // Envoyer notification tous les jours pour les tâches en retard
                $lastNotification = $task->assignee->notifications()
                    ->where('type', TaskOverdueNotification::class)
                    ->where('data->task_id', $task->id)
                    ->where('created_at', '>=', $now->copy()->subDay())
                    ->first();

                if (!$lastNotification) {
                    $task->assignee->notify(new TaskOverdueNotification($task, $daysOverdue));
                    $notificationsSent++;
                    $this->line("  ⚠️  Notification envoyée : Tâche #{$task->id} en retard de {$daysOverdue} jour(s)");
                }
            }
            // Tâche arrive à échéance dans 3 jours ou moins
            elseif ($daysUntilDue >= 0 && $daysUntilDue <= 3) {
                // Vérifier si une notification a déjà été envoyée aujourd'hui
                $lastNotification = $task->assignee->notifications()
                    ->where('type', TaskDueSoonNotification::class)
                    ->where('data->task_id', $task->id)
                    ->where('created_at', '>=', $now->copy()->startOfDay())
                    ->first();

                if (!$lastNotification) {
                    $task->assignee->notify(new TaskDueSoonNotification($task, (int)$daysUntilDue));
                    $notificationsSent++;
                    $this->line("  📅 Notification envoyée : Tâche #{$task->id} échéance dans {$daysUntilDue} jour(s)");
                }
            }
        }

        $this->info("✅ Vérification terminée. {$notificationsSent} notification(s) envoyée(s).");

        return Command::SUCCESS;
    }
}
