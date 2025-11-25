<?php

namespace App\Repositories\Contracts;

use App\Models\Payroll;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PayrollRepositoryInterface
{
    /**
     * Return paginated list of all payrolls
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Create a new payroll record
     */
    public function create(array $data): Payroll;

    /**
     * Update an existing payroll
     */
    public function update(Payroll $payroll, array $data): Payroll;
    
    /**
     * Delete a payroll record
     */
    public function delete(Payroll $payroll): bool;

    /**
     * Get all payrolls for a specific employee
     */
    public function getByEmployee(int $employeeId): Collection;

    /**
     * Get payrolls for a specific year + month
     */
    public function getByMonth(int $year, int $month): Collection;

    /**
     * Check if payroll already exists for (employee_id + year + month)
     */
    public function existsForPeriod(int $employeeId, int $year, int $month): bool;

    /**
     * Calculate net pay from salary + allowances - deductions
     */
    public function calculateNetPay(float $basic, float $allowances, float $deductions): float;
}
