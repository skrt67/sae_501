<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected $fillable = [
        'project_id', 'name', 'phase', 'goal', 'starts_at', 'ends_at', 'is_active'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
