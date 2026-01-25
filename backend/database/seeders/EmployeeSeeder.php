<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\JobPosition;
use Illuminate\Database\Seeder;
use Faker\Factory as FakerFactory;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates 999,999 employees via foreach + Faker.
     * Employee #1 is reserved for Admin (created in AdminUserSeeder).
     */
    public function run(): void
    {
        $faker = FakerFactory::create();
        $departmentIds = Department::pluck('id')->toArray();
        $jobIds = JobPosition::pluck('id')->toArray();
        $genders = ['male', 'female'];
        $statuses = ['active', 'probation', 'resigned', 'terminated'];

        $count = 999_999;
        foreach ($this->employeeIndexGenerator(2, $count + 1) as $i) {
            Employee::create([
                'first_name' => $faker->firstName(),
                'last_name' => $faker->lastName(),
                'work_email' => 'employee' . $i . '@intlihr.com',
                'phone' => $faker->numerify('01########'),
                'gender' => $faker->randomElement($genders),
                'national_id' => '3' . str_pad((string) $i, 12, '0', STR_PAD_LEFT),
                'birth_date' => $faker->dateTimeBetween('-55 years', '-18 years')->format('Y-m-d'),
                'address' => $faker->optional(0.7)->address(),
                'employee_status' => $faker->randomElement($statuses),
                'department_id' => $faker->randomElement($departmentIds),
                'manager_id' => null,
                'job_id' => ! empty($jobIds) ? $faker->randomElement($jobIds) : null,
                'hire_date' => $faker->dateTimeBetween('-15 years', 'now')->format('Y-m-d'),
            ]);
        }
    }

    /**
     * @return \Generator<int>
     */
    private function employeeIndexGenerator(int $start, int $end): \Generator
    {
        for ($i = $start; $i <= $end; $i++) {
            yield $i;
        }
    }
}
