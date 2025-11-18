<?php

namespace App\Repositories\Contracts;

use App\Models\JobPosition;
use Illuminate\Pagination\LengthAwarePaginator;

interface JobPositionRepositoryInterface
{
    /**
     * Get all jobs with pagination
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Create new Job position
     */
    public function create(array $data): JobPosition;

    /**
     * Update the existing position
     */
    public function update(JobPosition $jobPosition,array $data): JobPosition;

    /**
     * delete job position
     */
    public function delete(JobPosition $jobPosition): bool;
}