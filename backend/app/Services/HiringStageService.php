<?php

namespace App\Services;

use App\DataTransferObjects\HiringStageDTO;
use App\Models\HiringStage;
use App\Repositories\Contracts\HiringStageRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Exception;

class HiringStageService
{
    public function __construct(
        protected HiringStageRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve paginated list of hiring stages.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (Exception $e) {
            Log::error('Error fetching Hiring Stages: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a hiring stage by ID.
     *
     * @param int $hiringStageId
     * @return HiringStage
     * @throws Exception
     */
    public function show(int $hiringStageId): HiringStage
    {
        try {
            return $this->repository->show($hiringStageId);
        } catch (Exception $e) {
            Log::error("Error fetching Hiring Stage ID {$hiringStageId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all hiring stages for a specific job post.
     *
     * @param int $jobPostId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByJobPost(int $jobPostId)
    {
        return $this->repository->getByJobPost($jobPostId);
    }


    /**
     * Create a new hiring stage using the provided DTO.
     *
     * @param HiringStageDTO $dto
     * @return HiringStage
     * @throws Exception
     */
    public function create(HiringStageDTO $dto): HiringStage
    {
        try {
            $hiringStage = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'hiringStage',
                description: 'hiring_stage_created',
                subject: $hiringStage,
                properties: [
                    'job_id' => $hiringStage->job_id,
                    'stage_name' => $hiringStage->stage_name,
                    'order' => $hiringStage->order,
                ]
            );

            Log::info("Hiring Stage created successfully", [
                'id' => $hiringStage->id,
                'job_id' => $hiringStage->job_id,
                'stage_name' => $hiringStage->stage_name,
                'order' => $hiringStage->order,
            ]);

            return $hiringStage;
        } catch (Exception $e) {
            Log::error('Error creating Hiring Stage: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given hiring stage using the provided DTO.
     *
     * @param HiringStage $hiringStage
     * @param HiringStageDTO $dto
     * @return HiringStage
     * @throws Exception
     */
    public function update(HiringStage $hiringStage, HiringStageDTO $dto): HiringStage
    {
        try {
            $oldData = $hiringStage->only([
                'job_id',
                'stage_name',
                'order',
            ]);

            $updatedStage = $this->repository->update($hiringStage, $dto->toArray());

            $this->activityLogger->log(
                logName: 'hiringStage',
                description: 'hiring_stage_updated',
                subject: $updatedStage,
                properties: [
                    'before' => $oldData,
                    'after'  => $updatedStage->only([
                        'job_id',
                        'stage_name',
                        'order',
                    ]),
                ]
            );

            Log::info("Hiring Stage updated successfully", [
                'id' => $updatedStage->id,
                'job_id' => $updatedStage->job_id,
                'stage_name' => $updatedStage->stage_name,
                'order' => $updatedStage->order,
            ]);

            return $updatedStage;
        } catch (Exception $e) {
            Log::error("Error updating Hiring Stage ID {$hiringStage->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given hiring stage instance.
     *
     * @param HiringStage $hiringStage
     * @return bool
     * @throws Exception
     */
    public function delete(HiringStage $hiringStage): bool
    {
        try {
            $data = $hiringStage->only([
                'job_id',
                'stage_name',
                'order',
            ]);

            $deleted = $this->repository->delete($hiringStage);

            $this->activityLogger->log(
                logName: 'hiringStage',
                description: 'hiring_stage_deleted',
                subject: $hiringStage,
                properties: $data
            );

            Log::info("Hiring Stage deleted successfully", [
                'id' => $hiringStage->id,
                'job_id' => $hiringStage->job_id,
                'stage_name' => $hiringStage->stage_name,
                'order' => $hiringStage->order,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting Hiring Stage ID {$hiringStage->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
