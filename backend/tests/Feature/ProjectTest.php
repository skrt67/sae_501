<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can create a project
     */
    public function test_user_can_create_project(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->postJson('/api/projects', [
            'name' => 'Test Project',
            'description' => 'Test Description'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id',
                     'name',
                     'description',
                     'users'
                 ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'description' => 'Test Description'
        ]);

        // Verify user is added as owner
        $project = Project::where('name', 'Test Project')->first();
        $this->assertTrue($project->users()->where('users.id', $user->id)->exists());
        $this->assertEquals('owner', $project->users()->where('users.id', $user->id)->first()->pivot->role);
    }

    /**
     * Test user can list their projects
     */
    public function test_user_can_list_their_projects(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Create projects
        $project1 = Project::factory()->create();
        $project1->users()->attach($user->id, ['role' => 'owner']);

        $project2 = Project::factory()->create();
        $project2->users()->attach($user->id, ['role' => 'member']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson('/api/projects');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    /**
     * Test user can update their project
     */
    public function test_user_can_update_their_project(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'owner']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->putJson("/api/projects/{$project->id}", [
            'name' => 'Updated Project Name',
            'description' => 'Updated Description'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'name' => 'Updated Project Name',
                     'description' => 'Updated Description'
                 ]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project Name'
        ]);
    }

    /**
     * Test user cannot update project they don't belong to
     */
    public function test_user_cannot_update_project_they_dont_belong_to(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->putJson("/api/projects/{$project->id}", [
            'name' => 'Updated Project Name'
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test only owner can delete project
     */
    public function test_only_owner_can_delete_project(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        
        $project = Project::factory()->create();
        $project->users()->attach($owner->id, ['role' => 'owner']);
        $project->users()->attach($member->id, ['role' => 'member']);

        // Member tries to delete
        $memberToken = $member->createToken('test-token')->plainTextToken;
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $memberToken,
            'Accept' => 'application/json'
        ])->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(403);

        // Owner deletes
        $ownerToken = $owner->createToken('test-token')->plainTextToken;
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $ownerToken,
            'Accept' => 'application/json'
        ])->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    /**
     * Test user can view project details
     */
    public function test_user_can_view_project_details(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'member']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->getJson("/api/projects/{$project->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $project->id,
                     'name' => $project->name
                 ]);
    }
}
