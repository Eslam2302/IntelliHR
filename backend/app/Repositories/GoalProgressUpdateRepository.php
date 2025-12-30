<?php

namespace App\Repositories;

use App\Models\GoalProgressUpdate;
use App\Repositories\Contracts\GoalProgressUpdateRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class GoalProgressUpdateRepository implements GoalProgressUpdateRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected GoalProgressUpdate $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['goal', 'updatedBy']);

        // Define searchable fields
        $searchableFields = [
            'update_note',
            'status',
            'goal.title',
            'updatedBy.first_name',
            'updatedBy.last_name',
        ];

        // Define allowed sort columns
        $allowedSortFields = [
            'id',
            'goal_id',
            'status',
            'progress_percentage',
            'update_date',
            'created_at',
            'updated_at',
        ];

        // Filter by goal_id if provided
        if (isset($filters['goal_id'])) {
            $query->where('goal_id', $filters['goal_id']);
        }

        // Apply filters using trait
        $query = $this->applyFilters(
            $query,
            $filters,
            $searchableFields,
            $allowedSortFields,
            'update_date',
            'desc'
        );

        // Get pagination limit
        $perPage = $this->getPaginationLimit($filters, 10);

        return $query->paginate($perPage);
    }

    public function create(array $data): GoalProgressUpdate
    {
        return $this->model->create($data);
    }

    public function update(GoalProgressUpdate $goalProgressUpdate, array $data): GoalProgressUpdate
    {
        $goalProgressUpdate->update($data);

        return $goalProgressUpdate->fresh();
    }

    public function delete(GoalProgressUpdate $goalProgressUpdate): bool
    {
        return $goalProgressUpdate->delete();
    }
}

