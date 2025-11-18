<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Task $task,
        public User $assignedBy
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
        return (new MailMessage)
            ->subject('Nouvelle tâche assignée : ' . $this->task->title)
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($this->assignedBy->name . ' vous a assigné une nouvelle tâche.')
            ->line('**Tâche :** ' . $this->task->title)
            ->line('**Priorité :** ' . $this->getPriorityLabel($this->task->priority))
            ->when($this->task->due_date, function ($message) {
                return $message->line('**Échéance :** ' . \Carbon\Carbon::parse($this->task->due_date)->format('d/m/Y'));
            })
            ->action('Voir la tâche', config('app.frontend_url') . '/kanban')
            ->line('Merci d\'utiliser Asano !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'assignment',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'assigned_by' => $this->assignedBy->name,
            'assigned_by_id' => $this->assignedBy->id,
            'title' => 'Nouvelle tâche assignée',
            'message' => $this->assignedBy->name . ' vous a assigné : ' . $this->task->title,
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
}
