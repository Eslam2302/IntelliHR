<?php

namespace App\Repositories\Contracts;

use App\Models\Allowance;
use Illuminate\Pagination\LengthAwarePaginator;

interface AllowanceRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function showEmployeeAllowances(int $employeeId, int $perpage = 10): LengthAwarePaginator;

    public function showPayrollAllowances(int $payrollId, int $perpage = 10): LengthAwarePaginator;

    public function create(array $data): Allowance;

    public function update(Allowance $allowance, array $data): Allowance;

    public function delete(Allowance $allowance): bool;

    /**
     * Get all pending allowances for specific employee(where payroll_id is null)
     */
    public function getPendingForEmployeeMonth(int $employeeId);

    /**
     * Mark allowances as processed by assigning payroll_id
     */
    public function markAsProcessed(array $allowanceIds, int $payrollId);
}
