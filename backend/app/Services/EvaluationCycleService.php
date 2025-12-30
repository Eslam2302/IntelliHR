<?php

namespace App\Services;

use App\DataTransferObjects\EvaluationCycleDTO;
use App\Models\EvaluationCycle;
use App\Repositories\Contracts\EvaluationCycleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluationCycleService
{
    public function __construct(
        protected EvaluationCycleRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching evaluation cycles: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(EvaluationCycleDTO $dto): EvaluationCycle
    {
        try {
            DB::beginTransaction();

            $evaluationCycle = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'evaluation_cycle',
                description: 'evaluation_cycle_created',
                subject: $evaluationCycle,
                properties: [
                    'name' => $evaluationCycle->name,
                    'type' => $evaluationCycle->type,
                    'year' => $evaluationCycle->year,
                    'period' => $evaluationCycle->period,
                    'status' => $evaluationCycle->status,
                ]
            );

            DB::commit();

            Log::info('Evaluation cycle created successfully', ['id' => $evaluationCycle->id, 'name' => $evaluationCycle->name]);

            return $evaluationCycle->load(['creator', 'reviews']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating evaluation cycle: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(EvaluationCycle $evaluationCycle, EvaluationCycleDTO $dto): EvaluationCycle
    {
        try {
            DB::beginTransaction();

            $oldData = $evaluationCycle->only([
                'name',
                'type',
                'year',
                'period',
                'status',
                'start_date',
                'end_date',
            ]);

            $updateData = $dto->toUpdateArray();
            $updatedEvaluationCycle = $this->repository->update($evaluationCycle, $updateData);

            $this->activityLogger->log(
                logName: 'evaluation_cycle',
                description: 'evaluation_cycle_updated',
                subject: $updatedEvaluationCycle,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedEvaluationCycle->only([
                        'name',
                        'type',
                        'year',
                        'period',
                        'status',
                        'start_date',
                        'end_date',
                    ]),
                ]
            );

            DB::commit();

            Log::info('Evaluation cycle updated successfully', ['id' => $evaluationCycle->id, 'name' => $evaluationCycle->name]);

            return $updatedEvaluationCycle->load(['creator', 'reviews']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating evaluation cycle {$evaluationCycle->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(EvaluationCycle $evaluationCycle): bool
    {
        try {
            DB::beginTransaction();

            $data = $evaluationCycle;

            $deleted = $this->repository->delete($evaluationCycle);

            $this->activityLogger->log(
                logName: 'evaluation_cycle',
                description: 'evaluation_cycle_deleted',
                subject: $evaluationCycle,
                properties: [$data]
            );

            DB::commit();

            Log::info('Evaluation cycle deleted successfully', ['id' => $evaluationCycle->id, 'name' => $evaluationCycle->name]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting evaluation cycle {$evaluationCycle->id}: ".$e->getMessage());
            throw $e;
        }
    }
}

