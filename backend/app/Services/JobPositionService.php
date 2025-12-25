<?php

namespace App\Services;

use App\DataTransferObjects\JobPositionsDTO;
use App\Models\JobPosition;
use App\Repositories\Contracts\JobPositionRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\Log;

class JobPositionService
{
    public function __construct(
        protected JobPositionRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /*
     * Get all Job Positions with optional filters
    */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching Job Poitions: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create new Job position
     */
    public function create(JobPositionsDTO $dto): JobPosition
    {
        try {
            $jobPosition = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'jobPosition',
                description: 'job_position_created',
                subject: $jobPosition,
                properties: [
                    'title' => $jobPosition->title,
                    'grade' => $jobPosition->grade,
                    'department_id' => $jobPosition->department_id,
                    'min_salary' => $jobPosition->min_salary,
                    'max_salary' => $jobPosition->max_salary,
                    'responsibilities' => $jobPosition->responsibilities,
                ]
            );

            Log::info('Job position created successfully', [
                'id' => $jobPosition->id,
                'title' => $jobPosition->title,
                'grade' => $jobPosition->grade,
            ]);

            return $jobPosition;
        } catch (Exception $e) {
            Log::error('Error creating Job postion: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    /**
     * Update the existing position
     */
    public function update(JobPosition $jobPosition, JobPositionsDTO $dto): JobPosition
    {
        try {
            $oldData = $jobPosition->only([
                'title',
                'grade',
                'department_id',
                'min_salary',
                'max_salary',
                'responsibilities',
            ]);

            $updatedJobPosition = $this->repository->update($jobPosition, $dto->toArray());

            $this->activityLogger->log(
                logName: 'jobPosition',
                description: 'job_position_updated',
                subject: $updatedJobPosition,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedJobPosition->only([
                        'title',
                        'grade',
                        'department_id',
                        'min_salary',
                        'max_salary',
                        'responsibilities',
                    ]),
                ]
            );

            Log::info('Job position updated successfully:', [
                'id' => $jobPosition->id,
                'title' => $jobPosition->title,
                'grade' => $jobPosition->grade,
            ]);

            return $updatedJobPosition;
        } catch (Exception $e) {
            Log::error('Error updating job postion: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    /**
     * delete job position
     */
    public function delete(JobPosition $jobPosition): bool
    {
        try {
            $data = $jobPosition->only([
                'title',
                'grade',
                'department_id',
                'min_salary',
                'max_salary',
                'responsibilities',
            ]);

            $deletedJobPosition = $this->repository->delete($jobPosition);

            $this->activityLogger->log(
                logName: 'jobPosition',
                description: 'job_position_deleted',
                subject: $jobPosition,
                properties: $data
            );

            Log::info('Job position deleted successfully', [
                'id' => $jobPosition->id,
                'title' => $jobPosition->title,
                'grade' => $jobPosition->grade,
            ]);

            return $deletedJobPosition;
        } catch (Exception $e) {
            Log::error('Error deleting job postion: '.$e->getMessage());
            throw $e;
        }
    }
}
