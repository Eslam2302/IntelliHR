<?php

namespace App\Repositories\Contracts;

use App\Models\GoalProgressUpdate;
use Illuminate\Pagination\LengthAwarePaginator;

interface GoalProgressUpdateRepositoryInterface
{
    /**
     * Get all goal progress updates with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Create a new goal progress update
     */
    public function create(array $data): GoalProgressUpdate;

    /**
     * Update existing goal progress update
     */
    public function update(GoalProgressUpdate $goalProgressUpdate, array $data): GoalProgressUpdate;

    /**
     * Delete existing goal progress update
     */
    public function delete(GoalProgressUpdate $goalProgressUpdate): bool;
}

