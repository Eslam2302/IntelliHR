<?php

namespace App\Services;

use App\DataTransferObjects\EmployeeTrainingDTO;
use App\Models\EmployeeTraining;
use App\Repositories\Contracts\EmployeeTrainingRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\Log;

class EmployeeTrainingService
{
    /**
     * Constructor.
     */
    public function __construct(
        protected EmployeeTrainingRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Get all employee trainings with optional filters.
     *
     * @return mixed
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching employee trainings: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Show single employee training.
     */
    public function show(int $id): EmployeeTraining
    {
        try {
            return $this->repository->show($id);
        } catch (Exception $e) {
            Log::error("Error fetching employee training ID {$id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new employee training.
     */
    public function create(EmployeeTrainingDTO $dto): EmployeeTraining
    {
        try {
            $employeeTraining = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'employeeTraining',
                description: 'employee_training_created',
                subject: $employeeTraining,
                properties: [
                    'employee_id' => $employeeTraining->employee_id,
                    'training_id' => $employeeTraining->training_id,
                    'status' => $employeeTraining->status,
                    'completion_date' => $employeeTraining->completion_date,
                ]
            );

            Log::info('Employee Training created successfully', [
                'id' => $employeeTraining->id,
                'employee_id' => $employeeTraining->employee_id,
                'training_id' => $employeeTraining->training_id,
            ]);

            return $employeeTraining;
        } catch (Exception $e) {
            Log::error('Error creating employee training: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing employee training.
     */
    public function update(EmployeeTraining $employeeTraining, EmployeeTrainingDTO $dto): EmployeeTraining
    {
        try {
            $oldData = $employeeTraining->only([
                'employee_id',
                'training_id',
                'status',
                'completion_date',
            ]);

            $updatedTraining = $this->repository->update($employeeTraining, $dto->toArray());

            $this->activityLogger->log(
                logName: 'employeeTraining',
                description: 'employee_training_updated',
                subject: $updatedTraining,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedTraining->only([
                        'employee_id',
                        'training_id',
                        'status',
                        'completion_date',
                    ]),
                ]
            );

            Log::info('Employee Training updated successfully', [
                'id' => $updatedTraining->id,
                'employee_id' => $updatedTraining->employee_id,
            ]);

            return $updatedTraining;
        } catch (Exception $e) {
            Log::error("Error updating employee training ID {$employeeTraining->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an employee training.
     */
    public function delete(EmployeeTraining $employeeTraining): bool
    {
        try {
            $data = $employeeTraining->only([
                'employee_id',
                'training_id',
                'status',
                'completion_date',
            ]);

            $deleted = $this->repository->delete($employeeTraining);

            $this->activityLogger->log(
                logName: 'employeeTraining',
                description: 'employee_training_deleted',
                subject: $employeeTraining,
                properties: $data
            );

            Log::info('Employee Training deleted successfully', [
                'id' => $employeeTraining->id,
                'employee_id' => $employeeTraining->employee_id,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting employee training ID {$employeeTraining->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
