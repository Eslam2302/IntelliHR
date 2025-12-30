<?php

namespace App\Services;

use App\DataTransferObjects\PerformanceReviewDTO;
use App\Models\PerformanceReview;
use App\Repositories\Contracts\PerformanceReviewRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerformanceReviewService
{
    public function __construct(
        protected PerformanceReviewRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching performance reviews: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(PerformanceReviewDTO $dto): PerformanceReview
    {
        try {
            DB::beginTransaction();

            $data = $dto->toArray();
            // Set default status if not provided
            if (!isset($data['status'])) {
                $data['status'] = 'not_started';
            }

            $performanceReview = $this->repository->create($data);

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'performance_review_created',
                subject: $performanceReview,
                properties: [
                    'evaluation_cycle_id' => $performanceReview->evaluation_cycle_id,
                    'employee_id' => $performanceReview->employee_id,
                    'reviewer_id' => $performanceReview->reviewer_id,
                    'status' => $performanceReview->status,
                ]
            );

            DB::commit();

            Log::info('Performance review created successfully', [
                'id' => $performanceReview->id,
                'employee_id' => $performanceReview->employee_id,
            ]);

            return $performanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating performance review: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(PerformanceReview $performanceReview, PerformanceReviewDTO $dto): PerformanceReview
    {
        try {
            DB::beginTransaction();

            $oldData = $performanceReview->only([
                'status',
                'overall_rating',
                'overall_score',
            ]);

            $updateData = $dto->toUpdateArray();
            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            // Recalculate overall score if ratings changed
            if ($updatedPerformanceReview->ratings()->exists()) {
                $overallScore = $updatedPerformanceReview->calculateOverallScore();
                $updatedPerformanceReview->update(['overall_score' => $overallScore]);
                $updatedPerformanceReview->refresh();
            }

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'performance_review_updated',
                subject: $updatedPerformanceReview,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedPerformanceReview->only([
                        'status',
                        'overall_rating',
                        'overall_score',
                    ]),
                ]
            );

            DB::commit();

            Log::info('Performance review updated successfully', [
                'id' => $performanceReview->id,
                'employee_id' => $performanceReview->employee_id,
            ]);

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating performance review {$performanceReview->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(PerformanceReview $performanceReview): bool
    {
        try {
            DB::beginTransaction();

            $data = $performanceReview;

            $deleted = $this->repository->delete($performanceReview);

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'performance_review_deleted',
                subject: $performanceReview,
                properties: [$data]
            );

            DB::commit();

            Log::info('Performance review deleted successfully', ['id' => $performanceReview->id]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting performance review {$performanceReview->id}: ".$e->getMessage());
            throw $e;
        }
    }
}

