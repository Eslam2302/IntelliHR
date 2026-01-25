<?php

namespace App\Repositories;

use App\Models\PerformanceReview;
use App\Repositories\Contracts\PerformanceReviewRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class PerformanceReviewRepository implements PerformanceReviewRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected PerformanceReview $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['evaluationCycle', 'employee', 'reviewer', 'ratings']);

        // Define searchable fields
        $searchableFields = [
            'status',
            'overall_rating',
            'employee.first_name',
            'employee.last_name',
            'employee.work_email',
            'reviewer.first_name',
            'reviewer.last_name',
            'evaluationCycle.name',
        ];

        // Define allowed sort columns
        $allowedSortFields = [
            'id',
            'status',
            'overall_rating',
            'overall_score',
            'employee_id',
            'reviewer_id',
            'evaluation_cycle_id',
            'created_at',
            'updated_at',
            'deleted_at',
        ];

        // Apply filters using trait
        $query = $this->applyFilters(
            $query,
            $filters,
            $searchableFields,
            $allowedSortFields,
            'id',
            'desc'
        );

        // Get pagination limit
        $perPage = $this->getPaginationLimit($filters, 10);

        return $query->paginate($perPage);
    }

    public function create(array $data): PerformanceReview
    {
        return $this->model->create($data);
    }

    public function update(PerformanceReview $performanceReview, array $data): PerformanceReview
    {
        $performanceReview->update($data);

        return $performanceReview->fresh();
    }

    public function delete(PerformanceReview $performanceReview): bool
    {
        return $performanceReview->delete();
    }
}

