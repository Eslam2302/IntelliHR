<?php

namespace App\Repositories;

use App\Models\TrainingSession;
use App\Repositories\Contracts\TrainingSessionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainingSessionRepository implements TrainingSessionRepositoryInterface
{
    public function __construct(
        protected TrainingSession $model
    ) {}

    /**
     * Get paginated list of training sessions with trainer & department relations
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['trainer.employee', 'department'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get a single training session by ID
     *
     * @param int $id
     * @return TrainingSession
     */
    public function show(int $id): TrainingSession
    {
        return $this->model
            ->with(['trainer.employee', 'department'])
            ->findOrFail($id);
    }

    /**
     * Create a new training session
     *
     * @param array $data
     * @return TrainingSession
     */
    public function create(array $data): TrainingSession
    {
        return $this->model->create($data)->load(['trainer.employee', 'department']);
    }

    /**
     * Update an existing training session
     *
     * @param TrainingSession $trainingSession
     * @param array $data
     * @return TrainingSession
     */
    public function update(TrainingSession $trainingSession, array $data): TrainingSession
    {
        $trainingSession->update($data);
        return $trainingSession->fresh()->load(['trainer.employee', 'department']);
    }

    /**
     * Delete a training session
     *
     * @param TrainingSession $trainingSession
     * @return bool
     */
    public function delete(TrainingSession $trainingSession): bool
    {
        return $trainingSession->delete();
    }
}
