<?php

namespace App\Services;

use App\DataTransferObjects\GoalDTO;
use App\Models\Goal;
use App\Repositories\Contracts\GoalRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GoalService
{
    public function __construct(
        protected GoalRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching goals: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(GoalDTO $dto): Goal
    {
        try {
            DB::beginTransaction();

            $data = $dto->toArray();
            // Set default status if not provided
            if (!isset($data['status'])) {
                $data['status'] = 'not_started';
            }
            if (!isset($data['progress_percentage'])) {
                $data['progress_percentage'] = 0;
            }

            $goal = $this->repository->create($data);

            $this->activityLogger->log(
                logName: 'goal',
                description: 'goal_created',
                subject: $goal,
                properties: [
                    'employee_id' => $goal->employee_id,
                    'title' => $goal->title,
                    'type' => $goal->type,
                    'category' => $goal->category,
                    'status' => $goal->status,
                ]
            );

            DB::commit();

            Log::info('Goal created successfully', ['id' => $goal->id, 'title' => $goal->title]);

            return $goal->load(['employee', 'evaluationCycle', 'setBy']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating goal: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(Goal $goal, GoalDTO $dto): Goal
    {
        try {
            DB::beginTransaction();

            $oldData = $goal->only([
                'title',
                'status',
                'progress_percentage',
                'target_date',
            ]);

            $updateData = $dto->toUpdateArray();
            $updatedGoal = $this->repository->update($goal, $updateData);

            $this->activityLogger->log(
                logName: 'goal',
                description: 'goal_updated',
                subject: $updatedGoal,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedGoal->only([
                        'title',
                        'status',
                        'progress_percentage',
                        'target_date',
                    ]),
                ]
            );

            DB::commit();

            Log::info('Goal updated successfully', ['id' => $goal->id, 'title' => $goal->title]);

            return $updatedGoal->load(['employee', 'evaluationCycle', 'setBy']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating goal {$goal->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(Goal $goal): bool
    {
        try {
            DB::beginTransaction();

            $data = $goal;

            $deleted = $this->repository->delete($goal);

            $this->activityLogger->log(
                logName: 'goal',
                description: 'goal_deleted',
                subject: $goal,
                properties: [$data]
            );

            DB::commit();

            Log::info('Goal deleted successfully', ['id' => $goal->id, 'title' => $goal->title]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting goal {$goal->id}: ".$e->getMessage());
            throw $e;
        }
    }
}

