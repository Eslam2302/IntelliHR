<?php

namespace App\Services;

use App\DataTransferObjects\EmployeeTrainingDTO;
use App\Models\EmployeeTraining;
use App\Repositories\Contracts\EmployeeTrainingRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class EmployeeTrainingService
{
    /**
     * Constructor.
     *
     * @param EmployeeTrainingRepositoryInterface $repository
     */
    public function __construct(protected EmployeeTrainingRepositoryInterface $repository) {}

    /**
     * Get paginated employee trainings.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching employee trainings: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Show single employee training.
     *
     * @param int $id
     * @return EmployeeTraining
     */
    public function show(int $id): EmployeeTraining
    {
        try {
            return $this->repository->show($id);
        } catch (\Exception $e) {
            Log::error("Error fetching employee training ID {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new employee training.
     *
     * @param EmployeeTrainingDTO $dto
     * @return EmployeeTraining
     */
    public function create(EmployeeTrainingDTO $dto): EmployeeTraining
    {
        try {
            return $this->repository->create($dto->toArray());
        } catch (\Exception $e) {
            Log::error('Error creating employee training: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing employee training.
     *
     * @param EmployeeTraining $employeeTraining
     * @param EmployeeTrainingDTO $dto
     * @return EmployeeTraining
     */
    public function update(EmployeeTraining $employeeTraining, EmployeeTrainingDTO $dto): EmployeeTraining
    {
        try {
            return $this->repository->update($employeeTraining, $dto->toArray());
        } catch (\Exception $e) {
            Log::error("Error updating employee training ID {$employeeTraining->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an employee training.
     *
     * @param EmployeeTraining $employeeTraining
     * @return bool
     */
    public function delete(EmployeeTraining $employeeTraining): bool
    {
        try {
            return $this->repository->delete($employeeTraining);
        } catch (\Exception $e) {
            Log::error("Error deleting employee training ID {$employeeTraining->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
