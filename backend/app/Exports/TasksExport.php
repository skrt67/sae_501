<?php

namespace App\Exports;

use App\Models\Task;
use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TasksExport implements FromCollection, WithHeadings, WithMapping
{
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Retourner uniquement les tâches des projets auxquels l'utilisateur a accès
        return Task::with(['project', 'sprint', 'epic', 'assignee'])
            ->whereHas('project.users', function($query) {
                $query->where('users.id', $this->user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Titre',
            'Description',
            'Statut',
            'Priorité',
            'Projet',
            'Sprint',
            'Epic',
            'Assigné à',
            'Date d\'échéance',
            'Date de création',
        ];
    }

    public function map($task): array
    {
        return [
            $task->id,
            $task->title,
            $task->description ?? '',
            match($task->status) {
                'todo' => 'À faire',
                'in_progress' => 'En cours',
                'done' => 'Terminé',
                default => $task->status
            },
            $this->getPriorityLabel($task->priority),
            $task->project->name ?? '',
            $task->sprint->name ?? '',
            $task->epic->name ?? '',
            $task->assignee->name ?? '',
            $task->due_date ? \Carbon\Carbon::parse($task->due_date)->format('d/m/Y') : '',
            $task->created_at ? $task->created_at->format('d/m/Y H:i') : '',
        ];
    }

    private function getPriorityLabel(?int $priority): string
    {
        return match($priority) {
            1 => 'Très haute',
            2 => 'Haute',
            3 => 'Moyenne',
            4 => 'Basse',
            5 => 'Très basse',
            default => 'N/A'
        };
    }
}
