<?php

namespace App\Services;

use App\DataTransferObjects\DepartmentDTO;
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
        protected DepartmentRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Get all departments with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching departments: '.$e->getMessage());
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
            Log::error("Error finding department {$id}: ".$e->getMessage());
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
            Log::error("Department {$id} not found: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new department
     */
    public function create(DepartmentDTO $dto): Department
    {
        try {

            $department = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'department',
                description: 'department_created',
                subject: $department,
                properties: [
                    'name' => $department->name,
                    'description' => $department->description,
                ]
            );

            Log::info('Department created successfully', [
                'id' => $department->id,
                'name' => $department->name,
            ]);

            return $department;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating department: '.$e->getMessage(), [
                'data' => $dto->toArray(),
            ]);
            throw $e;
        }
    }

    /**
     * Update existing department
     */
    public function update(Department $department, DepartmentDTO $dto): Department
    {
        try {
            $oldData = $department->only(['name', 'description']);

            $updatedDepartment = $this->repository->update($department, $dto->toArray());

            $this->activityLogger->log(
                logName: 'department',
                description: 'department_updated',
                subject: $updatedDepartment,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedDepartment->only(['name', 'description']),
                ]
            );

            Log::info('Department updated successfully', [
                'id' => $updatedDepartment->id,
                'name' => $updatedDepartment->name,
            ]);

            return $updatedDepartment;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating department {$department->id}: ".$e->getMessage(), [
                'data' => $dto->toArray(),
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
            $data = $department->only(['name', 'description']);

            $deleted = $this->repository->delete($department);

            $this->activityLogger->log(
                logName: 'department',
                description: 'department_deleted',
                subject: $department,
                properties: $data
            );

            Log::info('Department deleted successfully', [
                'id' => $department->id,
                'name' => $department->name,
            ]);

            return $deleted;
        } catch (DepartmentHasEmployeesException $e) {
            // Re-throw business logic exceptions
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting department {$department->id}: ".$e->getMessage());
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
            Log::error("Error fetching department {$id} with employees count: ".$e->getMessage());
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
            Log::error("Error searching departments by name '{$name}': ".$e->getMessage());
            throw $e;
        }
    }
}
