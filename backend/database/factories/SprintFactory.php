<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SprintFactory extends Factory
{
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+1 week');
        $endDate = fake()->dateTimeBetween($startDate, '+3 weeks');

        return [
            'name' => 'Sprint ' . fake()->numberBetween(1, 10),
            'starts_at' => $startDate,
            'ends_at' => $endDate,
            'is_active' => fake()->boolean(30),
        ];
    }
}
