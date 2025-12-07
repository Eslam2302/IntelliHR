<?php

namespace App\Repositories\Contracts;

use App\Models\EmployeeTraining;
use Illuminate\Pagination\LengthAwarePaginator;

interface EmployeeTrainingRepositoryInterface
{
    /**
     * Get paginated list of employee trainings.
     * 
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;

    /**
     * Show single employee training.
     */
    public function show(int $id): EmployeeTraining;

    /**
     * Create new employee training.
     */
    public function create(array $data): EmployeeTraining;

    /**
     * Update existing employee training.
     */
    public function update(EmployeeTraining $employeeTraining, array $data): EmployeeTraining;

    /**
     * Delete employee training.
     */
    public function delete(EmployeeTraining $employeeTraining): bool;
}
