<?php

namespace App\Repositories\Contracts;

use App\Models\TrainingEvaluation;

interface TrainingEvaluationRepositoryInterface
{
    /**
     * Get paginated list of training evaluations
     *
     * @param  int  $perPage
     * @return mixed
     */
    public function getAll(array $filters = []);

    /**
     * Show a specific training evaluation
     */
    public function show(int $evaluationId): TrainingEvaluation;

    /**
     * Create a new training evaluation
     */
    public function create(array $data): TrainingEvaluation;

    /**
     * Update a training evaluation
     */
    public function update(TrainingEvaluation $evaluation, array $data): TrainingEvaluation;

    /**
     * Delete a training evaluation
     */
    public function delete(TrainingEvaluation $evaluation): bool;
}
