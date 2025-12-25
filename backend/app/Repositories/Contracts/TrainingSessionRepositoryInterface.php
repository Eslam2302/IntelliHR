<?php

namespace App\Repositories\Contracts;

use App\Models\TrainingSession;
use Illuminate\Pagination\LengthAwarePaginator;

interface TrainingSessionRepositoryInterface
{
    /**
     * Get paginated list of training sessions
     *
     * @param  int  $perPage
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Get a single training session by ID
     */
    public function show(int $id): TrainingSession;

    /**
     * Create a new training session
     */
    public function create(array $data): TrainingSession;

    /**
     * Update an existing training session
     */
    public function update(TrainingSession $trainingSession, array $data): TrainingSession;

    /**
     * Delete a training session
     */
    public function delete(TrainingSession $trainingSession): bool;
}
