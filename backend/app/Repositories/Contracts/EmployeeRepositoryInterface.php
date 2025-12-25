<?php

namespace App\Repositories\Contracts;

use App\Models\Employee;
use Illuminate\Pagination\LengthAwarePaginator;

interface EmployeeRepositoryInterface
{

    /**
     * Get all employees with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;


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

    /**
     *
     * Chunk active employees by id to avoid memory exhaustion.
     * The callback receives a Collection of Employee models.
     *
     * @param int $chunkSize
     * @param callable $callback
     * @return void
     */
    public function chunkActiveEmployees(int $chunkSize, callable $callback): void;

    /**
     *
     * Return employee by id or null.
     *
     * @param int $employeeId
     * @return \App\Models\Employee|null
     */
    public function findById(int $employeeId);
}
