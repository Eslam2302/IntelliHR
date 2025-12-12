<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Deduction;
use App\Models\Employee;

class DeductionSeeder extends Seeder
{
    public function run(): void
    {
        // Get active employees
        $employees = Employee::whereIn('employee_status', ['active', 'probation'])->get();

        if ($employees->isEmpty()) {
            $this->command->warn('No active employees found. Please seed employees first.');
            return;
        }

        foreach ($employees as $employee) {
            // Mandatory deductions (everyone has these)
            $mandatoryDeductions = [
                'Social Security' => [150, 300],
                'Health Insurance' => [200, 500],
            ];

            foreach ($mandatoryDeductions as $type => $range) {
                Deduction::create([
                    'employee_id' => $employee->id,
                    'payroll_id' => null, // Pending
                    'type' => $type,
                    'amount' => rand($range[0], $range[1]),
                ]);
            }

            // Optional deductions (50% chance for each)
            $optionalDeductions = [
                'Life Insurance' => [50, 150],
                'Pension Fund' => [200, 400],
                'Loan Repayment' => [100, 500],
            ];

            foreach ($optionalDeductions as $type => $range) {
                if (rand(0, 1)) { // 50% chance
                    Deduction::create([
                        'employee_id' => $employee->id,
                        'payroll_id' => null,
                        'type' => $type,
                        'amount' => rand($range[0], $range[1]),
                    ]);
                }
            }

            // Occasional deductions (20% chance)
            $occasionalDeductions = [
                'Late Arrival' => [20, 100],
                'Unpaid Leave' => [50, 300],
                'Advance Salary Deduction' => [100, 800],
            ];

            foreach ($occasionalDeductions as $type => $range) {
                if (rand(0, 4) == 0) { // 20% chance
                    Deduction::create([
                        'employee_id' => $employee->id,
                        'payroll_id' => null,
                        'type' => $type,
                        'amount' => rand($range[0], $range[1]),
                    ]);
                }
            }
        }

        
    }
}
