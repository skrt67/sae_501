<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Epic;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private function setupProjectEnvironment()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        
        $project = Project::factory()->create();
        $project->users()->attach($user->id, ['role' => 'owner']);
        
        $sprint = Sprint::factory()->create(['project_id' => $project->id]);
        $epic = Epic::factory()->create(['project_id' => $project->id]);

        return [
            'user' => $user,
            'token' => $token,
            'project' => $project,
            'sprint' => $sprint,
            'epic' => $epic
        ];
    }

    /** @test */
    public function user_can_create_task()
    {
        $env = $this->setupProjectEnvironment();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $env['token']
        ])->postJson('/api/tasks', [
            'project_id' => $env['project']->id,
            'sprint_id' => $env['sprint']->id,
            'epic_id' => $env['epic']->id,
            'title' => 'Test Task',
            'description' => 'Test Description',
            'status' => 'todo',
            'priority' => 3
        ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'title' => 'Test Task',
                     'status' => 'todo'
                 ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Test Task'
        ]);
    }

    /** @test */
    public function user_can_update_task_status()
    {
        $env = $this->setupProjectEnvironment();
        
        $task = Task::factory()->create([
            'project_id' => $env['project']->id,
            'status' => 'todo'
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $env['token']
        ])->putJson("/api/tasks/{$task->id}/status", [
            'status' => 'in_progress'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'in_progress'
        ]);
    }

    /** @test */
    public function user_can_delete_task()
    {
        $env = $this->setupProjectEnvironment();
        
        $task = Task::factory()->create([
            'project_id' => $env['project']->id
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $env['token']
        ])->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id
        ]);
    }

    /** @test */
    public function task_requires_valid_priority()
    {
        $env = $this->setupProjectEnvironment();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $env['token']
        ])->postJson('/api/tasks', [
            'project_id' => $env['project']->id,
            'title' => 'Test Task',
            'status' => 'todo',
            'priority' => 10 // Invalid: should be 1-5
        ]);

        $response->assertStatus(422);
    }
}
