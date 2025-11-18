<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'email',
        'token',
        'role',
        'status',
        'invited_by',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    protected $appends = [
        'project_name',
        'inviter_name',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invitation) {
            if (empty($invitation->token)) {
                $invitation->token = Str::random(64);
            }
            if (empty($invitation->expires_at)) {
                $invitation->expires_at = now()->addDays(7);
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function getProjectNameAttribute()
    {
        return $this->project ? $this->project->name : null;
    }

    public function getInviterNameAttribute()
    {
        return $this->inviter ? $this->inviter->name : null;
    }
}
