<?php

namespace App\Repositories\Contracts;

use App\Models\TrainingSession;
use Illuminate\Pagination\LengthAwarePaginator;

interface TrainingSessionRepositoryInterface
{
    /**
     * Get paginated list of training sessions
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;

    /**
     * Get a single training session by ID
     *
     * @param int $id
     * @return TrainingSession
     */
    public function show(int $id): TrainingSession;

    /**
     * Create a new training session
     *
     * @param array $data
     * @return TrainingSession
     */
    public function create(array $data): TrainingSession;

    /**
     * Update an existing training session
     *
     * @param TrainingSession $trainingSession
     * @param array $data
     * @return TrainingSession
     */
    public function update(TrainingSession $trainingSession, array $data): TrainingSession;

    /**
     * Delete a training session
     *
     * @param TrainingSession $trainingSession
     * @return bool
     */
    public function delete(TrainingSession $trainingSession): bool;
}
