<?php

namespace App\Services;

use App\DataTransferObjects\TrainingSessionDTO;
use App\Models\TrainingSession;
use App\Repositories\Contracts\TrainingSessionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TrainingSessionService
{
    public function __construct(
        protected TrainingSessionRepositoryInterface $repository
    ) {}

    /**
     * Get paginated list of training sessions
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching Training Sessions: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get a single training session by ID
     *
     * @param int $id
     * @return TrainingSession
     */
    public function show(int $id): TrainingSession
    {
        try {
            return $this->repository->show($id);
        } catch (\Exception $e) {
            Log::error("Error fetching Training Session ID {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new training session
     *
     * @param TrainingSessionDTO $dto
     * @return TrainingSession
     */
    public function create(TrainingSessionDTO $dto): TrainingSession
    {
        try {
            $trainingSession = $this->repository->create($dto->toArray());

            Log::info("Training Session created successfully", [
                'id' => $trainingSession->id,
                'title' => $trainingSession->title,
            ]);

            return $trainingSession;
        } catch (\Exception $e) {
            Log::error('Error creating Training Session: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing training session
     *
     * @param TrainingSession $trainingSession
     * @param TrainingSessionDTO $dto
     * @return TrainingSession
     */
    public function update(TrainingSession $trainingSession, TrainingSessionDTO $dto): TrainingSession
    {
        try {
            $updatedSession = $this->repository->update($trainingSession, $dto->toArray());

            Log::info("Training Session updated successfully", [
                'id' => $updatedSession->id,
                'title' => $updatedSession->title,
            ]);

            return $updatedSession;
        } catch (\Exception $e) {
            Log::error("Error updating Training Session ID {$trainingSession->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a training session
     *
     * @param TrainingSession $trainingSession
     * @return bool
     */
    public function delete(TrainingSession $trainingSession): bool
    {
        try {
            $deleted = $this->repository->delete($trainingSession);

            Log::info("Training Session deleted successfully", [
                'id' => $trainingSession->id,
                'title' => $trainingSession->title,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Training Session ID {$trainingSession->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
