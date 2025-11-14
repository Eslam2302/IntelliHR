<?php

namespace App\Repositories;

use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class DepartmentRepository implements DepartmentRepositoryInterface
{
    public function __construct(
        protected Department $model
    ) {}

    /**
     * Get all departments with pagination
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get all departments without pagination
     */
    public function getAll(): Collection
    {
        return $this->model
            ->latest()
            ->get();
    }

    /**
     * Find department by ID
     */
    public function findById(int $id): ?Department
    {
        return $this->model->find($id);
    }

    /**
     * Find department by ID or fail
     */
    public function findByIdOrFail(int $id): Department
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create a new department
     */
    public function create(array $data): Department
    {
        return $this->model->create($data);
    }

    /**
     * Update existing department
     */
    public function update(Department $department, array $data): Department
    {
        $department->update($data);
        return $department->fresh();
    }

    /**
     * Delete department
     */
    public function delete(Department $department): bool
    {
        return $department->delete();
    }

    /**
     * Check if department has employees
     */
    public function hasEmployees(Department $department): bool
    {
        return $department->employees()->exists();
    }

    /**
     * Get department with employees count
     */
    public function findWithEmployeesCount(int $id): ?Department
    {
        return $this->model
            ->withCount('employees')
            ->find($id);
    }

    /**
     * Search departments by name
     */
    public function searchByName(string $name): Collection
    {
        return $this->model
            ->where('name', 'like', "%{$name}%")
            ->get();
    }
}