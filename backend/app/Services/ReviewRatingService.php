<?php

namespace App\Services;

use App\DataTransferObjects\ReviewRatingDTO;
use App\Models\ReviewRating;
use App\Repositories\Contracts\ReviewRatingRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReviewRatingService
{
    public function __construct(
        protected ReviewRatingRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching review ratings: '.$e->getMessage());
            throw $e;
        }
    }

    public function create(ReviewRatingDTO $dto): ReviewRating
    {
        try {
            DB::beginTransaction();

            $reviewRating = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'review_rating',
                description: 'review_rating_created',
                subject: $reviewRating,
                properties: [
                    'performance_review_id' => $reviewRating->performance_review_id,
                    'competency_id' => $reviewRating->competency_id,
                    'self_rating' => $reviewRating->self_rating,
                    'manager_rating' => $reviewRating->manager_rating,
                ]
            );

            DB::commit();

            Log::info('Review rating created successfully', ['id' => $reviewRating->id]);

            return $reviewRating->load(['performanceReview', 'competency']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating review rating: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(ReviewRating $reviewRating, ReviewRatingDTO $dto): ReviewRating
    {
        try {
            DB::beginTransaction();

            $oldData = $reviewRating->only([
                'self_rating',
                'manager_rating',
            ]);

            $updateData = $dto->toUpdateArray();
            $updatedReviewRating = $this->repository->update($reviewRating, $updateData);

            // Update overall score in performance review if manager rating changed
            if ($updatedReviewRating->performanceReview && isset($oldData['manager_rating'])) {
                $overallScore = $updatedReviewRating->performanceReview->calculateOverallScore();
                $updatedReviewRating->performanceReview->update(['overall_score' => $overallScore]);
            }

            $this->activityLogger->log(
                logName: 'review_rating',
                description: 'review_rating_updated',
                subject: $updatedReviewRating,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedReviewRating->only([
                        'self_rating',
                        'manager_rating',
                    ]),
                ]
            );

            DB::commit();

            Log::info('Review rating updated successfully', ['id' => $reviewRating->id]);

            return $updatedReviewRating->load(['performanceReview', 'competency']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating review rating {$reviewRating->id}: ".$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(ReviewRating $reviewRating): bool
    {
        try {
            DB::beginTransaction();

            $data = $reviewRating;

            $deleted = $this->repository->delete($reviewRating);

            $this->activityLogger->log(
                logName: 'review_rating',
                description: 'review_rating_deleted',
                subject: $reviewRating,
                properties: [$data]
            );

            DB::commit();

            Log::info('Review rating deleted successfully', ['id' => $reviewRating->id]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting review rating {$reviewRating->id}: ".$e->getMessage());
            throw $e;
        }
    }
}

