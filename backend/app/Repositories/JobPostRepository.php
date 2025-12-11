<?php

namespace App\Repositories;

use App\Models\JobPost;
use App\Repositories\Contracts\JobPostRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class JobPostRepository implements JobPostRepositoryInterface
{
    public function __construct(
        protected JobPost $model
    ) {}

    /**
     * Get paginated list of job posts.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with('department')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get a job post by ID.
     *
     * @param int $jobPostId
     * @return JobPost
     */
    public function show(int $jobPostId): JobPost
    {
        return $this->model
            ->with('department')
            ->findOrFail($jobPostId);
    }

    /**
     * Create a new job post.
     *
     * @param array $data
     * @return JobPost
     */
    public function create(array $data): JobPost
    {
        return $this->model
            ->create($data)
            ->load('department');
    }

    /**
     * Update existing job post.
     *
     * @param JobPost $jobPost
     * @param array $data
     * @return JobPost
     */
    public function update(JobPost $jobPost, array $data): JobPost
    {
        $jobPost->update($data);
        return $jobPost->fresh()->load('department');
    }

    /**
     * Delete a job post.
     *
     * @param JobPost $jobPost
     * @return bool
     */
    public function delete(JobPost $jobPost): bool
    {
        return $jobPost->delete();
    }
}
