<?php

namespace App\Repositories;

use App\Models\LeaveBalance;
use App\Repositories\Contracts\LeaveBalanceRepositoryInterface;

class LeaveBalanceRepository implements LeaveBalanceRepositoryInterface
{
    public function __construct(
        protected LeaveBalance $model
    ) {}

    public function findByEmployeeAndLeaveTypeAndYear(int $employeeId, int $leaveTypeId, int $year): ?LeaveBalance
    {
        return $this->model->where('employee_id', $employeeId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', $year)
            ->first();
    }

    public function update(LeaveBalance $leaveBalance, array $data): LeaveBalance
    {
        $leaveBalance->update($data);

        return $leaveBalance->fresh();
    }
}

