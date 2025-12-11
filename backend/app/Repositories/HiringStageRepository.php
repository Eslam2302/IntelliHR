<?php

namespace App\Repositories;

use App\Models\HiringStage;
use App\Repositories\Contracts\HiringStageRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class HiringStageRepository implements HiringStageRepositoryInterface
{
    public function __construct(
        protected HiringStage $model
    ) {}

    /**
     * Get paginated list of hiring stages.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with('job')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get a hiring stage by ID.
     *
     * @param int $hiringStageId
     * @return HiringStage
     */
    public function show(int $hiringStageId): HiringStage
    {
        return $this->model
            ->with('job')
            ->findOrFail($hiringStageId);
    }

    /**
     * Get all hiring stages for a specific job post.
     *
     * @param int $jobPostId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByJobPost(int $jobPostId)
    {
        return $this->model
            ->with('job')
            ->where('job_id', $jobPostId)
            ->orderBy('order')
            ->get();
    }


    /**
     * Create a new hiring stage.
     *
     * @param array $data
     * @return HiringStage
     */
    public function create(array $data): HiringStage
    {
        return $this->model
            ->create($data)
            ->load('job');
    }

    /**
     * Update an existing hiring stage.
     *
     * @param HiringStage $hiringStage
     * @param array $data
     * @return HiringStage
     */
    public function update(HiringStage $hiringStage, array $data): HiringStage
    {
        $hiringStage->update($data);
        return $hiringStage->fresh()->load('job');
    }

    /**
     * Delete a hiring stage.
     *
     * @param HiringStage $hiringStage
     * @return bool
     */
    public function delete(HiringStage $hiringStage): bool
    {
        return $hiringStage->delete();
    }
}
