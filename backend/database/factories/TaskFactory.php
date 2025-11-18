<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['todo', 'in_progress', 'done']),
            'priority' => fake()->numberBetween(1, 5),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+1 month'),
        ];
    }
}
