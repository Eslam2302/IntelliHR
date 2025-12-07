<?php

namespace App\Repositories\Contracts;

use App\Models\TrainingEvaluation;

interface TrainingEvaluationRepositoryInterface
{
    /**
     * Get paginated list of training evaluations
     *
     * @param int $perPage
     * @return mixed
     */
    public function getAllPaginated(int $perPage = 10);

    /**
     * Show a specific training evaluation
     *
     * @param int $evaluationId
     * @return TrainingEvaluation
     */
    public function show(int $evaluationId): TrainingEvaluation;

    /**
     * Create a new training evaluation
     *
     * @param array $data
     * @return TrainingEvaluation
     */
    public function create(array $data): TrainingEvaluation;

    /**
     * Update a training evaluation
     *
     * @param TrainingEvaluation $evaluation
     * @param array $data
     * @return TrainingEvaluation
     */
    public function update(TrainingEvaluation $evaluation, array $data): TrainingEvaluation;

    /**
     * Delete a training evaluation
     *
     * @param TrainingEvaluation $evaluation
     * @return bool
     */
    public function delete(TrainingEvaluation $evaluation): bool;
}