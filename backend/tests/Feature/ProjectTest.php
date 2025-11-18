<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    private function authenticatedUser()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        return ['user' => $user, 'token' => $token];
    }

    /** @test */
    public function user_can_create_project()
    {
        $auth = $this->authenticatedUser();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token']
        ])->postJson('/api/projects', [
            'name' => 'Test Project',
            'description' => 'Test Description'
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'name' => 'Test Project',
                     'description' => 'Test Description'
                 ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project'
        ]);
    }

    /** @test */
    public function user_can_list_their_projects()
    {
        $auth = $this->authenticatedUser();
        
        $project = Project::factory()->create();
        $project->users()->attach($auth['user']->id, ['role' => 'owner']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token']
        ])->getJson('/api/projects');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'description']
                     ]
                 ]);
    }

    /** @test */
    public function user_can_update_project()
    {
        $auth = $this->authenticatedUser();
        
        $project = Project::factory()->create();
        $project->users()->attach($auth['user']->id, ['role' => 'owner']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token']
        ])->putJson("/api/projects/{$project->id}", [
            'name' => 'Updated Project Name'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'name' => 'Updated Project Name'
                 ]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project Name'
        ]);
    }

    /** @test */
    public function user_can_delete_project_as_owner()
    {
        $auth = $this->authenticatedUser();
        
        $project = Project::factory()->create();
        $project->users()->attach($auth['user']->id, ['role' => 'owner']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token']
        ])->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('projects', [
            'id' => $project->id
        ]);
    }

    /** @test */
    public function user_cannot_access_other_users_projects()
    {
        $auth = $this->authenticatedUser();
        $otherUser = User::factory()->create();
        
        $project = Project::factory()->create();
        $project->users()->attach($otherUser->id, ['role' => 'owner']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $auth['token']
        ])->getJson("/api/projects/{$project->id}");

        $response->assertStatus(403);
    }
}
