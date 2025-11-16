<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id','sprint_id','epic_id','assignee_id','title','description','status','due_date','priority','workspace_id'
    ];

    public function project() { return $this->belongsTo(Project::class); }
    public function sprint() { return $this->belongsTo(Sprint::class); }
    public function epic() { return $this->belongsTo(Epic::class); }
    public function assignee() { return $this->belongsTo(User::class, 'assignee_id'); }

    public function dependencies()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'depends_on_task_id');
    }
}
