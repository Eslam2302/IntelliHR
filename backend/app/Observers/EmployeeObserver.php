<?php

namespace App\Observers;

use App\DataTransferObjects\ContractDTO;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\Contract;
use App\Services\ContractService;
use Spatie\Permission\Models\Role;

class EmployeeObserver
{
    /**
     * Handle the Employee "created" event.
     */
    public function created(Employee $employee): void
    {

        // Create default probation contract
        $contractDTO = new ContractDTO(
            employee_id: $employee->id,
            start_date: now()->toDateString(),
            end_date: null,
            contract_type: 'probation',
            probation_period_days: 90,
            salary: 0,
            terms: 'Default probation contract'
        );

        app(ContractService::class)->create($contractDTO);

        $leaveTypes = LeaveType::all();

        foreach ($leaveTypes as $type) {
            LeaveBalance::create([
                'employee_id'    => $employee->id,
                'leave_type_id'  => $type->id,
                'year'           => now()->year,
                'total_entitlement' => $employee->employee_status === 'probation' ? 0 : $type->annual_entitlement,
                'used_days'         => 0,
                'remaining_days' => $employee->employee_status === 'probation' ? 0 : $type->annual_entitlement,
            ]);
        }
    }

    /**
     * Handle the Employee "updated" event.
     */
    public function updated(Employee $employee): void
    {
        //
    }

    /**
     * Handle the Employee "deleted" event.
     */
    public function deleted(Employee $employee): void
    {
        //
    }

    /**
     * Handle the Employee "restored" event.
     */
    public function restored(Employee $employee): void
    {
        //
    }

    /**
     * Handle the Employee "force deleted" event.
     */
    public function forceDeleted(Employee $employee): void
    {
        //
    }
}
