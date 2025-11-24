<?php

namespace App\Repositories\Contracts;

use App\Models\Allowance;
use Illuminate\Pagination\LengthAwarePaginator;

interface AllowanceRepositoryInterface
{
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    public function showEmployeeAllowances(int $employeeId, int $perpage = 10) : LengthAwarePaginator;

    public function showPayrollAllowances(int $payrollId, int $perpage = 10) : LengthAwarePaginator;

    public function create(array $data): Allowance;

    public function update(Allowance $allowance, array $data): Allowance;

    public function delete(Allowance $allowance): bool;
}
