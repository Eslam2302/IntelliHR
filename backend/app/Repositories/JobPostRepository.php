<?php

namespace App\Repositories;

use App\Models\JobPost;
use App\Repositories\Contracts\JobPostRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class JobPostRepository implements JobPostRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected JobPost $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('department');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['title', 'description', 'status', 'department.name'],
            ['id', 'title', 'description', 'status', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get a job post by ID.
     */
    public function show(int $jobPostId): JobPost
    {
        return $this->model
            ->with('department')
            ->findOrFail($jobPostId);
    }

    /**
     * Create a new job post.
     */
    public function create(array $data): JobPost
    {
        return $this->model
            ->create($data)
            ->load('department');
    }

    /**
     * Update existing job post.
     */
    public function update(JobPost $jobPost, array $data): JobPost
    {
        $jobPost->update($data);

        return $jobPost->fresh()->load('department');
    }

    /**
     * Delete a job post.
     */
    public function delete(JobPost $jobPost): bool
    {
        return $jobPost->delete();
    }
}
