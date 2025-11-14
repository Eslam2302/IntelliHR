<?php

namespace App\Repositories;

use App\Models\LeaveType;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveTypeRepository implements LeaveTypeRepositoryInterface
{
    public function __construct(
        protected LeaveType $model
    ) {}

    /**
     * Get all leave type with pagination
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perpage);
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
