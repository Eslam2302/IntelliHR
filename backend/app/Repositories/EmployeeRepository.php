<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeRepository implements EmployeeRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Employee $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['department', 'manager', 'user']);

        // Define searchable fields
        $searchableFields = [
            'first_name',
            'last_name',
            'personal_email',
            'phone',
            'national_id',
            'employee_status',
            'department_id',
            'manager_id',
            'job_id',
            'user.email',
            'department.name',
            'manager.first_name',
            'manager.last_name',
            'manager.personal_email',
        ];

        // Define allowed sort columns for security
        $allowedSortFields = [
            'id',
            'first_name',
            'last_name',
            'personal_email',
            'phone',
            'national_id',
            'employee_status',
            'department_id',
            'manager_id',
            'job_id',
            'created_at',
            'updated_at',
            'deleted_at',
        ];

        // Apply filters using trait
        $query = $this->applyFilters(
            $query,
            $filters,
            $searchableFields,
            $allowedSortFields,
            'id',
            'desc'
        );

        // Get pagination limit
        $perPage = $this->getPaginationLimit($filters, 10);

        return $query->paginate($perPage);
    }

    public function create(array $data): Employee
    {
        return $this->model->create($data);
    }

    public function update(Employee $employee, array $data): Employee
    {
        $employee->update($data);

        return $employee->fresh();
    }

    public function delete(Employee $employee): bool
    {
        return $employee->delete();
    }

    /**
     * Chunk active employees by id to avoid memory exhaustion.
     * The callback receives a Collection of Employee models.
     */
    public function chunkActiveEmployees(int $chunkSize, callable $callback): void
    {
        Employee::whereIn('employee_status', ['active', 'probation'])
            ->chunkById($chunkSize, $callback);
    }

    /**
     * Return employee by id or null.
     *
     * @return Employee|null
     */
    public function findById(int $employeeId)
    {
        return Employee::find($employeeId);
    }
}
