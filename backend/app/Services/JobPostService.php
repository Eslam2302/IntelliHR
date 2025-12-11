<?php

namespace App\Services;

use App\DataTransferObjects\JobPostDTO;
use App\Models\JobPost;
use App\Repositories\Contracts\JobPostRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class JobPostService
{
    public function __construct(
        protected JobPostRepositoryInterface $repository
    ) {}

    /**
     * Retrieve paginated list of job posts.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching Job Posts: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a job post by ID.
     *
     * @param int $jobPostId
     * @return JobPost
     * @throws \Exception
     */
    public function show(int $jobPostId): JobPost
    {
        try {
            return $this->repository->show($jobPostId);
        } catch (\Exception $e) {
            Log::error("Error fetching JobPost ID {$jobPostId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new job post using the provided DTO.
     *
     * @param JobPostDTO $dto
     * @return JobPost
     * @throws \Exception
     */
    public function create(JobPostDTO $dto): JobPost
    {
        try {
            $jobPost = $this->repository->create($dto->toArray());

            Log::info("Job Post created successfully", [
                'id' => $jobPost->id,
                'title' => $jobPost->title,
                'department_id' => $jobPost->department_id,
            ]);

            return $jobPost;
        } catch (\Exception $e) {
            Log::error('Error creating Job Post: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given job post using the provided DTO.
     *
     * @param JobPost $jobPost
     * @param JobPostDTO $dto
     * @return JobPost
     * @throws \Exception
     */
    public function update(JobPost $jobPost, JobPostDTO $dto): JobPost
    {
        try {
            $updatedJobPost = $this->repository->update($jobPost, $dto->toArray());

            Log::info("Job Post updated successfully", [
                'id' => $updatedJobPost->id,
                'title' => $updatedJobPost->title,
                'department_id' => $updatedJobPost->department_id,
            ]);

            return $updatedJobPost;
        } catch (\Exception $e) {
            Log::error("Error updating JobPost ID {$jobPost->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given job post instance.
     *
     * @param JobPost $jobPost
     * @return bool
     * @throws \Exception
     */
    public function delete(JobPost $jobPost): bool
    {
        try {
            $deleted = $this->repository->delete($jobPost);

            Log::info("Job Post deleted successfully", [
                'id' => $jobPost->id,
                'title' => $jobPost->title,
                'department_id' => $jobPost->department_id,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting JobPost ID {$jobPost->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
