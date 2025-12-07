<?php

namespace App\Services;

use App\DataTransferObjects\TrainingEvaluationDTO;
use App\Models\TrainingEvaluation;
use App\Repositories\Contracts\TrainingEvaluationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TrainingEvaluationService
{
    public function __construct(protected TrainingEvaluationRepositoryInterface $repository) {}

    /**
     * Get paginated list of training evaluations
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching Training Evaluations: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Show a specific training evaluation
     */
    public function show(int $evaluationId): TrainingEvaluation
    {
        try {
            return $this->repository->show($evaluationId);
        } catch (\Exception $e) {
            Log::error("Error fetching Training Evaluation ID {$evaluationId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new training evaluation
     */
    public function create(TrainingEvaluationDTO $dto): TrainingEvaluation
    {
        try {
            return $this->repository->create($dto->toArray());
        } catch (\Exception $e) {
            Log::error('Error creating Training Evaluation: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update a training evaluation
     */
    public function update(TrainingEvaluation $evaluation, TrainingEvaluationDTO $dto): TrainingEvaluation
    {
        try {
            return $this->repository->update($evaluation, $dto->toArray());
        } catch (\Exception $e) {
            Log::error("Error updating Training Evaluation ID {$evaluation->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete a training evaluation
     */
    public function delete(TrainingEvaluation $evaluation): bool
    {
        try {
            return $this->repository->delete($evaluation);
        } catch (\Exception $e) {
            Log::error("Error deleting Training Evaluation ID {$evaluation->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
