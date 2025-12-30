<?php

namespace App\Repositories\Contracts;

use App\Models\ReviewRating;

interface ReviewRatingRepositoryInterface
{
    /**
     * Get all review ratings (typically filtered by performance review)
     */
    public function getAll(array $filters = []): \Illuminate\Database\Eloquent\Collection;

    /**
     * Create a new review rating
     */
    public function create(array $data): ReviewRating;

    /**
     * Update existing review rating
     */
    public function update(ReviewRating $reviewRating, array $data): ReviewRating;

    /**
     * Delete existing review rating
     */
    public function delete(ReviewRating $reviewRating): bool;
}

