<?php

namespace App\Repositories\Contracts;

use App\Models\EvaluationCycle;
use Illuminate\Pagination\LengthAwarePaginator;

interface EvaluationCycleRepositoryInterface
{
    /**
     * Get all evaluation cycles with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Create a new evaluation cycle
     */
    public function create(array $data): EvaluationCycle;

    /**
     * Update existing evaluation cycle
     */
    public function update(EvaluationCycle $evaluationCycle, array $data): EvaluationCycle;

    /**
     * Delete existing evaluation cycle
     */
    public function delete(EvaluationCycle $evaluationCycle): bool;
}

