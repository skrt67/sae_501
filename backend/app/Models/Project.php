<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected $fillable = [
        'name',
        'description',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps()->withPivot('role');
    }

    public function sprints()
    {
        return $this->hasMany(Sprint::class);
    }

    public function epics()
    {
        return $this->hasMany(Epic::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
