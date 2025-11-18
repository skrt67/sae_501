<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Export des Tâches</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }
        .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #000;
        }
        .meta {
            font-size: 10px;
            color: #666;
            margin-top: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #000;
            color: #fff;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
        }
        .status-todo {
            background-color: #f0f0f0;
            color: #666;
        }
        .status-in-progress {
            background-color: #fff3cd;
            color: #856404;
        }
        .status-done {
            background-color: #d4edda;
            color: #155724;
        }
        .priority {
            font-weight: bold;
        }
        .priority-1 { color: #dc3545; }
        .priority-2 { color: #fd7e14; }
        .priority-3 { color: #ffc107; }
        .priority-4 { color: #28a745; }
        .priority-5 { color: #6c757d; }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #999;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Export des Tâches - Asano</h1>
        <div class="meta">
            <strong>Généré pour:</strong> {{ $user->name }}<br>
            <strong>Date:</strong> {{ $generatedAt }}<br>
            <strong>Nombre de tâches:</strong> {{ $tasks->count() }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%">ID</th>
                <th style="width: 25%">Titre</th>
                <th style="width: 12%">Statut</th>
                <th style="width: 10%">Priorité</th>
                <th style="width: 15%">Projet</th>
                <th style="width: 13%">Assigné à</th>
                <th style="width: 10%">Échéance</th>
                <th style="width: 10%">Créé le</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tasks as $task)
            <tr>
                <td>{{ $task->id }}</td>
                <td><strong>{{ $task->title }}</strong></td>
                <td>
                    <span class="status status-{{ $task->status }}">
                        @switch($task->status)
                            @case('todo') À faire @break
                            @case('in_progress') En cours @break
                            @case('done') Terminé @break
                            @default {{ $task->status }}
                        @endswitch
                    </span>
                </td>
                <td class="priority priority-{{ $task->priority ?? 3 }}">
                    @switch($task->priority)
                        @case(1) Très haute @break
                        @case(2) Haute @break
                        @case(3) Moyenne @break
                        @case(4) Basse @break
                        @case(5) Très basse @break
                        @default N/A
                    @endswitch
                </td>
                <td>{{ $task->project->name ?? 'N/A' }}</td>
                <td>{{ $task->assignee->name ?? 'Non assigné' }}</td>
                <td>{{ $task->due_date ? \Carbon\Carbon::parse($task->due_date)->format('d/m/Y') : '-' }}</td>
                <td>{{ $task->created_at ? $task->created_at->format('d/m/Y') : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page {{ $loop->iteration ?? 1 }} - Généré par Asano le {{ $generatedAt }}
    </div>
</body>
</html>
