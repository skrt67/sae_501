<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EpicFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'color' => fake()->hexColor(),
            'status' => fake()->randomElement(['todo', 'in_progress', 'done']),
        ];
    }
}
