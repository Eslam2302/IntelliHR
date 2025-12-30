<?php

namespace App\Repositories;

use App\Models\EvaluationCycle;
use App\Repositories\Contracts\EvaluationCycleRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class EvaluationCycleRepository implements EvaluationCycleRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected EvaluationCycle $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['creator', 'reviews']);

        // Define searchable fields
        $searchableFields = [
            'name',
            'type',
            'year',
            'period',
            'status',
            'description',
            'creator.first_name',
            'creator.last_name',
        ];

        // Define allowed sort columns
        $allowedSortFields = [
            'id',
            'name',
            'type',
            'year',
            'period',
            'status',
            'start_date',
            'end_date',
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

    public function create(array $data): EvaluationCycle
    {
        return $this->model->create($data);
    }

    public function update(EvaluationCycle $evaluationCycle, array $data): EvaluationCycle
    {
        $evaluationCycle->update($data);

        return $evaluationCycle->fresh();
    }

    public function delete(EvaluationCycle $evaluationCycle): bool
    {
        return $evaluationCycle->delete();
    }
}

