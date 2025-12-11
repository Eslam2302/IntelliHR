<?php

namespace App\Repositories\Contracts;

use App\DataTransferObjects\JobPostDto;
use App\Models\JobPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface JobPostRepositoryInterface
{
    /**
     * Get paginated list of job posts.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;

    /**
     * Find a job post by its ID.
     *
     * @param int $id
     * @return JobPost|null
     */
    public function show(int $jobPostId): JobPost;

    /**
     * Create a new job post.
     *
     * @param JobPostDto $dto
     * @return JobPost
     */
    public function create(array $data): JobPost;

    /**
     * Update an existing job post.
     *
     * @param int $id
     * @param JobPostDto $dto
     * @return JobPost|null
     */
    public function update(JobPost $jobPost, array $data): JobPost;

    /**
     * Delete a job post.
     *
     * @param int $id
     * @return bool
     */
    public function delete(JobPost $jobPost): bool;
}
