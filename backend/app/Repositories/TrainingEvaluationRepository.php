<?php

namespace App\Repositories;

use App\Models\TrainingEvaluation;
use App\Repositories\Contracts\TrainingEvaluationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainingEvaluationRepository implements TrainingEvaluationRepositoryInterface
{
    public function __construct(protected TrainingEvaluation $model) {}

    /**
     * Get paginated list of training evaluations
     */
    public function getAllPaginated(int $perPage = 10)
    {
        return $this->model->with(['employee', 'training'])->latest()->paginate($perPage);
    }

    /**
     * Show a specific training evaluation
     */
    public function show(int $evaluationId): TrainingEvaluation
    {
        return $this->model->with(['employee', 'training'])->findOrFail($evaluationId);
    }

    /**
     * Create a new training evaluation
     */
    public function create(array $data): TrainingEvaluation
    {
        return $this->model->create($data);
    }

    /**
     * Update a training evaluation
     */
    public function update(TrainingEvaluation $evaluation, array $data): TrainingEvaluation
    {
        $evaluation->update($data);
        return $evaluation->fresh();
    }

    /**
     * Delete a training evaluation
     */
    public function delete(TrainingEvaluation $evaluation): bool
    {
        return $evaluation->delete();
    }
}
