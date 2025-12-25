<?php

namespace App\Services;

use App\DataTransferObjects\JobPostDTO;
use App\Models\JobPost;
use App\Repositories\Contracts\JobPostRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\Log;

class JobPostService
{
    public function __construct(
        protected JobPostRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve all job posts with optional filters.
     *
     * @return mixed
     *
     * @throws Exception
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching Job Posts: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a job post by ID.
     *
     * @throws Exception
     */
    public function show(int $jobPostId): JobPost
    {
        try {
            return $this->repository->show($jobPostId);
        } catch (Exception $e) {
            Log::error("Error fetching JobPost ID {$jobPostId}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new job post using the provided DTO.
     *
     * @throws Exception
     */
    public function create(JobPostDTO $dto): JobPost
    {
        try {
            $jobPost = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'jobPost',
                description: 'job_post_created',
                subject: $jobPost,
                properties: [
                    'title' => $jobPost->title,
                    'description' => $jobPost->description,
                    'requirements' => $jobPost->requirements,
                    'responsibilities' => $jobPost->responsibilities,
                    'department_id' => $jobPost->department_id,
                    'job_type' => $jobPost->job_type,
                    'status' => $jobPost->status,
                    'posted_at' => $jobPost->posted_at,
                ]
            );

            Log::info('Job Post created successfully', [
                'id' => $jobPost->id,
                'title' => $jobPost->title,
                'department_id' => $jobPost->department_id,
            ]);

            return $jobPost;
        } catch (Exception $e) {
            Log::error('Error creating Job Post: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given job post using the provided DTO.
     *
     * @throws Exception
     */
    public function update(JobPost $jobPost, JobPostDTO $dto): JobPost
    {
        try {
            $oldData = $jobPost->only([
                'title',
                'description',
                'requirements',
                'responsibilities',
                'department_id',
                'job_type',
                'status',
                'posted_at',
            ]);

            $updatedJobPost = $this->repository->update($jobPost, $dto->toArray());

            $this->activityLogger->log(
                logName: 'jobPost',
                description: 'job_post_updated',
                subject: $updatedJobPost,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedJobPost->only([
                        'title',
                        'description',
                        'requirements',
                        'responsibilities',
                        'department_id',
                        'job_type',
                        'status',
                        'posted_at',
                    ]),
                ]
            );

            Log::info('Job Post updated successfully', [
                'id' => $updatedJobPost->id,
                'title' => $updatedJobPost->title,
                'department_id' => $updatedJobPost->department_id,
            ]);

            return $updatedJobPost;
        } catch (Exception $e) {
            Log::error("Error updating JobPost ID {$jobPost->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given job post instance.
     *
     * @throws Exception
     */
    public function delete(JobPost $jobPost): bool
    {
        try {
            $data = $jobPost->only([
                'title',
                'description',
                'requirements',
                'responsibilities',
                'department_id',
                'job_type',
                'status',
                'posted_at',
            ]);

            $deleted = $this->repository->delete($jobPost);

            $this->activityLogger->log(
                logName: 'jobPost',
                description: 'job_post_deleted',
                subject: $jobPost,
                properties: $data
            );

            Log::info('Job Post deleted successfully', [
                'id' => $jobPost->id,
                'title' => $jobPost->title,
                'department_id' => $jobPost->department_id,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting JobPost ID {$jobPost->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
