<?php

namespace App\Repositories\Contracts;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface DepartmentRepositoryInterface
{
    /**
     * Get all departments with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Find department by ID
     */
    public function findById(int $id): ?Department;

    /**
     * Find department by ID or fail
     */
    public function findByIdOrFail(int $id): Department;

    /**
     * Create a new department
     */
    public function create(array $data): Department;

    /**
     * Update existing department
     */
    public function update(Department $department, array $data): Department;

    /**
     * Delete department
     */
    public function delete(Department $department): bool;

    /**
     * Check if department has employees
     */
    public function hasEmployees(Department $department): bool;

    /**
     * Get department with employees count
     */
    public function findWithEmployeesCount(int $id): ?Department;

    /**
     * Search departments by name
     */
    public function searchByName(string $name): Collection;
}
