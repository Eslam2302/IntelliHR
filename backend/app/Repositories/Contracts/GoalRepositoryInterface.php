<?php

namespace App\Repositories\Contracts;

use App\Models\Goal;
use Illuminate\Pagination\LengthAwarePaginator;

interface GoalRepositoryInterface
{
    /**
     * Get all goals with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Create a new goal
     */
    public function create(array $data): Goal;

    /**
     * Update existing goal
     */
    public function update(Goal $goal, array $data): Goal;

    /**
     * Delete existing goal
     */
    public function delete(Goal $goal): bool;
}

