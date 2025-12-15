<?php

namespace App\Services;

use App\DataTransferObjects\TrainingEvaluationDTO;
use App\Models\TrainingEvaluation;
use App\Repositories\Contracts\TrainingEvaluationRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Exception;

class TrainingEvaluationService
{
    public function __construct(
        protected TrainingEvaluationRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

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
        } catch (Exception $e) {
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
            $evaluation = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'trainingEvaluation',
                description: 'training_evaluation_created',
                subject: $evaluation,
                properties: [
                    'employee_id' => $evaluation->employee_id,
                    'training_id' => $evaluation->training_id,
                    'rating' => $evaluation->rating,
                    'feedback' => $evaluation->feedback,
                ]
            );

            Log::info("Training Evaluation created successfully", [
                'id' => $evaluation->id,
                'employee_id' => $evaluation->employee_id,
                'training_id' => $evaluation->training_id,
            ]);

            return $evaluation;
        } catch (Exception $e) {
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
            $oldData = $evaluation->only([
                'employee_id',
                'training_id',
                'rating',
                'feedback',
            ]);

            $updatedEvaluation = $this->repository->update($evaluation, $dto->toArray());

            $this->activityLogger->log(
                logName: 'trainingEvaluation',
                description: 'training_evaluation_updated',
                subject: $updatedEvaluation,
                properties: [
                    'before' => $oldData,
                    'after'  => $updatedEvaluation->only([
                        'employee_id',
                        'training_id',
                        'rating',
                        'feedback',
                    ]),
                ]
            );

            Log::info("Training Evaluation updated successfully", [
                'id' => $updatedEvaluation->id,
                'employee_id' => $updatedEvaluation->employee_id,
            ]);

            return $updatedEvaluation;
        } catch (Exception $e) {
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
            $data = $evaluation->only([
                'employee_id',
                'training_id',
                'rating',
                'feedback',
            ]);

            $deleted = $this->repository->delete($evaluation);

            $this->activityLogger->log(
                logName: 'trainingEvaluation',
                description: 'training_evaluation_deleted',
                subject: $evaluation,
                properties: $data
            );

            Log::info("Training Evaluation deleted successfully", [
                'id' => $evaluation->id,
                'employee_id' => $evaluation->employee_id,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting Training Evaluation ID {$evaluation->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
