<?php

namespace App\Repositories;

use App\Models\HiringStage;
use App\Repositories\Contracts\HiringStageRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class HiringStageRepository implements HiringStageRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected HiringStage $model
    ) {}

    /**
     * Get paginated list of hiring stages.
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('job');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['stage_name', 'job.title', 'job.status'],
            ['id', 'stage_name', 'order', 'created_at'],
            'order',
            'asc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get a hiring stage by ID.
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
     */
    public function create(array $data): HiringStage
    {
        return $this->model
            ->create($data)
            ->load('job');
    }

    /**
     * Update an existing hiring stage.
     */
    public function update(HiringStage $hiringStage, array $data): HiringStage
    {
        $hiringStage->update($data);

        return $hiringStage->fresh()->load('job');
    }

    /**
     * Delete a hiring stage.
     */
    public function delete(HiringStage $hiringStage): bool
    {
        return $hiringStage->delete();
    }
}
