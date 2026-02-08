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

    public function submitSelfAssessment(
        PerformanceReview $performanceReview,
        array $selfAssessmentData
    ): PerformanceReview {
        try {
            DB::beginTransaction();

            // Validate that employee can submit self-assessment
            if (!$performanceReview->canEmployeeEdit()) {
                throw new \Exception('Self-assessment cannot be submitted at this time.');
            }

            // Update self-assessment fields
            $updateData = [
                'self_assessment_summary' => $selfAssessmentData['summary'] ?? null,
                'self_assessment_achievements' => $selfAssessmentData['achievements'] ?? [],
                'self_assessment_challenges' => $selfAssessmentData['challenges'] ?? [],
                'self_assessment_goals' => $selfAssessmentData['goals'] ?? [],
                'status' => 'self_assessment_submitted',
                'self_assessment_submitted_at' => now(),
            ];

            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'self_assessment_submitted',
                subject: $updatedPerformanceReview,
                properties: [
                    'employee_id' => $updatedPerformanceReview->employee_id,
                    'evaluation_cycle_id' => $updatedPerformanceReview->evaluation_cycle_id,
                ]
            );

            DB::commit();

            Log::info('Self-assessment submitted successfully', [
                'review_id' => $performanceReview->id,
                'employee_id' => $performanceReview->employee_id,
            ]);

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error submitting self-assessment for review {$performanceReview->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function submitManagerReview(
        PerformanceReview $performanceReview,
        array $managerReviewData
    ): PerformanceReview {
        try {
            DB::beginTransaction();

            // Validate that manager can submit review
            if (!$performanceReview->canManagerEdit()) {
                throw new \Exception('Manager review cannot be submitted at this time.');
            }

            // Update manager review fields
            $updateData = [
                'manager_summary' => $managerReviewData['summary'] ?? null,
                'manager_strengths' => $managerReviewData['strengths'] ?? [],
                'manager_areas_for_improvement' => $managerReviewData['areas_for_improvement'] ?? [],
                'manager_goals_for_next_period' => $managerReviewData['goals_for_next_period'] ?? [],
                'manager_additional_comments' => $managerReviewData['additional_comments'] ?? null,
                'overall_rating' => $managerReviewData['overall_rating'] ?? null,
                'overall_score' => $managerReviewData['overall_score'] ?? null,
                'promotion_recommended' => $managerReviewData['promotion_recommended'] ?? false,
                'salary_increase_percentage' => $managerReviewData['salary_increase_percentage'] ?? null,
                'bonus_amount' => $managerReviewData['bonus_amount'] ?? null,
                'recommended_training' => $managerReviewData['recommended_training'] ?? [],
                'development_plan' => $managerReviewData['development_plan'] ?? [],
                'status' => 'awaiting_acknowledgment',
                'manager_review_submitted_at' => now(),
            ];

            // Recalculate overall score if ratings exist
            if ($performanceReview->ratings()->exists()) {
                $overallScore = $performanceReview->calculateOverallScore();
                $updateData['overall_score'] = $overallScore;
            }

            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'manager_review_submitted',
                subject: $updatedPerformanceReview,
                properties: [
                    'employee_id' => $updatedPerformanceReview->employee_id,
                    'reviewer_id' => $updatedPerformanceReview->reviewer_id,
                    'evaluation_cycle_id' => $updatedPerformanceReview->evaluation_cycle_id,
                    'overall_rating' => $updatedPerformanceReview->overall_rating,
                    'overall_score' => $updatedPerformanceReview->overall_score,
                ]
            );

            DB::commit();

            Log::info('Manager review submitted successfully', [
                'review_id' => $performanceReview->id,
                'reviewer_id' => $performanceReview->reviewer_id,
            ]);

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error submitting manager review for review {$performanceReview->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function startSelfAssessment(PerformanceReview $performanceReview): PerformanceReview
    {
        try {
            DB::beginTransaction();

            if (!$performanceReview->canEmployeeEdit()) {
                throw new \Exception('Self-assessment cannot be started at this time.');
            }

            $updateData = ['status' => 'self_assessment_in_progress'];
            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            DB::commit();

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error starting self-assessment for review {$performanceReview->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function startManagerReview(PerformanceReview $performanceReview): PerformanceReview
    {
        try {
            DB::beginTransaction();

            if (!$performanceReview->canManagerEdit()) {
                throw new \Exception('Manager review cannot be started at this time.');
            }

            $updateData = ['status' => 'manager_review_in_progress'];
            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            DB::commit();

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error starting manager review for review {$performanceReview->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function acknowledgeReview(
        PerformanceReview $performanceReview,
        ?string $comments = null
    ): PerformanceReview {
        try {
            DB::beginTransaction();

            // Validate that employee can acknowledge
            if (!$performanceReview->canEmployeeAcknowledge()) {
                throw new \Exception('Review cannot be acknowledged at this time.');
            }

            $updateData = [
                'status' => 'acknowledged',
                'acknowledged_at' => now(),
                'employee_acknowledgment_comments' => $comments,
            ];

            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'performance_review_acknowledged',
                subject: $updatedPerformanceReview,
                properties: [
                    'employee_id' => $updatedPerformanceReview->employee_id,
                    'acknowledged_at' => $updatedPerformanceReview->acknowledged_at,
                ]
            );

            DB::commit();

            Log::info('Performance review acknowledged successfully', [
                'review_id' => $performanceReview->id,
                'employee_id' => $performanceReview->employee_id,
            ]);

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error acknowledging performance review {$performanceReview->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function completeReview(PerformanceReview $performanceReview): PerformanceReview
    {
        try {
            DB::beginTransaction();

            // Validate that review can be completed
            if (!$performanceReview->canComplete()) {
                throw new \Exception('Review cannot be completed at this time.');
            }

            $updateData = [
                'status' => 'completed',
                'completed_at' => now(),
            ];

            $updatedPerformanceReview = $this->repository->update($performanceReview, $updateData);

            $this->activityLogger->log(
                logName: 'performance_review',
                description: 'performance_review_completed',
                subject: $updatedPerformanceReview,
                properties: [
                    'employee_id' => $updatedPerformanceReview->employee_id,
                    'completed_at' => $updatedPerformanceReview->completed_at,
                ]
            );

            DB::commit();

            Log::info('Performance review completed successfully', [
                'review_id' => $performanceReview->id,
                'employee_id' => $performanceReview->employee_id,
            ]);

            return $updatedPerformanceReview->load(['evaluationCycle', 'employee', 'reviewer', 'ratings']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error completing performance review {$performanceReview->id}: ".$e->getMessage());
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

