<?php

namespace App\Repositories;

use App\Models\JobPosition;
use App\Repositories\Contracts\JobPositionRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class JobPositionRepository implements JobPositionRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected JobPosition $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        $query = $this->applyFilters(
            $query,
            $filters,
            ['title', 'grade'],
            ['id', 'title', 'grade', 'created_at', 'deleted_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Create new Job position
     */
    public function create(array $data): JobPosition
    {
        return $this->model->create($data);
    }

    /**
     * Update the existing position
     */
    public function update(JobPosition $jobPosition, array $data): JobPosition
    {
        $jobPosition->update($data);

        return $jobPosition->fresh();
    }

    /**
     * delete job position
     */
    public function delete(JobPosition $jobPosition): bool
    {
        return $jobPosition->delete();
    }
}
