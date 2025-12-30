<?php

namespace App\Repositories;

use App\Models\ReviewRating;
use App\Repositories\Contracts\ReviewRatingRepositoryInterface;

class ReviewRatingRepository implements ReviewRatingRepositoryInterface
{
    public function __construct(
        protected ReviewRating $model
    ) {}

    public function getAll(array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = $this->model->with(['performanceReview', 'competency']);

        // Filter by performance_review_id if provided
        if (isset($filters['performance_review_id'])) {
            $query->where('performance_review_id', $filters['performance_review_id']);
        }

        // Filter by competency_id if provided
        if (isset($filters['competency_id'])) {
            $query->where('competency_id', $filters['competency_id']);
        }

        return $query->get();
    }

    public function create(array $data): ReviewRating
    {
        return $this->model->create($data);
    }

    public function update(ReviewRating $reviewRating, array $data): ReviewRating
    {
        $reviewRating->update($data);

        return $reviewRating->fresh();
    }

    public function delete(ReviewRating $reviewRating): bool
    {
        return $reviewRating->delete();
    }
}

