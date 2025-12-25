<?php

namespace App\Repositories;

use App\Models\EmployeeTraining;
use App\Repositories\Contracts\EmployeeTrainingRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeTrainingRepository implements EmployeeTrainingRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(protected EmployeeTraining $model) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['employee', 'training']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'training_id', 'status', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'training.title'],
            ['id', 'employee_id', 'training_id', 'status', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Show single employee training.
     */
    public function show(int $id): EmployeeTraining
    {
        return $this->model->with(['employee', 'training'])->findOrFail($id);
    }

    /**
     * Create a new employee training.
     */
    public function create(array $data): EmployeeTraining
    {
        return $this->model->create($data)->load(['employee', 'training']);
    }

    /**
     * Update an existing employee training.
     */
    public function update(EmployeeTraining $employeeTraining, array $data): EmployeeTraining
    {
        $employeeTraining->update($data);

        return $employeeTraining->fresh();
    }

    /**
     * Delete an employee training.
     */
    public function delete(EmployeeTraining $employeeTraining): bool
    {
        return $employeeTraining->delete();
    }
}
