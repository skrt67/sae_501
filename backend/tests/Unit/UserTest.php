<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_projects_relationship(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();
        
        $project->users()->attach($user->id, ['role' => 'owner']);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $user->projects);
        $this->assertTrue($user->projects->contains($project));
    }
}
