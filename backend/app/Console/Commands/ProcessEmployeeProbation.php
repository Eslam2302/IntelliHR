<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Carbon\Carbon;

class ProcessEmployeeProbation extends Command
{
    protected $signature = 'employees:process-probation';
    protected $description = 'Activate employees after probation and assign their leave balances';

    public function handle()
    {

        $this->info('Checking for employees completing probation...');

        $today = now()->startOfDay();

        // 1. Get employees still on probation
        $employees = Employee::where('employee_status', 'probation')
            ->get()
            ->filter(function ($employee) use ($today) {
                $probationDays = $employee->contract?->probation_period_days ?? 90;

                return $today->gte(Carbon::parse($employee->hire_date)->addDays($probationDays));
            });

        if ($employees->isEmpty()) {
            $this->info('No employees found completing probation today.');
            return Command::SUCCESS;
        }

        $count = 0;

        foreach ($employees as $employee) {

            $contract = $employee->contract; // Make sure relation exists

            if (!$contract) {
                continue;
            }

            $probationDays = $contract->probation_period_days ?? 90;

            // If employee passed probation period
            if (Carbon::now()->greaterThanOrEqualTo(
                Carbon::parse($contract->start_date)->addDays($probationDays)
            )) {

                // 2. Set employee active
                $employee->update([
                    'employee_status' => 'active'
                ]);

                // 3. Assign leave entitlements
                $leaveTypes = LeaveType::all();

                foreach ($leaveTypes as $type) {
                    $balance = LeaveBalance::where('employee_id', $employee->id)
                        ->where('leave_type_id', $type->id)
                        ->where('year', now()->year)
                        ->first();

                    if ($balance) {
                        $balance->update([
                            'total_entitlement' => $type->annual_entitlement,
                            'remaining_days' => $type->annual_entitlement - $balance->used_days,
                        ]);
                    }
                }

                $this->info("Employee {$employee->id} activated.");
            }
        }

        return Command::SUCCESS;
    }
}
