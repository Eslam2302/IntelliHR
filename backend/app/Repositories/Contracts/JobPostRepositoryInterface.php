<?php

namespace App\Repositories\Contracts;

use App\DataTransferObjects\JobPostDTO;
use App\Models\JobPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface JobPostRepositoryInterface
{
    /**
     * Get paginated list of job posts.
     *
     * @param  int  $perPage
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Find a job post by its ID.
     *
     * @param  int  $id
     * @return JobPost|null
     */
    public function show(int $jobPostId): JobPost;

    /**
     * Create a new job post.
     *
     * @param  JobPostDTO  $dto
     */
    public function create(array $data): JobPost;

    /**
     * Update an existing job post.
     *
     * @param  int  $id
     * @param  JobPostDTO  $dto
     * @return JobPost|null
     */
    public function update(JobPost $jobPost, array $data): JobPost;

    /**
     * Delete a job post.
     *
     * @param  int  $id
     */
    public function delete(JobPost $jobPost): bool;
}
