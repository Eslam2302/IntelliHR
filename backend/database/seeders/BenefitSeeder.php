<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Benefit;
use App\Models\Employee;
use Carbon\Carbon;

class BenefitSeeder extends Seeder
{
    public function run(): void
    {
        // Get active employees
        $employees = Employee::whereIn('employee_status', ['active', 'probation'])->get();

        if ($employees->isEmpty()) {
            $this->command->warn('No active employees found. Please seed employees first.');
            return;
        }

        // Benefit types with their typical amounts and whether they're deductions
        $benefitTypes = [
            // Allowance Benefits (is_deduction = false)
            'Car Allowance' => ['amount' => [500, 1500], 'is_deduction' => false],
            'Gym Membership' => ['amount' => [50, 150], 'is_deduction' => false],
            'Childcare Support' => ['amount' => [300, 800], 'is_deduction' => false],
            'Remote Work Stipend' => ['amount' => [100, 300], 'is_deduction' => false],
            'Professional Development' => ['amount' => [200, 1000], 'is_deduction' => false],
            'Stock Options' => ['amount' => [1000, 5000], 'is_deduction' => false],
            'Annual Bonus' => ['amount' => [2000, 10000], 'is_deduction' => false],
            'Relocation Assistance' => ['amount' => [1000, 5000], 'is_deduction' => false],

            // Deduction Benefits (is_deduction = true)
            '401k Contribution' => ['amount' => [200, 600], 'is_deduction' => true],
            'Retirement Plan' => ['amount' => [150, 500], 'is_deduction' => true],
            'Union Dues' => ['amount' => [30, 100], 'is_deduction' => true],
            'Parking Fee' => ['amount' => [50, 200], 'is_deduction' => true],
            'Cafeteria Plan' => ['amount' => [100, 300], 'is_deduction' => true],
        ];

        foreach ($employees as $employee) {
            // Each employee gets 2-5 random benefits
            $numBenefits = rand(2, 5);
            $selectedBenefits = (array) array_rand($benefitTypes, $numBenefits);

            foreach ($selectedBenefits as $benefitName) {
                $benefitData = $benefitTypes[$benefitName];

                // Start date is usually within the last 6 months or hire date
                $startDate = Carbon::parse($employee->hire_date)->addMonths(rand(0, 6));
                if ($startDate->isFuture()) {
                    $startDate = now()->subMonths(rand(1, 6));
                }

                // End date: 70% ongoing (null), 30% with end date
                $endDate = null;
                if (rand(0, 9) < 3) { // 30% chance
                    $endDate = $startDate->copy()->addMonths(rand(6, 24));
                }

                Benefit::create([
                    'employee_id' => $employee->id,
                    'benefit_type' => $benefitName,
                    'amount' => rand($benefitData['amount'][0], $benefitData['amount'][1]),
                    'is_deduction' => $benefitData['is_deduction'],
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]);
            }
        }

       
    }
}
