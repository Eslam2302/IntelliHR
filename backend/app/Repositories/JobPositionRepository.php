<?php

namespace App\Repositories;

use App\Repositories\Contracts\JobPositionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\JobPosition;

class JobPositionRepository implements JobPositionRepositoryInterface
{
    public function __construct(
        protected JobPosition $model
    ) {}

    /**
     * Get all jobs with pagination
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perpage);
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
    public function update(JobPosition $jobPosition,array $data): JobPosition
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
