<?php

namespace App\Repositories\Contracts;

use App\Models\LeaveType;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface LeaveTypeRepositoryInterface
{
    /**
     * Get all leave type with pagination
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Create a new leave type
     */
    public function create(array $data): LeaveType;

    /*
     * Update existing leave type
    */
    public function update(LeaveType $leaveType,array $data): LeaveType;

    /*
     * Delete existing leave type
    */
    public function delete(LeaveType $leaveType): bool;



}