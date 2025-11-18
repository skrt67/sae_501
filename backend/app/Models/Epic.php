<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Epic extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected $fillable = [
        'project_id', 'name', 'description', 'color', 'start_date', 'end_date', 'status', 'phase'
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
