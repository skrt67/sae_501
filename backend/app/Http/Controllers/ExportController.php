<?php

namespace App\Http\Controllers;

use App\Exports\TasksExport;
use App\Models\Task;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    /**
     * Export tasks to CSV
     */
    public function exportTasksCSV(Request $request)
    {
        $user = $request->user();

        return Excel::download(
            new TasksExport($user),
            'taches_' . now()->format('Y-m-d') . '.csv',
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    /**
     * Export tasks to Excel
     */
    public function exportTasksExcel(Request $request)
    {
        $user = $request->user();

        return Excel::download(
            new TasksExport($user),
            'taches_' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    /**
     * Export tasks to PDF
     */
    public function exportTasksPDF(Request $request)
    {
        $user = $request->user();

        // Récupérer les tâches de l'utilisateur
        $tasks = Task::with(['project', 'sprint', 'epic', 'assignee'])
            ->whereHas('project.users', function($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.tasks-pdf', [
            'tasks' => $tasks,
            'user' => $user,
            'generatedAt' => now()->format('d/m/Y H:i')
        ]);

        return $pdf->download('taches_' . now()->format('Y-m-d') . '.pdf');
    }
}
