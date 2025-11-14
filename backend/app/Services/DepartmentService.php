<?php

namespace App\Services;

use App\DataTransferObjects\CreateDepartmentDTO;
use App\DataTransferObjects\UpdateDepartmentDTO;
use App\Exceptions\DepartmentHasEmployeesException;
use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepartmentService
{
    public function __construct(
        protected DepartmentRepositoryInterface $repository
    ) {}

    /**
     * Get all departments with pagination
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching departments: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all departments without pagination
     */
    public function getAll(): Collection
    {
        try {
            return $this->repository->getAll();
        } catch (\Exception $e) {
            Log::error('Error fetching all departments: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Find department by ID
     */
    public function findById(int $id): ?Department
    {
        try {
            return $this->repository->findById($id);
        } catch (\Exception $e) {
            Log::error("Error finding department {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Find department by ID or fail
     */
    public function findByIdOrFail(int $id): Department
    {
        try {
            return $this->repository->findByIdOrFail($id);
        } catch (\Exception $e) {
            Log::error("Department {$id} not found: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new department
     */
    public function create(CreateDepartmentDTO $dto): Department
    {
        try {
            DB::beginTransaction();

            $department = $this->repository->create($dto->toArray());

            DB::commit();

            Log::info("Department created successfully", [
                'id' => $department->id,
                'name' => $department->name
            ]);

            return $department;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating department: ' . $e->getMessage(), [
                'data' => $dto->toArray()
            ]);
            throw $e;
        }
    }

    /**
     * Update existing department
     */
    public function update(Department $department, UpdateDepartmentDTO $dto): Department
    {
        try {
            DB::beginTransaction();

            $updatedDepartment = $this->repository->update($department, $dto->toArray());

            DB::commit();

            Log::info("Department updated successfully", [
                'id' => $updatedDepartment->id,
                'name' => $updatedDepartment->name
            ]);

            return $updatedDepartment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating department {$department->id}: " . $e->getMessage(), [
                'data' => $dto->toArray()
            ]);
            throw $e;
        }
    }

    /**
     * Delete department
     *
     * @throws DepartmentHasEmployeesException
     */
    public function delete(Department $department): bool
    {
        try {
            // Business Logic: Check if department has employees
            if ($this->repository->hasEmployees($department)) {
                throw new DepartmentHasEmployeesException(
                    "Cannot delete department '{$department->name}'. Employees are still assigned to this department."
                );
            }

            DB::beginTransaction();

            $deleted = $this->repository->delete($department);

            DB::commit();

            Log::info("Department deleted successfully", [
                'id' => $department->id,
                'name' => $department->name
            ]);

            return $deleted;
        } catch (DepartmentHasEmployeesException $e) {
            // Re-throw business logic exceptions
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting department {$department->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Check if department has employees
     */
    public function hasEmployees(Department $department): bool
    {
        return $this->repository->hasEmployees($department);
    }

    /**
     * Get department with employees count
     */
    public function getDepartmentWithEmployeesCount(int $id): ?Department
    {
        try {
            return $this->repository->findWithEmployeesCount($id);
        } catch (\Exception $e) {
            Log::error("Error fetching department {$id} with employees count: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Search departments by name
     */
    public function searchByName(string $name): Collection
    {
        try {
            return $this->repository->searchByName($name);
        } catch (\Exception $e) {
            Log::error("Error searching departments by name '{$name}': " . $e->getMessage());
            throw $e;
        }
    }
}