<?php

namespace App\Repositories\Contracts;

use App\Models\Employee;
use Illuminate\Pagination\LengthAwarePaginator;

interface EmployeeRepositoryInterface
{

    /**
     * Get all employees with pagination
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;


    /**
     * Create a new employee
     */
    public function create(array $data): Employee;


    /**
     * Update existing employee
     */
    public function update(Employee $employee,array $data): Employee;

    /**
     * Delete existing employee
     */
    public function delete(Employee $employee): bool;
}
