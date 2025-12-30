<?php

namespace App\Services;

use App\DataTransferObjects\GoalProgressDTO;
use App\Models\GoalProgressUpdate;
use App\Repositories\Contracts\GoalProgressUpdateRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GoalProgressUpdateService
{
    public function __construct(
        protected GoalProgressUpdateRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching goal progress updates: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(GoalProgressDTO $dto, int $goalId): GoalProgressUpdate
    {
        try {
            DB::beginTransaction();

            $data = $dto->toArray();
            $data['goal_id'] = $goalId;
            if (!isset($data['update_date'])) {
                $data['update_date'] = now()->toDateString();
            }

            $goalProgressUpdate = $this->repository->create($data);

            
            $this->activityLogger->log(
                logName: 'goal_progress_update',
                description: 'goal_progress_update_created',
                subject: $goalProgressUpdate,
                properties: [
                    'goal_id' => $goalProgressUpdate->goal_id,
                    'progress_percentage' => $goalProgressUpdate->progress_percentage,
                    'status' => $goalProgressUpdate->status,
                ]
            );

            DB::commit();

            Log::info('Goal progress update created successfully', [
                'id' => $goalProgressUpdate->id,
                'goal_id' => $goalProgressUpdate->goal_id,
            ]);

            return $goalProgressUpdate->load(['goal', 'updatedBy']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating goal progress update: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(GoalProgressUpdate $goalProgressUpdate, GoalProgressDTO $dto): GoalProgressUpdate
    {
        try {
            DB::beginTransaction();

            $oldData = $goalProgressUpdate->only([
                'progress_percentage',
                'status',
            ]);

            $updateData = $dto->toUpdateArray();
            $updatedGoalProgressUpdate = $this->repository->update($goalProgressUpdate, $updateData);

            

            $this->activityLogger->log(
                logName: 'goal_progress_update',
                description: 'goal_progress_update_updated',
                subject: $updatedGoalProgressUpdate,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedGoalProgressUpdate->only([
                        'progress_percentage',
                        'status',
                    ]),
                ]
            );

            DB::commit();

            Log::info('Goal progress update updated successfully', ['id' => $goalProgressUpdate->id]);

            return $updatedGoalProgressUpdate->load(['goal', 'updatedBy']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating goal progress update {$goalProgressUpdate->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(GoalProgressUpdate $goalProgressUpdate): bool
    {
        try {
            DB::beginTransaction();

            $data = $goalProgressUpdate;

            $deleted = $this->repository->delete($goalProgressUpdate);

            $this->activityLogger->log(
                logName: 'goal_progress_update',
                description: 'goal_progress_update_deleted',
                subject: $goalProgressUpdate,
                properties: [$data]
            );

            DB::commit();

            Log::info('Goal progress update deleted successfully', ['id' => $goalProgressUpdate->id]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting goal progress update {$goalProgressUpdate->id}: ".$e->getMessage());
            throw $e;
        }
    }
}

