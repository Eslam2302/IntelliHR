<?php

namespace App\Repositories;

use App\Models\TrainingEvaluation;
use App\Repositories\Contracts\TrainingEvaluationRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainingEvaluationRepository implements TrainingEvaluationRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(protected TrainingEvaluation $model) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['employee', 'training']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'training_id', 'rating', 'feedback', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'training.title'],
            ['id', 'rating', 'feedback', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
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
