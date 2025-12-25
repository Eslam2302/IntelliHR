<?php

namespace App\Services;

use App\DataTransferObjects\TrainingSessionDTO;
use App\Models\TrainingSession;
use App\Repositories\Contracts\TrainingSessionRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\Log;

class TrainingSessionService
{
    public function __construct(
        protected TrainingSessionRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Get all training sessions with optional filters
     *
     * @return mixed
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching Training Sessions: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get a single training session by ID
     */
    public function show(int $id): TrainingSession
    {
        try {
            return $this->repository->show($id);
        } catch (Exception $e) {
            Log::error("Error fetching Training Session ID {$id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new training session
     */
    public function create(TrainingSessionDTO $dto): TrainingSession
    {
        try {
            $trainingSession = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'trainingSession',
                description: 'training_session_created',
                subject: $trainingSession,
                properties: [
                    'title' => $trainingSession->title,
                    'start_date' => $trainingSession->start_date,
                    'end_date' => $trainingSession->end_date,
                    'trainer_id' => $trainingSession->trainer_id,
                    'department_id' => $trainingSession->department_id,
                    'description' => $trainingSession->description,
                ]
            );

            Log::info('Training Session created successfully', [
                'id' => $trainingSession->id,
                'title' => $trainingSession->title,
            ]);

            return $trainingSession;
        } catch (Exception $e) {
            Log::error('Error creating Training Session: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing training session
     */
    public function update(TrainingSession $trainingSession, TrainingSessionDTO $dto): TrainingSession
    {
        try {
            $oldData = $trainingSession->only([
                'title',
                'start_date',
                'end_date',
                'trainer_id',
                'department_id',
                'description',
            ]);

            $updatedSession = $this->repository->update($trainingSession, $dto->toArray());

            $this->activityLogger->log(
                logName: 'trainingSession',
                description: 'training_session_updated',
                subject: $updatedSession,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedSession->only([
                        'title',
                        'start_date',
                        'end_date',
                        'trainer_id',
                        'department_id',
                        'description',
                    ]),
                ]
            );

            Log::info('Training Session updated successfully', [
                'id' => $updatedSession->id,
                'title' => $updatedSession->title,
            ]);

            return $updatedSession;
        } catch (Exception $e) {
            Log::error("Error updating Training Session ID {$trainingSession->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a training session
     */
    public function delete(TrainingSession $trainingSession): bool
    {
        try {
            $data = $trainingSession->only([
                'title',
                'start_date',
                'end_date',
                'trainer_id',
                'department_id',
                'description',
            ]);

            $deleted = $this->repository->delete($trainingSession);

            $this->activityLogger->log(
                logName: 'trainingSession',
                description: 'training_session_deleted',
                subject: $trainingSession,
                properties: $data
            );

            Log::info('Training Session deleted successfully', [
                'id' => $trainingSession->id,
                'title' => $trainingSession->title,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting Training Session ID {$trainingSession->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
