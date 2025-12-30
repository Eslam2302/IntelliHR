<?php

namespace App\Repositories;

use App\Models\Competency;
use App\Repositories\Contracts\CompetencyRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class CompetencyRepository implements CompetencyRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Competency $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        // Define searchable fields
        $searchableFields = [
            'name',
            'description',
            'category',
            'applicable_to',
        ];

        // Define allowed sort columns
        $allowedSortFields = [
            'id',
            'name',
            'category',
            'applicable_to',
            'weight',
            'is_active',
            'display_order',
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
            'display_order',
            'asc'
        );

        // Get pagination limit
        $perPage = $this->getPaginationLimit($filters, 10);

        return $query->paginate($perPage);
    }

    public function create(array $data): Competency
    {
        return $this->model->create($data);
    }

    public function update(Competency $competency, array $data): Competency
    {
        $competency->update($data);

        return $competency->fresh();
    }

    public function delete(Competency $competency): bool
    {
        return $competency->delete();
    }
}

