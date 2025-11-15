<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeRepository implements EmployeeRepositoryInterface
{
    public function __construct(
        protected Employee $model
    ) {}

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with(['department', 'manager', 'user'])
            ->latest()
            ->paginate($perPage);
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
}
