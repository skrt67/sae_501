<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskDueSoonNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Task $task,
        public int $daysRemaining
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $urgency = $this->daysRemaining === 0 ? 'aujourd\'hui' : 
                   ($this->daysRemaining === 1 ? 'demain' : 
                   'dans ' . $this->daysRemaining . ' jours');

        return (new MailMessage)
            ->subject('⚠️ Échéance proche : ' . $this->task->title)
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Une tâche qui vous est assignée arrive à échéance ' . $urgency . '.')
            ->line('**Tâche :** ' . $this->task->title)
            ->line('**Échéance :** ' . \Carbon\Carbon::parse($this->task->due_date)->format('d/m/Y'))
            ->line('**Priorité :** ' . $this->getPriorityLabel($this->task->priority))
            ->line('**Statut actuel :** ' . $this->getStatusLabel($this->task->status))
            ->action('Voir la tâche', config('app.frontend_url') . '/kanban')
            ->line('N\'oubliez pas de mettre à jour le statut de cette tâche !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'due_soon',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'due_date' => $this->task->due_date,
            'days_remaining' => $this->daysRemaining,
            'title' => 'Échéance proche',
            'message' => 'La tâche "' . $this->task->title . '" arrive à échéance dans ' . $this->daysRemaining . ' jour(s)',
        ];
    }

    private function getPriorityLabel(int $priority): string
    {
        return match($priority) {
            1 => 'Très haute',
            2 => 'Haute',
            3 => 'Moyenne',
            4 => 'Basse',
            5 => 'Très basse',
            default => 'Moyenne'
        };
    }

    private function getStatusLabel(string $status): string
    {
        return match($status) {
            'todo' => 'À faire',
            'in_progress' => 'En cours',
            'review' => 'En revue',
            'done' => 'Terminé',
            default => $status
        };
    }
}
