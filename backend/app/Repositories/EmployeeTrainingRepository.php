<?php

namespace App\Repositories;

use App\Models\EmployeeTraining;
use App\Repositories\Contracts\EmployeeTrainingRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EmployeeTrainingRepository implements EmployeeTrainingRepositoryInterface
{
    public function __construct(protected EmployeeTraining $model) {}

    /**
     * Get paginated list of employee trainings.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with(['employee', 'training'])->latest()->paginate($perPage);
    }

    /**
     * Show single employee training.
     *
     * @param int $id
     * @return EmployeeTraining
     */
    public function show(int $id): EmployeeTraining
    {
        return $this->model->with(['employee', 'training'])->findOrFail($id);
    }

    /**
     * Create a new employee training.
     *
     * @param array $data
     * @return EmployeeTraining
     */
    public function create(array $data): EmployeeTraining
    {
        return $this->model->create($data)->load(['employee', 'training']);
    }

    /**
     * Update an existing employee training.
     *
     * @param EmployeeTraining $employeeTraining
     * @param array $data
     * @return EmployeeTraining
     */
    public function update(EmployeeTraining $employeeTraining, array $data): EmployeeTraining
    {
        $employeeTraining->update($data);
        return $employeeTraining->fresh();
    }

    /**
     * Delete an employee training.
     *
     * @param EmployeeTraining $employeeTraining
     * @return bool
     */
    public function delete(EmployeeTraining $employeeTraining): bool
    {
        return $employeeTraining->delete();
    }
}
