<?php

namespace App\Services;

use App\DataTransferObjects\TrainerDTO;
use App\Models\Trainer;
use App\Repositories\Contracts\TrainerRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\Log;

class TrainerService
{
    public function __construct(
        protected TrainerRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve all trainers with optional filters.
     *
     * @return mixed
     *
     * @throws Exception
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching Trainers: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a trainer by ID.
     *
     * @throws Exception
     */
    public function show(int $trainerId): Trainer
    {
        try {
            return $this->repository->show($trainerId);
        } catch (Exception $e) {
            Log::error("Error fetching Trainer ID {$trainerId}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new trainer using the provided DTO.
     *
     * @throws \Exception
     */
    public function create(TrainerDTO $dto): Trainer
    {
        try {
            $trainer = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'trainer',
                description: 'trainer_created',
                subject: $trainer,
                properties: [
                    'type' => $trainer->type,
                    'employee_id' => $trainer->employee_id,
                    'name' => $trainer->name,
                    'email' => $trainer->email,
                    'phone' => $trainer->phone,
                    'company' => $trainer->company,
                ]
            );

            Log::info('Trainer created successfully', [
                'id' => $trainer->id,
                'type' => $trainer->type,
                'employee_id' => $trainer->employee_id,
                'name' => $trainer->name,
                'email' => $trainer->email,
            ]);

            return $trainer;
        } catch (Exception $e) {
            Log::error('Error creating Trainer: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given trainer using the provided DTO.
     *
     * @throws \Exception
     */
    public function update(Trainer $trainer, TrainerDTO $dto): Trainer
    {
        try {
            $oldData = $trainer->only([
                'type',
                'employee_id',
                'name',
                'email',
                'phone',
                'company',
            ]);

            $updatedTrainer = $this->repository->update($trainer, $dto->toArray());

            $this->activityLogger->log(
                logName: 'trainer',
                description: 'trainer_updated',
                subject: $updatedTrainer,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedTrainer->only([
                        'type',
                        'employee_id',
                        'name',
                        'email',
                        'phone',
                        'company',
                    ]),
                ]
            );

            Log::info('Trainer updated successfully', [
                'id' => $updatedTrainer->id,
                'type' => $trainer->type,
                'employee_id' => $updatedTrainer->employee_id,
                'name' => $updatedTrainer->name,
                'email' => $updatedTrainer->email,
            ]);

            return $updatedTrainer;
        } catch (Exception $e) {
            Log::error("Error updating Trainer ID {$trainer->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given trainer instance.
     *
     * @throws Exception
     */
    public function delete(Trainer $trainer): bool
    {
        try {
            $data = $trainer->only([
                'type',
                'employee_id',
                'name',
                'email',
                'phone',
                'company',
            ]);

            $deleted = $this->repository->delete($trainer);

            $this->activityLogger->log(
                logName: 'trainer',
                description: 'trainer_deleted',
                subject: $trainer,
                properties: $data
            );

            Log::info('Trainer deleted successfully', [
                'id' => $trainer->id,
                'type' => $trainer->type,
                'employee_id' => $trainer->employee_id,
                'name' => $trainer->name,
                'email' => $trainer->email,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting Trainer ID {$trainer->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
