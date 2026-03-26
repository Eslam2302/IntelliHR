<?php

namespace Database\Factories;

use App\Models\JobPosition;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobPosition>
 */
class JobPositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $minSalary = fake()->numberBetween(5000, 10000);
        return [
            'title' => fake()->unique()->jobTitle(),
            'grade' => fake()->randomElement(['Junior', 'Mid', 'Senior', 'Lead']),
            'department_id' => Department::factory(),
            'min_salary' => $minSalary,
            'max_salary' => $minSalary + fake()->numberBetween(5000, 15000),
            'responsibilities' => fake()->paragraph(),
        ];
    }
}
