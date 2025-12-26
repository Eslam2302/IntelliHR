<?php

namespace App\Repositories;

use App\Models\LeaveType;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveTypeRepository implements LeaveTypeRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected LeaveType $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        $query = $this->applyFilters(
            $query,
            $filters,
            ['name', 'description'],
            ['id', 'name', 'description', 'created_at', 'deleted_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Create a new leave type
     */
    public function create(array $data): LeaveType
    {
        return $this->model->create($data);
    }

    /*
     * Update existing leave type
    */
    public function update(LeaveType $leaveType, array $data): LeaveType
    {
        $leaveType->update($data);

        return $leaveType->fresh();
    }

    /*
     * Delete existing leave type
    */
    public function delete(LeaveType $leaveType): bool
    {
        return $leaveType->delete();
    }
}
