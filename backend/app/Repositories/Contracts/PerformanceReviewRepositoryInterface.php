<?php

namespace App\Repositories\Contracts;

use App\Models\PerformanceReview;
use Illuminate\Pagination\LengthAwarePaginator;

interface PerformanceReviewRepositoryInterface
{
    /**
     * Get all performance reviews with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Create a new performance review
     */
    public function create(array $data): PerformanceReview;

    /**
     * Update existing performance review
     */
    public function update(PerformanceReview $performanceReview, array $data): PerformanceReview;

    /**
     * Delete existing performance review
     */
    public function delete(PerformanceReview $performanceReview): bool;
}

