<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'owner_id',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'workspace_users')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }

    public function isMember($userId)
    {
        return $this->users()->where('users.id', $userId)->exists();
    }

    public function isOwner($userId)
    {
        return $this->owner_id == $userId;
    }

    public function isAdmin($userId)
    {
        return $this->users()
                    ->where('users.id', $userId)
                    ->wherePivot('role', 'admin')
                    ->exists();
    }
}
