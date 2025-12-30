<?php

namespace App\Repositories\Contracts;

use App\Models\LeaveBalance;

interface LeaveBalanceRepositoryInterface
{
    /**
     * Find leave balance by employee, leave type, and year
     */
    public function findByEmployeeAndLeaveTypeAndYear(int $employeeId, int $leaveTypeId, int $year): ?LeaveBalance;

    /**
     * Update leave balance
     */
    public function update(LeaveBalance $leaveBalance, array $data): LeaveBalance;
}

