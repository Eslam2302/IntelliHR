<?php

namespace App\Repositories;

use App\Models\Goal;
use App\Repositories\Contracts\GoalRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class GoalRepository implements GoalRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Goal $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['employee', 'evaluationCycle', 'setBy', 'progressUpdates']);

        // Define searchable fields
        $searchableFields = [
            'title',
            'description',
            'type',
            'category',
            'status',
            'employee.first_name',
            'employee.last_name',
            'employee.personal_email',
        ];

        // Define allowed sort columns
        $allowedSortFields = [
            'id',
            'title',
            'type',
            'category',
            'status',
            'progress_percentage',
            'start_date',
            'target_date',
            'employee_id',
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

    public function create(array $data): Goal
    {
        return $this->model->create($data);
    }

    public function update(Goal $goal, array $data): Goal
    {
        $goal->update($data);

        return $goal->fresh();
    }

    public function delete(Goal $goal): bool
    {
        return $goal->delete();
    }
}

