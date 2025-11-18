<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\Epic;
use App\Models\Sprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can create a task
     */
    public function test_user_can_create_task(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'owner']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->postJson('/api/tasks', [
            'title' => 'Test Task',
            'description' => '<p>Test Description</p>',
            'status' => 'todo',
            'project_id' => $project->id,
            'assigned_to' => $user->id
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'id',
                     'title',
                     'description',
                     'status',
                     'project_id'
                 ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Test Task',
            'status' => 'todo',
            'project_id' => $project->id
        ]);
    }

    /**
     * Test user can update task status
     */
    public function test_user_can_update_task_status(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'member']);

        $task = Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'todo'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->putJson("/api/tasks/{$task->id}/status", [
            'status' => 'in_progress'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'in_progress'
                 ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'in_progress'
        ]);
    }

    /**
     * Test user can assign task to team member
     */
    public function test_user_can_assign_task_to_team_member(): void
    {
        $user = User::factory()->create();
        $assignee = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'owner']);
        $project->users()->attach($assignee->id, ['role' => 'member']);

        $task = Task::factory()->create([
            'project_id' => $project->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->putJson("/api/tasks/{$task->id}", [
            'assigned_to' => $assignee->id
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'assigned_to' => $assignee->id
        ]);
    }

    /**
     * Test user can associate task with epic
     */
    public function test_user_can_associate_task_with_epic(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'owner']);

        $epic = Epic::factory()->create([
            'project_id' => $project->id
        ]);

        $task = Task::factory()->create([
            'project_id' => $project->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->putJson("/api/tasks/{$task->id}", [
            'epic_id' => $epic->id
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'epic_id' => $epic->id
        ]);
    }

    /**
     * Test user can associate task with sprint
     */
    public function test_user_can_associate_task_with_sprint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'owner']);

        $sprint = Sprint::factory()->create([
            'project_id' => $project->id
        ]);

        $task = Task::factory()->create([
            'project_id' => $project->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->putJson("/api/tasks/{$task->id}", [
            'sprint_id' => $sprint->id
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'sprint_id' => $sprint->id
        ]);
    }

    /**
     * Test user can delete task
     */
    public function test_user_can_delete_task(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'member']);

        $task = Task::factory()->create([
            'project_id' => $project->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    /**
     * Test task validation
     */
    public function test_task_requires_title_and_project(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json'
        ])->postJson('/api/tasks', [
            'description' => 'Test Description'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['title', 'project_id']);
    }
}
