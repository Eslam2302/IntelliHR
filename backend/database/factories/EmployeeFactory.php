<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Department;
use App\Models\JobPosition;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name'      => $this->faker->firstName(),
            'last_name'       => $this->faker->lastName(),
            'work_email'  => $this->faker->unique()->safeEmail(),
            'phone'           => $this->faker->phoneNumber(),
            'gender'          => $this->faker->randomElement(['male', 'female']),
            'national_id' => $this->faker->unique()->numerify('##############'),
            'birth_date'      => $this->faker->date('Y-m-d', '2000-01-01'),
            'hire_date'       => $this->faker->date('Y-m-d', 'now'),
            'employee_status' => 'probation',
            'address'         => $this->faker->address(),
            // Foreign Keys
            'department_id'   => Department::factory(),
            'job_id'          => JobPosition::factory(),
            'manager_id'      => null,
        ];
    }
}
