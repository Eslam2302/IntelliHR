<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Allowance;
use App\Models\Employee;

class AllowanceSeeder extends Seeder
{
    public function run(): void
    {
        // Get active employees
        $employees = Employee::whereIn('employee_status', ['active', 'probation'])->get();

        if ($employees->isEmpty()) {
            $this->command->warn('No active employees found. Please seed employees first.');
            return;
        }

        $allowanceTypes = [
            'Housing Allowance' => [300, 800],
            'Transportation Allowance' => [100, 300],
            'Meal Allowance' => [150, 400],
            'Phone Allowance' => [50, 150],
            'Internet Allowance' => [50, 100],
            'Performance Bonus' => [500, 2000],
            'Education Allowance' => [200, 600],
            'Clothing Allowance' => [100, 300],
        ];

        foreach ($employees as $employee) {
            // Randomly assign 2-4 allowance types per employee
            $numTypes = rand(2, 4);
            $selectedTypes = (array) array_rand($allowanceTypes, $numTypes);

            foreach ($selectedTypes as $type) {
                $range = $allowanceTypes[$type];

                Allowance::create([
                    'employee_id' => $employee->id,
                    'payroll_id' => null, // Pending, not yet processed
                    'type' => $type,
                    'amount' => rand($range[0], $range[1]),
                ]);
            }
        }

    }
}