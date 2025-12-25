<?php

namespace App\Repositories\Contracts;

use App\Models\LeaveType;
use Illuminate\Pagination\LengthAwarePaginator;

interface LeaveTypeRepositoryInterface
{
    /**
     * Get all leave type with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Create a new leave type
     */
    public function create(array $data): LeaveType;

    /*
     * Update existing leave type
    */
    public function update(LeaveType $leaveType, array $data): LeaveType;

    /*
     * Delete existing leave type
    */
    public function delete(LeaveType $leaveType): bool;
}
