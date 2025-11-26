<?php

namespace App\Repositories\Contracts;

use App\Models\Deduction;
use Illuminate\Pagination\LengthAwarePaginator;

interface DeductionRepositoryInterface
{
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    public function showEmployeeDeductions(int $employeeId, int $perpage = 10) : LengthAwarePaginator;

    public function showPayrollDeductions(int $payrollId, int $perpage = 10) : LengthAwarePaginator;

    public function create(array $data): Deduction;

    public function update(Deduction $deduction, array $data): Deduction;

    public function delete(Deduction $deduction): bool;

    /**
     * Get all pending deduction for specific employee(where payroll_id is null)
     */
    public function getPendingForEmployeeMonth(int $employeeId);

    /**
     * Mark deductions as processed by assigning payroll_id
     */
    public function markAsProcessed(array $deductionIds, int $payrollId);
}
